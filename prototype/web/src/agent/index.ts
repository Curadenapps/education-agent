import { detectConnectorAdapter } from './connectorAdapter';
import { mockAdapter } from './mockAdapter';
import type { AgentAdapter } from './types';

/**
 * Picks who answers:
 *  - Live: inside the claude.ai preview, when the viewer allows Claude and their
 *    Notion + Google Drive connectors (connectorAdapter.ts).
 *  - Demo: everywhere else (a downloaded file, local dev) — canned sample answers.
 * A hosted server adapter (prototype/server, Phase D) can slot in here later.
 */
let resolved: Promise<AgentAdapter> | null = null;
export const resolveAgent = () => (resolved ??= detectConnectorAdapter().then((live) => live ?? mockAdapter));

export * from './types';
export * from './procedures';
