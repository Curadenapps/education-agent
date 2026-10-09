# System Overview — iTOP Interface Agent and Education Agent

> Draft for review. Complements `ARCHITECTURE.md` (Education Agent / knowledge layer, owned by the Notion/Drive session). This file does not replace it.

## Two agents, two jobs

| | **Education Agent** | **iTOP Interface Agent** |
|---|---|---|
| Purpose | Answers from the Education Hub knowledge base | Front-end for non-technical staff: chat, voice, file upload, document output |
| Knowledge | Notion knowledge pages, backed by Google Drive source documents | None of its own. Reads it from the Education Agent's pages |
| Lives in | `agents/education-agent*.md`, Notion, `education-hub` repo | `prototype/` (and later Dify or similar) |
| Owner | Notion/Drive session | This session |

The interface agent holds no knowledge. It sends questions to the Education Agent and returns formatted documents (SOP, lesson plan, event plan, feedback synthesis).

## Source-of-truth chain

Google Drive (source documents) → Notion Assets DB (knowledge pages) → Education Agent → Interface Agent → user.

If anything disagrees, Drive wins.

## Ownership

- **Notion/Drive session:** Notion pages, Drive links, daily health check, `agents/education-agent-persona.md` routing, `education-hub/agent/persona-v2.md`, `ARCHITECTURE.md`.
- **This session:** this file, `README.md`, `agents/education-agent-procedures.md`, `prototype/`.
- Neither edits the other's files without asking first.

## Output folders

Generated documents go to their own Drive folder, separate from the source-document folder (`1dM8khJdVm855rGbQAlzTKr8aRyCuT1-I`), so outputs never get mistaken for sources. Merge later once reviewed. The output folder ID is in `prototype/.env.example`.

## Legacy

`skills/itop-sop/references/*.md` are the original drafts. Notion is ahead of them. Treat them as non-authoritative reference. Never push them over Notion.

## Proposed folder layout (not applied)

Moving files now would collide with PR #5, so this waits until it merges.

```
agents/education-agent/      persona + prompt
agents/interface-agent/      prompt for the interface (if needed)
prototype/                   UI
docs/                        overview, architecture pointers
skills/itop-sop/references/  legacy drafts (read-only)
```

## Open items

1. ~~Old `agents/education-agent.md`~~ — done: slimmed to output formats as `agents/education-agent-procedures.md`.
2. Wire the prototype to a real backend, or keep it as a static demo.
3. Build Phase 3 (document panel) only after item 2.
