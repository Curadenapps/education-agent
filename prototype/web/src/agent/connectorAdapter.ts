/**
 * Live adapter for the hosted preview (claude.ai artifact).
 *
 * Runs entirely in the page, on the VIEWER's own claude.ai account:
 *  - `sample` asks Claude, with three page tools it may call;
 *  - the tools read the Notion knowledge pages and their Google Drive source
 *    documents through the viewer's Notion and Google Drive connectors (`mcp`).
 *
 * Knowledge flow (docs/SYSTEM-OVERVIEW.md): Drive source documents → Notion
 * knowledge pages → this adapter → the UI. The persona's routing table picks
 * the pages; Drive wins on conflict. "Based on" lists only what was actually read.
 *
 * Tool names and result shapes were checked against real read-only calls:
 * Notion `notion-fetch` → { title, url, text } where `text` wraps <properties> and
 * <content>; `notion-search` → { results: [{ id, title, highlight }] }; Google
 * Drive `read_file_content` → file text (shape not documented; read defensively).
 */
import persona from '../../../../agents/education-agent-persona.md?raw';
import procedures from '../../../../agents/education-agent-procedures.md?raw';
import { DOC_TYPE_LABEL } from './procedures';
import type { AgentAdapter, AgentDocument, AgentEvent, AgentRequest, ChatMessage, ProcedureId, Source } from './types';

/* Minimal local typings for the two capabilities (full contract: artifact-capabilities 0.2.75). */
interface SampleTool {
  name: string;
  description: string;
  inputSchema?: { type: 'object'; properties?: Record<string, unknown>; required?: string[] };
  execute(input: Record<string, unknown>, ctx: { signal: AbortSignal }): unknown;
}
type SampleFn = ((
  input: string | { role: 'user' | 'assistant'; content: string }[],
  opts?: {
    onText?: (u: { text: string; delta: string }) => void;
    signal?: AbortSignal;
    tools?: SampleTool[];
    modelTier?: 'quick' | 'default' | 'complex';
    cache?: boolean;
  },
) => Promise<{ text: string; truncated: boolean }>) & { limits(): Promise<{ tools?: { maxCount: number } }> };
interface McpNs {
  callTool(server: string, tool: string, input?: unknown, opts?: { signal?: AbortSignal; cache?: unknown }): Promise<{ payload?: unknown; content: { type: string; text?: string }[] }>;
}
interface ClaudeRuntime {
  use(name: string): Promise<unknown>;
}

export const NOTION = 'Notion';
export const DRIVE = 'Google Drive';
export const ASSETS_DB = 'collection://322aec0f-c060-4f0c-aa21-9a56666493c2';

/** The capabilities this adapter needs; declared when the page is published. */
export const CAPABILITIES = {
  sample: {},
  mcp: {
    servers: [
      { server: NOTION, tools: ['notion-fetch', 'notion-search'] },
      { server: DRIVE, tools: ['read_file_content'] },
    ],
  },
};

const MAX_TOOL_TEXT = 26_000; // sample tool results are capped at 32 KB

/* ── Reading Notion and Drive ─────────────────────────────────────────── */

const textOf = (r: { payload?: unknown; content: { type: string; text?: string }[] }): string => {
  const p = r.payload;
  if (typeof p === 'string') return p;
  if (p && typeof p === 'object') {
    const o = p as Record<string, unknown>;
    for (const k of ['text', 'content', 'body']) if (typeof o[k] === 'string') return o[k] as string;
    return JSON.stringify(p);
  }
  return r.content.map((c) => c.text ?? '').join('\n');
};

const between = (s: string, open: string, close: string) => {
  const a = s.indexOf(open);
  const b = s.indexOf(close, a + open.length);
  return a >= 0 && b > a ? s.slice(a + open.length, b) : '';
};

const clip = (s: string) => (s.length > MAX_TOOL_TEXT ? s.slice(0, MAX_TOOL_TEXT) + '\n\n[…cut for length]' : s);

export interface KnowledgePage {
  id: string;
  title: string;
  url: string;
  status: string;
  content: string;
  driveDocs: { title: string; fileId: string }[];
}

/** Parses a notion-fetch payload into the parts the agent needs (drops the schema dump). */
export function parseNotionPage(id: string, payload: unknown): KnowledgePage {
  const o = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
  const text = typeof o.text === 'string' ? o.text : typeof payload === 'string' ? payload : '';
  let props: Record<string, unknown> = {};
  try {
    props = JSON.parse(between(text, '<properties>', '</properties>') || '{}');
  } catch {
    /* properties are optional */
  }
  const content = between(text, '<content>', '</content>').trim() || text;
  const driveDocs = [...content.matchAll(/\[([^\]]+)\]\(https:\/\/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]{10,})[^)]*\)/g)].map((m) => ({
    title: m[1],
    fileId: m[2],
  }));
  return {
    id,
    title: String(o.title ?? props.Title ?? 'Untitled page'),
    url: String(o.url ?? props.url ?? ''),
    status: String(props.Status ?? 'unknown'),
    content,
    driveDocs,
  };
}

