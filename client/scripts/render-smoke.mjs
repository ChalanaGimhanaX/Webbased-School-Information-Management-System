import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  for (const name of ['Students', 'Teachers', 'Attendance', 'Exams', 'Timetable', 'Fees']) {
    const { default: Page } = await server.ssrLoadModule(`/src/pages/${name}.jsx`);
    const html = renderToStaticMarkup(React.createElement(Page));
    if (!html.includes('<') || html.includes('undefined')) throw new Error(`${name} rendered invalid initial content`);
    console.log(`${name}: initial render passed`);
  }
  const { default: Records } = await server.ssrLoadModule('/src/components/RecordMaintenance.jsx');
  const html = renderToStaticMarkup(React.createElement(Records, {
    title: 'Classes', rows: [{id: 1, className: '10-A'}], fields: [],
    columns: [{header: 'Class', accessor: 'className'}], onSave: async () => {}, onDelete: async () => {},
  }));
  if (!html.includes('10-A') || !html.includes('Edit') || !html.includes('Remove')) throw new Error('Record controls did not render');
  console.log('Record maintenance: row and controls passed');
} finally {
  await server.close();
}
