/**
 * Contract between the UI and whatever answers it.
 *
 * The UI only ever talks to an AgentAdapter. Today that is the mock adapter
 * (canned demo answers). Later an HTTP adapter will stream the same events
 * from prototype/server, which calls Claude with the Notion + Google Drive
 * connectors. Nothing in components/ should need to change when that happens.
 */

export type ProcedureId =
  | 'sop'
  | 'lesson'
  | 'event'
  | 'feedback'
  | 'protocol'
  | 'session'
  | 'academy'
  | 'operational';

export interface Source {
  title: string;
  kind: 'knowledge' | 'drive';
  url?: string;
}

export interface Guardrail {
  status: 'PASS' | 'FLAG';
  flags: string[];
}

/** A generated document (SOP, lesson plan, …). Body is Markdown. */
export interface AgentDocument {
  id: string;
  procedure: ProcedureId;
  title: string;
  body: string;
  guardrail: Guardrail;
  sources: Source[];
  createdAt: string;
  /** 1 for the first draft; reformats create a new version that points back to its parent. */
  version?: number;
  parentId?: string;
  /** Set once saved to the output Drive folder. */
  savedPath?: string;
}

export type ReformatStyle = 'shorter' | 'checklist' | 'patient';

export interface Attachment {
  name: string;
  size: number;
  type: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  procedure?: ProcedureId;
  attachments?: Attachment[];
  documentId?: string;
  sources?: Source[];
  status: 'streaming' | 'done' | 'error' | 'stopped';
  createdAt: string;
}

export interface AgentRequest {
  conversationId: string;
  /** Full history, oldest first, including the new user message. */
  messages: ChatMessage[];
  procedure?: ProcedureId;
  attachments?: Attachment[];
  /** Asks for a new version of an existing document. */
  reformat?: { document: AgentDocument; style: ReformatStyle };
}

/** Streamed back in this order: text deltas, then optional document and sources, then done. */
export type AgentEvent =
  | { type: 'text'; delta: string }
  | { type: 'document'; document: AgentDocument }
  | { type: 'sources'; sources: Source[] }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface AgentAdapter {
  /** Shown in the top bar so nobody mistakes demo answers for live ones. */
  label: string;
  live: boolean;
  send(request: AgentRequest, signal: AbortSignal): AsyncIterable<AgentEvent>;
}