/* ── Prompt ───────────────────────────────────────────────────────────── */

const RULES = `You are the iTOP Assistant inside a simple app used by dentists, hygienists and iTOP educators, many of whom are not used to chat tools.

Follow the system prompt and the output procedures below. They define who you are, the 8 non-negotiable rules, which Notion knowledge page to read for which question, and the document templates.

HOW TO WORK IN THIS APP
- Before answering any knowledge question, call read_knowledge_page for the relevant page(s) from the routing table (use the page ID). If no row fits, call search_knowledge, then read the best match.
- Each page result has a status. Never use pages with status "Archived" or "Outdated". Pages "In Review" or "Draft" may be used, but for documents add the flag "Based on knowledge still in review".
- When an answer rests on a specific fact, number, product code or protocol step, and the page lists Drive source documents, call read_source_document on the most relevant one and check it. If the Drive document disagrees with the page, the Drive document wins: use it and say so.
- If nothing in the knowledge base covers the question, say so plainly. Never invent protocols, numbers, courses or contacts.
- Do not narrate your tool use ("Let me check…"). Write only the final reply.

HOW TO WRITE THE REPLY
- Plain, warm, short sentences. No jargon about tools, pages, guardrails or JSON. Short paragraphs; numbered steps where order matters.
- For a question: answer in at most about 150 words.
- For a document (SOP, lesson plan, seminar plan, feedback summary, patient session sheet): write 1–3 sentences saying what you made, then the document in exactly this block, and nothing after it:

:::document
type: <one of: sop, lesson, event, feedback, session>
title: <short title>
check: <PASS or FLAG>
flags: <reasons it needs checking, separated by "; " — empty if PASS>
---
<the document in Markdown, following the matching template; do not repeat the title as a heading>
:::

- Mark patient-facing content [CLINICIAN REVIEW REQUIRED] and lesson-plan instructor notes [INSTRUCTOR REVIEW REQUIRED], as the rules say. Any FLAG reason goes in "flags".
- Do not add a Sources or Guardrail footer; the app adds them.

=== SYSTEM PROMPT (agents/education-agent-persona.md) ===
${persona}

=== OUTPUT PROCEDURES (agents/education-agent-procedures.md) ===
${procedures}`;

const DOC_TYPES: ProcedureId[] = ['sop', 'lesson', 'event', 'feedback', 'session'];

/** Splits Claude's reply into the chat text and an optional document. */
export function splitReply(text: string): {
  chat: string;
  writingDoc: boolean;
  doc?: { type: ProcedureId; title: string; check: 'PASS' | 'FLAG'; flags: string[]; body: string };
} {
  const start = text.indexOf(':::document');
  if (start < 0) return { chat: text.trim(), writingDoc: false };
  const chat = text.slice(0, start).trim();
  const rest = text.slice(start + ':::document'.length);
  const end = rest.lastIndexOf('\n:::');
  const sep = rest.indexOf('\n---');
  if (end < 0 || sep < 0 || sep > end) return { chat, writingDoc: true };
  const head = Object.fromEntries(
    rest
      .slice(0, sep)
      .split('\n')
      .map((l) => l.match(/^\s*(\w+)\s*:\s*(.*)$/))
      .filter((m): m is RegExpMatchArray => !!m)
      .map((m) => [m[1].toLowerCase(), m[2].trim()]),
  );
  const type = (DOC_TYPES.includes(head.type as ProcedureId) ? head.type : 'sop') as ProcedureId;
  return {
    chat,
    writingDoc: false,
    doc: {
      type,
      title: head.title || DOC_TYPE_LABEL[type],
      check: head.check?.toUpperCase() === 'PASS' ? 'PASS' : 'FLAG',
      flags: (head.flags || '').split(';').map((f: string) => f.trim()).filter(Boolean),
      body: rest.slice(sep + 4, end).trim(),
    },
  };
}

