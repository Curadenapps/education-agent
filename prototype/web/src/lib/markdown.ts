/**
 * Small Markdown parser for agent documents. One parse feeds two renderers:
 * the React view in the document panel and the HTML used for downloads,
 * so the download looks like the preview.
 *
 * Supports: # headings, paragraphs, - / 1. lists, - [ ] checklists, | tables |,
 * > quotes, ---, **bold**, *italic*, and [… REVIEW REQUIRED] tags.
 */

export type Block =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: { text: string; checked: boolean | null }[] }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'quote'; text: string }
  | { type: 'rule' };

export type Inline =
  | { type: 'text'; text: string }
  | { type: 'strong'; text: string }
  | { type: 'em'; text: string }
  | { type: 'review'; text: string };

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim());

export function parse(md: string): Block[] {
  const lines = md.replace(/\r/g, '').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      blocks.push({ type: 'heading', level: h[1].length as 1 | 2 | 3, text: h[2] });
      i++;
      continue;
    }

    if (/^-{3,}\s*$/.test(line)) {
      blocks.push({ type: 'rule' });
      i++;
      continue;
    }

    if (line.trim().startsWith('|') && lines[i + 1] && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const header = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(cells(lines[i++]));
      blocks.push({ type: 'table', header, rows });
      continue;
    }

    if (/^\s*([-*•]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: { text: string; checked: boolean | null }[] = [];
      while (i < lines.length && /^\s*([-*•]|\d+\.)\s+/.test(lines[i])) {
        const raw = lines[i].replace(/^\s*([-*•]|\d+\.)\s+/, '');
        const box = /^\[( |x|X)\]\s+/.exec(raw);
        items.push({ text: box ? raw.slice(box[0].length) : raw, checked: box ? box[1] !== ' ' : null });
        i++;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    if (line.startsWith('>')) {
      const text: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) text.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push({ type: 'quote', text: text.join(' ') });
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3}\s|>|\s*([-*•]|\d+\.)\s|\s*\|)/.test(lines[i]) &&
      !/^-{3,}\s*$/.test(lines[i])
    ) {
      para.push(lines[i++]);
    }
    blocks.push({ type: 'paragraph', text: para.join('\n') });
  }
  return blocks;
}

export function inline(text: string): Inline[] {
  return text
    .split(/(\[[A-Z ]+REQUIRED\]|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g)
    .filter(Boolean)
    .map((part): Inline => {
      if (/^\[[A-Z ]+REQUIRED\]$/.test(part)) return { type: 'review', text: part.slice(1, -1) };
      if (part.startsWith('**')) return { type: 'strong', text: part.slice(2, -2) };
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return { type: 'em', text: part.slice(1, -1) };
      return { type: 'text', text: part };
    });
}

/* ── HTML renderer (downloads) ─────────────────────── */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inlineHtml(text: string): string {
  return inline(text)
    .map((n) => {
      if (n.type === 'strong') return `<strong>${esc(n.text)}</strong>`;
      if (n.type === 'em') return `<em>${esc(n.text)}</em>`;
      if (n.type === 'review') return `<span class="review">${esc(n.text)}</span>`;
      return esc(n.text).replace(/\n/g, '<br>');
    })
    .join('');
}

export function toHtml(blocks: Block[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case 'heading':
          return `<h${b.level}>${inlineHtml(b.text)}</h${b.level}>`;
        case 'paragraph':
          return `<p>${inlineHtml(b.text)}</p>`;
        case 'quote':
          return `<blockquote>${inlineHtml(b.text)}</blockquote>`;
        case 'rule':
          return '<hr>';
        case 'table':
          return `<table><thead><tr>${b.header.map((c) => `<th>${inlineHtml(c)}</th>`).join('')}</tr></thead><tbody>${b.rows
            .map((r) => `<tr>${r.map((c) => `<td>${inlineHtml(c)}</td>`).join('')}</tr>`)
            .join('')}</tbody></table>`;
        case 'list': {
          const tag = b.ordered ? 'ol' : 'ul';
          const isCheck = b.items.some((it) => it.checked !== null);
          return `<${tag}${isCheck ? ' class="checklist"' : ''}>${b.items
            .map((it) => `<li>${it.checked === null ? '' : it.checked ? '☑ ' : '☐ '}${inlineHtml(it.text)}</li>`)
            .join('')}</${tag}>`;
        }
      }
    })
    .join('\n');
}
