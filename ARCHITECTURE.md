# Education Agent — Architecture & Source of Truth

> Reference for developers and maintainers. Mirrors the Notion page
> [Education Agent — Architecture & Source of Truth](https://www.notion.so/seandunne/3457e8aabbb4812cae3bfd79b598c2a7).
> Last updated: 2026-10-08.

---

## The core principle

**Google Drive holds the source documents. Notion holds the agent-readable knowledge.
Every knowledge page links to the Drive documents it is built from.**

| Layer | What lives there | Role |
|---|---|---|
| **Google Drive** — [Education Hub folder](https://drive.google.com/drive/folders/1dM8khJdVm855rGbQAlzTKr8aRyCuT1-I) (iTOP / Curaprox / Cross-brand) | The real documents: manuals, course descriptions, research, books, illustrations, templates | **Source of truth.** If anything disagrees with Drive, Drive wins. |
| **Notion Assets DB** (`322aec0f-c060-4f0c-aa21-9a56666493c2`) | One row per Drive document (`Source` = GDrive, `File URL`), plus the knowledge pages (`Source` = Agent) | Catalogue + agent-readable summaries. Knowledge pages link their documents through the `Source Documents` relation (reverse: `Used By Knowledge`). |
| **Education Agent** (this repo) | System prompt: persona, rules, routing table | Reads knowledge pages via Notion MCP at runtime, follows Source documents to Drive, cites them. No knowledge content in the prompt. |
| **Education Hub repo** ([Curadenapps/education-hub](https://github.com/Curadenapps/education-hub)) | Library automation | Keeps the links healthy and generates media (see below). |

```
 Google Drive (source documents)
        │  File URL on each Drive-document Asset
        ▼
 Notion Assets DB ── Source Documents ──► knowledge pages (Source = Agent)
        │                                    │ "Source documents" section on each page
        │                                    ▼
        │                           Education Agent (Notion MCP + Drive connector)
        ▼
 education-hub automation
   • library_sync.py  (daily)  - writes each page's Source documents section,
                                 checks every Drive file is readable, reports to
                                 the "Library Health" page in Notion
   • media_orchestrator.py (every 15 min) - Generate field → audio / summary /
                                 visuals / video in a "Generated media" toggle
```

---

## How the agent uses it

1. Pick knowledge pages from the routing table in `agents/education-agent-persona.md`
   (fallback: search the Assets DB).
2. Answer from the knowledge page.
3. For specific facts, numbers, protocol steps and claims, check the linked Drive
   document and cite it. Drive wins on conflict — flag the contradiction.
4. End procedure outputs with `Guardrail: PASS/FLAG` and a `Sources:` line.

The system prompt contains identity, the 8 hard rules, the routing table and these
source rules — never knowledge content.

---

## Keeping it maintained

| Task | How |
|---|---|
| Add or replace a source document | Put it in the Drive folder → create its Asset row (`Source` = GDrive, `File URL`) → add it to the knowledge page's `Source Documents` field. The page's Source documents section updates on the next daily run. |
| Change what the agent knows | Edit the Notion knowledge page (the agent's working copy), keeping it consistent with its Drive documents. |
| Add a knowledge page | Create it in the Assets DB with `Source` = Agent and link its Source Documents, then add a routing row to the persona here **and** to `education-hub/agent/persona-v2.md` (the daily health check reads that copy). |
| Check the Library | Notion → Education Hub → **Library Health** (refreshed daily; errors also fail the `Library health` GitHub Action). |

Status flow: `Draft` → `In Review` → `Published` → `Outdated` → `Archived`

---

## Legacy

- The `.md` files under `skills/itop-sop/references/` are the original drafts the
  knowledge pages were created from. The Notion pages have since been edited and
  are now the working copy — **do not push these files over Notion.**
- `.github/workflows/sync-to-notion.yml` (GitHub → Notion) is therefore manual-only.
  Don't run it without first refreshing the `.md` files from Notion.
- Claude Project file pastes are deprecated.

---

## Contacts

| Role | Person | Responsibility |
|------|--------|----------------|
| Architecture owner | Sean Dunne (sean.dunne@curaden.ch) | GitHub, agent, Notion and Drive links |
| Content owner | Barbara Olejarová (barbara.olejarova@curaden.ch) | Knowledge accuracy, review sign-off, Drive documents |
| Content contributor | Mário Rui Araújo | Behavioural science, training methodology |
| Programme head | Suncica Ilija DMD (Suncica.Ilija@curaden.ch) | Final sign-off on published content |