function turnsFor(request: AgentRequest, documents: Map<string, AgentDocument>): { role: 'user' | 'assistant'; content: string }[] {
  const userText = (m: ChatMessage) => {
    const files = m.attachments?.length
      ? `\n\n(The person attached: ${m.attachments.map((a) => a.name).join(', ')}. This prototype cannot read attached files yet; say so if they matter.)`
      : '';
    return (m.text || '(no message)') + files;
  };
  const history = request.messages.slice(-12).map((m) => {
    if (m.role === 'user') return { role: 'user' as const, content: userText(m) };
    const doc = m.documentId ? documents.get(m.documentId) : undefined;
    const content = (m.text || '(no reply)') + (doc ? `\n\n[You created the document "${doc.title}".]` : '');
    return { role: 'assistant' as const, content };
  });
  if (request.reformat) {
    const { document, style } = request.reformat;
    const ask = {
      shorter: 'Make a shorter version with only the essentials.',
      checklist: 'Turn it into a tick-box checklist for use on the day.',
      patient: 'Rewrite it as a plain-language patient handout. It is patient-facing.',
    }[style];
    history[history.length - 1] = {
      role: 'user',
      content: `${ask}\n\nKeep the facts and sources the same; do not add new clinical content.\n\nCurrent document "${document.title}":\n\n${document.body}`,
    };
  }
  return [{ role: 'user', content: RULES }, ...history.filter((t) => t.content.trim())];
}

/* ── Adapter ──────────────────────────────────────────────────────────── */

const FRIENDLY_SAMPLE_ERROR: Record<string, string> = {
  not_granted: 'Live answers need your permission to use Claude. Reload the page and choose Allow.',
  sampling_disabled: 'Claude is not available on this account.',
  rate_limited: 'Too many questions in a short time. Please wait a minute and try again.',
  session_expired: 'Please sign in to claude.ai again, then reload this page.',
  refused: 'Claude could not answer that. Try asking it a different way.',
  prompt_too_large: 'That was too much to read at once. Try a shorter question.',
  empty_completion: 'No answer came back. Try asking it a different way.',
};

const FRIENDLY_MCP_ERROR: Record<string, string> = {
  server_not_connected: 'is not connected. Add it in claude.ai Settings → Connectors.',
  needs_reauth: 'needs reconnecting. Reconnect it in claude.ai Settings → Connectors.',
  not_in_manifest: 'was not allowed for this page. Allow it from the page’s Permissions menu.',
  selection_required: 'has more than one account connected. Choose one when the page asks.',
  blocked_by_policy: 'is blocked by your organisation’s settings.',
};

