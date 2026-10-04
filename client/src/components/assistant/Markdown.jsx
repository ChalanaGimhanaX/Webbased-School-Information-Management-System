import React from 'react';

/*
 * Minimal, safe Markdown renderer for AI replies. Builds React elements only (never
 * dangerouslySetInnerHTML), so model output cannot inject HTML or scripts.
 * Supports: headings, bullet/numbered lists, fenced code, tables, **bold**, *italic*, `code`
 * and [links](https://…) - links are only created for http(s) URLs; anything else stays plain text.
 */

const INLINE = /(\[[^\]\n]+\]\([^)\s]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;
const LINK = /^\[([^\]\n]+)\]\(([^)\s]+)\)$/;

function renderInline(text, keyPrefix) {
  const out = [];
  let last = 0;
  let i = 0;
  String(text).replace(INLINE, (match, _g, offset) => {
    if (offset > last) out.push(text.slice(last, offset));
    const key = `${keyPrefix}-${i++}`;
    const link = match.match(LINK);
    if (link) {
      const href = link[2];
      if (/^https?:\/\//i.test(href)) {
        out.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary">
            {link[1]}
          </a>,
        );
      } else {
        out.push(match); // unsafe scheme (javascript:, data:, …) -> shown as text
      }
    } else if (match.startsWith('**')) {
      out.push(<strong key={key} className="font-semibold text-on-surface">{match.slice(2, -2)}</strong>);
    } else if (match.startsWith('`')) {
      out.push(<code key={key} className="rounded bg-surface-container px-1 py-0.5 font-mono text-[0.85em] text-primary">{match.slice(1, -1)}</code>);
    } else {
      out.push(<em key={key}>{match.slice(1, -1)}</em>);
    }
    last = offset + match.length;
    return match;
  });
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const isTableRow = (line) => /^\s*\|.*\|\s*$/.test(line);
const isTableDivider = (line) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);
const splitRow = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

function parseBlocks(input) {
  const lines = String(input ?? '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let para = [];
  let list = null;
  let code = null;

  const flushPara = () => { if (para.length) { blocks.push({ type: 'p', text: para.join(' ') }); para = []; } };
  const flushList = () => { if (list) { blocks.push(list); list = null; } };

  for (let idx = 0; idx < lines.length; idx++) {
    const raw = lines[idx];
    const line = raw.trimEnd();

    if (code) {
      if (/^\s*```/.test(line)) { blocks.push(code); code = null; } else code.lines.push(raw);
      continue;
    }
    if (/^\s*```/.test(line)) { flushPara(); flushList(); code = { type: 'code', lines: [] }; continue; }

    // GitHub-style table: header row, divider row, then body rows
    if (isTableRow(line) && idx + 1 < lines.length && isTableDivider(lines[idx + 1])) {
      flushPara(); flushList();
      const header = splitRow(line);
      const rows = [];
      idx += 2;
      while (idx < lines.length && isTableRow(lines[idx])) { rows.push(splitRow(lines[idx])); idx++; }
      idx--;
      blocks.push({ type: 'table', header, rows });
      continue;
    }

    const heading = line.match(/^\s*(#{1,4})\s+(.*)$/);
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)$/);

    if (heading) {
      flushPara(); flushList();
      blocks.push({ type: 'h', level: heading[1].length, text: heading[2] });
    } else if (bullet) {
      flushPara();
      if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] }; }
      list.items.push(bullet[1]);
    } else if (numbered) {
      flushPara();
      if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', start: Number(numbered[1]), items: [] }; }
      list.items.push(numbered[2]);
    } else if (line.trim() === '') {
      flushPara(); flushList();
    } else if (list && /^\s{2,}\S/.test(raw)) {
      list.items[list.items.length - 1] += ` ${line.trim()}`; // continuation of a list item
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  if (code) blocks.push(code);
  flushPara();
  flushList();
  return blocks;
}

const Markdown = ({ text }) => {
  const blocks = parseBlocks(text);
  return (
    <div className="space-y-2 break-words">
      {blocks.map((b, i) => {
        const key = `b${i}`;
        switch (b.type) {
          case 'h':
            return <p key={key} className="pt-1 text-label-lg font-bold text-on-surface">{renderInline(b.text, key)}</p>;
          case 'ul':
            return (
              <ul key={key} className="list-disc space-y-1 pl-5 marker:text-primary">
                {b.items.map((item, j) => <li key={j}>{renderInline(item, `${key}-${j}`)}</li>)}
              </ul>
            );
          case 'ol':
            return (
              <ol key={key} start={b.start} className="list-decimal space-y-1 pl-5 marker:font-semibold marker:text-primary">
                {b.items.map((item, j) => <li key={j}>{renderInline(item, `${key}-${j}`)}</li>)}
              </ol>
            );
          case 'code':
            return (
              <pre key={key} className="thin-scroll overflow-x-auto rounded-lg bg-inverse-surface p-3 font-mono text-[12px] leading-5 text-inverse-on-surface">
                {b.lines.join('\n')}
              </pre>
            );
          case 'table':
            return (
              <div key={key} className="thin-scroll overflow-x-auto rounded-lg border border-outline-variant/40">
                <table className="w-full border-collapse text-left text-body-sm">
                  <thead className="bg-surface-container-low">
                    <tr>{b.header.map((h, j) => <th key={j} className="px-2.5 py-1.5 font-semibold text-on-surface">{renderInline(h, `${key}-h${j}`)}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {b.rows.map((row, r) => (
                      <tr key={r} className="transition-colors hover:bg-surface-container-low/60">
                        {b.header.map((_, c) => <td key={c} className="px-2.5 py-1.5 align-top">{renderInline(row[c] ?? '', `${key}-${r}-${c}`)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return <p key={key}>{renderInline(b.text, key)}</p>;
        }
      })}
    </div>
  );
};

export default Markdown;

