import { useCallback, useEffect, useRef, useState } from 'react';
import { agent, procedureById } from '../agent';
import type { AgentDocument, AgentRequest, Attachment, ChatMessage, ProcedureId, ReformatStyle } from '../agent';

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  documents: AgentDocument[];
  updatedAt: string;
}

const STORE_KEY = 'itop-agent.conversations.v1';
const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();

const blank = (): Conversation => ({ id: uid(), title: 'New conversation', messages: [], documents: [], updatedAt: now() });

/** Per-browser history. Storage may be unavailable (private window, sandbox); the app works without it. */
function load(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const list = raw ? (JSON.parse(raw) as Conversation[]) : [];
    // A reload mid-stream leaves messages stuck as "streaming".
    return list.map((c) => ({
      ...c,
      messages: c.messages.map((m) => (m.status === 'streaming' ? { ...m, status: 'stopped' } : m)),
    }));
  } catch {
    return [];
  }
}

function save(list: Conversation[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(0, 30)));
  } catch {
    /* storage unavailable or full */
  }
}

const titleFrom = (text: string) => (text.length > 48 ? text.slice(0, 46).trimEnd() + '…' : text);

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const list = load();
    return list.length ? list : [blank()];
  });
  const [activeId, setActiveId] = useState(() => conversations[0].id);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => save(conversations), [conversations]);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  const patch = useCallback((id: string, fn: (c: Conversation) => Conversation) => {
    setConversations((list) => list.map((c) => (c.id === id ? { ...fn(c), updatedAt: now() } : c)));
  }, []);

  const patchMessage = useCallback(
    (convId: string, msgId: string, fn: (m: ChatMessage) => ChatMessage) =>
      patch(convId, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === msgId ? fn(m) : m)) })),
    [patch],
  );

  const send = useCallback(
    async (
      text: string,
      opts: { procedure?: ProcedureId; attachments?: Attachment[]; reformat?: AgentRequest['reformat'] } = {},
    ) => {
      const trimmed = text.trim();
      const attachments = opts.attachments ?? [];
      if ((!trimmed && !attachments.length) || busy) return;

      const conv = active;
      const userMsg: ChatMessage = {
        id: uid(),
        role: 'user',
        text: trimmed,
        procedure: opts.procedure,
        attachments: attachments.length ? attachments : undefined,
        status: 'done',
        createdAt: now(),
      };
      const agentMsg: ChatMessage = { id: uid(), role: 'agent', text: '', status: 'streaming', createdAt: now() };
      const history = [...conv.messages, userMsg];

      patch(conv.id, (c) => ({
        ...c,
        title: c.messages.length ? c.title : titleFrom(trimmed || attachments[0]?.name || 'Upload'),
        messages: [...history, agentMsg],
      }));

      const controller = new AbortController();
      abortRef.current = controller;
      setBusy(true);

      try {
        for await (const event of agent.send(
          { conversationId: conv.id, messages: history, procedure: opts.procedure, attachments, reformat: opts.reformat },
          controller.signal,
        )) {
          if (event.type === 'text') {
            patchMessage(conv.id, agentMsg.id, (m) => ({ ...m, text: m.text + event.delta }));
          } else if (event.type === 'document') {
            const doc = event.document;
            patch(conv.id, (c) => ({
              ...c,
              documents: [...c.documents, doc],
              messages: c.messages.map((m) => (m.id === agentMsg.id ? { ...m, documentId: doc.id } : m)),
            }));
          } else if (event.type === 'sources') {
            patchMessage(conv.id, agentMsg.id, (m) => ({ ...m, sources: event.sources }));
          } else if (event.type === 'error') {
            patchMessage(conv.id, agentMsg.id, (m) => ({ ...m, status: 'error', text: m.text || event.message }));
            return;
          }
        }
        patchMessage(conv.id, agentMsg.id, (m) => ({ ...m, status: 'done' }));
      } catch (err) {
        const stopped = err instanceof DOMException && err.name === 'AbortError';
        patchMessage(conv.id, agentMsg.id, (m) => ({
          ...m,
          status: stopped ? 'stopped' : 'error',
          text: m.text || (stopped ? '' : 'Something went wrong. Try again.'),
        }));
      } finally {
        abortRef.current = null;
        setBusy(false);
      }
    },
    [active, busy, patch, patchMessage],
  );

  const runProcedure = useCallback(
    (id: ProcedureId) => send(procedureById(id).prompt, { procedure: id }),
    [send],
  );

  const REFORMAT_ASK: Record<ReformatStyle, string> = {
    shorter: 'Make a shorter version of',
    checklist: 'Turn this into a checklist:',
    patient: 'Rewrite as a patient handout:',
  };

  const reformat = useCallback(
    (document: AgentDocument, style: ReformatStyle) =>
      send(`${REFORMAT_ASK[style]} “${document.title}”`, { procedure: document.procedure, reformat: { document, style } }),
    [send],
  );

  /** Demo: records where the document would be saved in the output Drive folder. */
  const markSaved = useCallback(
    (docId: string, path: string) =>
      patch(active.id, (c) => ({ ...c, documents: c.documents.map((d) => (d.id === docId ? { ...d, savedPath: path } : d)) })),
    [active.id, patch],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const newConversation = useCallback(() => {
    if (busy) return;
    if (!active.messages.length) return; // already on a blank one
    const c = blank();
    setConversations((list) => [c, ...list]);
    setActiveId(c.id);
  }, [active, busy]);

  const select = useCallback((id: string) => !busy && setActiveId(id), [busy]);

  const remove = useCallback(
    (id: string) => {
      if (busy) return;
      setConversations((list) => {
        const rest = list.filter((c) => c.id !== id);
        const next = rest.length ? rest : [blank()];
        if (id === activeId) setActiveId(next[0].id);
        return next;
      });
    },
    [busy, activeId],
  );

  return { conversations, active, busy, send, runProcedure, reformat, markSaved, stop, newConversation, select, remove };
}