export function createConnectorAdapter(sample: SampleFn, mcp: McpNs): AgentAdapter {
  const seenDocs = new Map<string, AgentDocument>();

  return {
    label: 'Live',
    live: true,
    async *send(request, signal) {
      // Bridge sample()'s callbacks to this async stream.
      const queue: AgentEvent[] = [];
      let wake: (() => void) | null = null;
      const push = (e: AgentEvent) => {
        queue.push(e);
        wake?.();
      };

      const sources = new Map<string, Source>();
      const connectorProblems = new Set<string>();
      let shown = '';

      /** Calls a connector tool; maps fixable connector problems to a note for the reader. */
      const callRaw = async (server: string, tool: string, input: unknown, ctxSignal: AbortSignal) => {
        try {
          return await mcp.callTool(server, tool, input, { signal: ctxSignal });
        } catch (e) {
          const code = (e as { code?: string }).code ?? 'upstream_error';
          if (FRIENDLY_MCP_ERROR[code]) connectorProblems.add(`${server} ${FRIENDLY_MCP_ERROR[code]}`);
          throw new Error(`${server} could not be read (${code}).`);
        }
      };
      const call = async (server: string, tool: string, input: unknown, ctxSignal: AbortSignal) =>
        textOf(await callRaw(server, tool, input, ctxSignal));

      const tools: SampleTool[] = [
        {
          name: 'read_knowledge_page',
          description:
            'Reads one iTOP knowledge page from the Notion Education Hub. Returns its title, status, content and the Google Drive source documents it is built from (with file IDs).',
          inputSchema: { type: 'object', properties: { page_id: { type: 'string', description: 'Notion page ID from the routing table or a search result' } }, required: ['page_id'] },
          async execute(input, ctx) {
            const id = String(input.page_id ?? '').trim();
            push({ type: 'status', text: 'Reading the iTOP knowledge base…' });
            const r = await callRaw(NOTION, 'notion-fetch', { id }, ctx.signal);
            const page = parseNotionPage(id, r.payload ?? textOf(r));
            push({ type: 'status', text: `Reading “${page.title}”…` });
            if (!/archived|outdated/i.test(page.status)) sources.set(page.id, { title: page.title, kind: 'knowledge', url: page.url });
            return clip(
              `TITLE: ${page.title}\nSTATUS: ${page.status}\nDRIVE SOURCE DOCUMENTS: ${
                page.driveDocs.map((d) => `${d.title} (file_id ${d.fileId})`).join('; ') || 'none linked yet'
              }\n\n${page.content}`,
            );
          },
        },
        {
          name: 'search_knowledge',
          description: 'Searches the Education Hub knowledge base by keywords. Returns up to 5 matching pages with their IDs. Use when no routing-table row fits.',
          inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'A few distinctive keywords' } }, required: ['query'] },
          async execute(input, ctx) {
            push({ type: 'status', text: 'Searching the iTOP knowledge base…' });
            const raw = await call(NOTION, 'notion-search', { query: String(input.query ?? ''), data_source_url: ASSETS_DB, page_size: 5, max_highlight_length: 160 }, ctx.signal);
            try {
              const results = (JSON.parse(raw).results ?? []) as { id: string; title: string; highlight?: string }[];
              return results.map((r) => `${r.title} — page_id ${r.id}${r.highlight ? `\n  ${r.highlight}` : ''}`).join('\n') || 'No matching pages.';
            } catch {
              return clip(raw);
            }
          },
        },
        {
          name: 'read_source_document',
          description: 'Reads a Google Drive source document linked from a knowledge page, to check specific facts. Returns its text (long documents are cut).',
          inputSchema: {
            type: 'object',
            properties: { file_id: { type: 'string' }, title: { type: 'string', description: 'Document title as listed on the page' } },
            required: ['file_id'],
          },
          async execute(input, ctx) {
            const title = String(input.title ?? 'source document');
            push({ type: 'status', text: `Checking “${title}” in Google Drive…` });
            const text = await call(DRIVE, 'read_file_content', { fileId: String(input.file_id ?? '') }, ctx.signal);
            sources.set(String(input.file_id), { title, kind: 'drive', url: `https://drive.google.com/file/d/${input.file_id}/view` });
            return clip(text);
          },
        },
      ];

      push({ type: 'status', text: 'Thinking…' });

      const done = sample(turnsFor(request, seenDocs), {
        signal,
        tools,
        modelTier: 'default',
        onText: ({ text }) => {
          const { chat, writingDoc } = splitReply(text);
          if (chat.length > shown.length && chat.startsWith(shown)) {
            push({ type: 'text', delta: chat.slice(shown.length) });
            shown = chat;
          }
          if (writingDoc) push({ type: 'status', text: 'Writing the document…' });
        },
      }).then(
        ({ text }) => {
          const { chat, doc } = splitReply(text);
          if (chat.length > shown.length && chat.startsWith(shown)) push({ type: 'text', delta: chat.slice(shown.length) });
          if (doc) {
            const flags = [...doc.flags];
            if (!sources.size) flags.push('No knowledge page was read for this document');
            const document: AgentDocument = {
              id: crypto.randomUUID(),
              procedure: request.reformat?.document.procedure ?? doc.type,
              title: doc.title,
              body: doc.body,
              guardrail: { status: flags.length || doc.check === 'FLAG' ? 'FLAG' : 'PASS', flags },
              sources: request.reformat && !sources.size ? request.reformat.document.sources : [...sources.values()],
              createdAt: new Date().toISOString(),
              ...(request.reformat && {
                version: (request.reformat.document.version ?? 1) + 1,
                parentId: request.reformat.document.id,
              }),
            };
            seenDocs.set(document.id, document);
            push({ type: 'document', document });
          }
          if (connectorProblems.size) push({ type: 'text', delta: `\n\n**Note:** ${[...connectorProblems].join(' ')}` });
          if (sources.size) push({ type: 'sources', sources: [...sources.values()] });
          push({ type: 'done' });
        },
        (e: { code?: string; text?: string }) => {
          if (e.code === 'cancelled') push({ type: 'error', message: 'cancelled' });
          else push({ type: 'error', message: FRIENDLY_SAMPLE_ERROR[e.code ?? ''] ?? 'Something went wrong while answering. Please try again.' });
        },
      );

      try {
        while (true) {
          if (!queue.length) await new Promise<void>((r) => (wake = r));
          wake = null;
          const e = queue.shift()!;
          if (e.type === 'error' && e.message === 'cancelled') throw new DOMException('Aborted', 'AbortError');
          yield e;
          if (e.type === 'done' || e.type === 'error') break;
        }
      } finally {
        await done.catch(() => undefined);
      }
    },
  };
}

/** Resolves the live adapter when this view can ask Claude and use connectors; otherwise null. */
export async function detectConnectorAdapter(): Promise<AgentAdapter | null> {
  const runtime = (window as unknown as { claude?: ClaudeRuntime }).claude;
  if (!runtime?.use) return null;
  try {
    const [sample, mcp] = (await Promise.all([runtime.use('sample'), runtime.use('mcp')])) as [SampleFn | null, McpNs | null];
    if (!sample || !mcp) return null;
    const limits = await sample.limits().catch(() => null);
    if (!limits?.tools) return null;
    return createConnectorAdapter(sample, mcp);
  } catch {
    return null;
  }
}
