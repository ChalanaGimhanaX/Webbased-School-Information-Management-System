// Server-side render smoke test for the restyled shell, dashboards and the student AI assistant.
// Run from client/: node scripts/assistant-smoke.mjs
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const h = React.createElement;
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
let failures = 0;

function check(name, condition, detail = '') {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures++;
    console.error(`FAIL ${name}${detail ? ` - ${detail}` : ''}`);
  }
}

try {
  // Imported natively (not via ssrLoadModule) - vite externalises deps, so this is the same instance the pages use.
  const { MemoryRouter, Routes, Route } = await import('react-router-dom');
  const { AuthContext } = await server.ssrLoadModule('/src/context/AuthContext.jsx');
  const { default: DashboardLayout } = await server.ssrLoadModule('/src/layouts/DashboardLayout.jsx');
  const { default: Dashboard } = await server.ssrLoadModule('/src/pages/Dashboard.jsx');
  const { default: Assistant } = await server.ssrLoadModule('/src/pages/Assistant.jsx');
  const { default: Markdown } = await server.ssrLoadModule('/src/components/assistant/Markdown.jsx');
  const { default: Login } = await server.ssrLoadModule('/src/pages/Login.jsx');
  const { toHistory, describeError } = await server.ssrLoadModule('/src/components/assistant/useAssistantChat.js');

  const renderAt = (path, user, element) =>
    renderToStaticMarkup(
      h(AuthContext.Provider, { value: { user, login: async () => {}, logout: () => {}, loading: false } },
        h(MemoryRouter, { initialEntries: [path] },
          h(Routes, null,
            h(Route, { path: '/', element: h(DashboardLayout) },
              h(Route, { index: true, element: h(Dashboard) }),
              h(Route, { path: 'assistant', element: element ?? h(Assistant) })),
            h(Route, { path: '/login', element: h('p', null, 'LOGIN-PAGE') })))));

  // 1. Shell + dashboard for every role; the AI assistant must only surface for students
  for (const [username, role] of [['admin', 'ADMIN'], ['teacher1', 'TEACHER'], ['head_academic', 'HEAD_OF_ACADEMIC'], ['parent1', 'PARENT'], ['student1', 'STUDENT']]) {
    const html = renderAt('/', { username, role });
    check(`${role}: dashboard renders`, html.length > 2000 && !html.includes('undefined') && !html.includes('NaN'), `len=${html.length}`);
    const mentionsAssistant = html.includes('Study Buddy');
    check(`${role}: assistant visible only for students`, role === 'STUDENT' ? mentionsAssistant : !mentionsAssistant);
    if (role === 'STUDENT') {
      check('STUDENT: floating chat launcher present', html.includes('Open Study Buddy AI assistant'));
      check('STUDENT: nav link to /assistant', html.includes('href="/assistant"'));
    } else {
      check(`${role}: no /assistant nav link`, !html.includes('href="/assistant"'));
    }
  }

  // 2. Unauthenticated users get a <Navigate to="/login"> (which renders nothing during static SSR) - no shell leaks
  check('anonymous: protected shell not rendered', renderAt('/', null) === '');

  // 3. Assistant page: student gets the chat, others get redirected away (no composer)
  const studentPage = renderAt('/assistant', { username: 'student1', role: 'STUDENT' });
  check('STUDENT /assistant: composer rendered', studentPage.includes('<textarea') && studentPage.includes('Message Study Buddy'));
  check('STUDENT /assistant: no floating launcher on the full page', !studentPage.includes('Open Study Buddy AI assistant'));
  check('STUDENT /assistant: greets the user', studentPage.includes('Hi student1!'));
  const adminPage = renderAt('/assistant', { username: 'admin', role: 'ADMIN' });
  check('ADMIN /assistant: redirected, no composer', !adminPage.includes('<textarea') && !adminPage.includes('Message Study Buddy'));

  // 4. Markdown renderer safety + features
  const md = (text) => renderToStaticMarkup(h(Markdown, { text }));
  const table = md('| Subject | Marks |\n|---|:--:|\n| **Maths** | 78 |\n| Science | 64 |');
  check('Markdown: table rendered', table.includes('<table') && table.includes('<th') && table.includes('<strong') && table.includes('64'));
  const evil = md('[click](javascript:alert(1)) and [ok](https://example.com) <script>alert(1)</script> <img src=x onerror=alert(1)>');
  check('Markdown: javascript: link stays text', !evil.includes('href="javascript') && evil.includes('[click](javascript:alert(1))'));
  check('Markdown: https link becomes safe anchor', evil.includes('href="https://example.com"') && evil.includes('rel="noopener noreferrer"'));
  check('Markdown: raw HTML escaped', !evil.includes('<script') && !evil.includes('<img') && evil.includes('&lt;script&gt;'));
  const code = md('Try:\n```js\nconst a = 1 < 2;\n```\n1. one\n2. two\n- bullet');
  check('Markdown: code block, ordered + bullet lists', code.includes('<pre') && code.includes('1 &lt; 2') && code.includes('<ol') && code.includes('<ul'));
  check('Markdown: empty / null input', md('') === md(null) && !md(undefined).includes('undefined'));

  // 5. History payload respects backend limits (12 turns, 4000 chars, no error bubbles)
  const msgs = Array.from({ length: 20 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` }));
  msgs.push({ role: 'assistant', content: 'oops', error: true }, { role: 'user', content: 'x'.repeat(5000) });
  const hist = toHistory(msgs);
  check('toHistory: bounded to 12 turns, errors dropped, long turns truncated',
    hist.length === 12 && hist.every((t) => !('error' in t) && t.content.length <= 4000) && !hist.some((t) => t.content === 'oops'));
  check('describeError: 503 detail surfaced', describeError({ response: { status: 503, data: { detail: 'AI is not configured' } } }) === 'AI is not configured');
  check('describeError: network error', /Cannot reach/.test(describeError({})));

  // 6. Login page still renders with the new design
  const login = renderToStaticMarkup(
    h(AuthContext.Provider, { value: { user: null, login: async () => {}, logout: () => {}, loading: false } },
      h(MemoryRouter, null, h(Login))));
  check('Login renders form', login.includes('<form') && login.includes('type="password"'));
} catch (err) {
  failures++;
  console.error('FAIL smoke script crashed:', err);
} finally {
  await server.close();
}

if (failures) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log('\nAll assistant/dashboard smoke checks passed');
