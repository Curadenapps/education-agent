import { mockAdapter } from './mockAdapter';
import type { AgentAdapter } from './types';

/**
 * Picks the adapter. Demo mode is the default. Phase D adds an HTTP adapter
 * for prototype/server, selected with VITE_AGENT_URL.
 */
export const agent: AgentAdapter = mockAdapter;

export * from './types';
export * from './procedures';
