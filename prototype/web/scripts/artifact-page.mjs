// Turns dist/index.html into a page body for a hosted preview (e.g. a claude.ai artifact),
// which supplies its own <!doctype>, <html>, <head> and <body> wrapper.
//
// Uses positions, not regexes: the bundled JS contains HTML templates (export.ts)
// with their own <head> and <body> text, so the real tags are the ones OUTSIDE the
// inline <script>. Usage: node scripts/artifact-page.mjs [out-file]
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const out = process.argv[2] ?? new URL('../dist/artifact.html', import.meta.url);

const scriptStart = html.indexOf('<script type="module"');
const scriptEnd = html.indexOf('</script>', scriptStart) + '</script>'.length;
if (scriptStart < 0 || scriptEnd < scriptStart) throw new Error('Inline module script not found');

const script = html.slice(scriptStart, scriptEnd);
const rest = html.slice(0, scriptStart) + html.slice(scriptEnd); // markup with the script removed

const headInner = rest.slice(rest.indexOf('<head>') + 6, rest.indexOf('</head>'));
const bodyInner = rest.slice(rest.indexOf('<body>') + 6, rest.lastIndexOf('</body>'));
for (const [name, part] of [['head', headInner], ['body', bodyInner]]) {
  if (/<\/?(html|head|body)\b/i.test(part)) throw new Error(`Unexpected document tag left in ${name}`);
}

const page = [headInner.replace(/<meta[^>]*>\s*/g, '').trim(), bodyInner.trim(), script].join('\n') + '\n';
writeFileSync(out, page);
console.log(`artifact page: ${page.length} bytes`);
