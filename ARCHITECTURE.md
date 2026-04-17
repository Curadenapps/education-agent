# Education Agent — Architecture & Source of Truth

> Reference document for developers and maintainers.
> Keep this file in sync with the Notion page:
> https://www.notion.so/seandunne/3457e8aabbb4812cae3bfd79b598c2a7

---

## The Core Principle

**Notion is the single source of truth for the Education Agent.**

The agent does NOT read from GitHub at runtime. It does NOT use static file pastes.
Every answer the agent gives traces back to a live Notion page in the Assets DB,
queried via the Notion MCP on every conversation.

GitHub is the version-control and review layer. Notion is the live knowledge layer.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NOTION EDUCATION HUB                      │
│              (Single source of truth — live)                 │
│                                                              │
│   Assets DB → one page per knowledge file                    │
│   Each page = the canonical, current content                 │
│   Humans AND the agent read from the same place              │
└─────────────────────┬───────────────────────────────────────┘
                      │ Notion MCP — queried at runtime
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                   EDUCATION AGENT                            │
│           (Claude — powered by Anthropic API)                │
│                                                              │
│   Reads Notion pages via MCP on every conversation          │
│   Never uses cached or static copies                         │
│   System prompt = persona + hard rules + MCP instructions   │
└─────────────────────────────────────────────────────────────┘
                      ↑ updates flow up monthly
┌─────────────────────────────────────────────────────────────┐
│                      GITHUB REPO                             │
│           (Version control + update mechanism)               │
│                                                              │
│   Curadenapps/itop-agent                                     │
│   .md files = draft, reviewed, versioned knowledge          │
│   PRs = review layer before content goes live                │
│   Monthly GitHub Action pushes approved content → Notion    │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

| Layer | Role | Who touches it | Update frequency |
|-------|------|----------------|-----------------|
| **Notion Assets DB** | Live source. Agent reads at runtime. Team browses here. | Sean, Barbara (admins) | Monthly sync or urgent hotfix |
| **GitHub repo** | Version control, PR review, edit history | Sean, technical collaborators | Ongoing as docs evolve |
| **Agent system prompt** | Persona, hard rules, MCP instructions. No knowledge content. | Sean (technical) | Rarely — only behaviour changes |
| **Claude Project files** | ⚠ DEPRECATED — static pastes, goes stale. Do not rely on. | — | Deprecated |

---

## Update Flow

### Standard (monthly)

```
1. Content change identified
         ↓
2. Edit .md file in GitHub → open PR → review → merge to main
         ↓
3. GitHub Action runs on merge (or 1st of month)
   → reads .md from main
   → pushes content to Notion Asset page via API
   → sets Change Log = git commit message
   → sets Status = "In Review"
         ↓
4. Barbara / Sean reviews in Notion → sets Status = "Published"
         ↓
5. Agent reads new content on next conversation — no manual step
```

### Urgent hotfix

```
1. Critical error found
         ↓
2. Edit Notion Asset page directly (Sean or Barbara)
         ↓
3. Agent reads fix immediately
         ↓
4. Follow-up PR to update GitHub .md (keeps repos in sync)
```

---

## Knowledge Files → Notion Asset Mapping

Each `.md` file in `skills/itop-sop/references/` maps to one Asset record in Notion.
The Notion page content IS what the agent reads — not a link, not a copy.

| GitHub file | Notion Asset title | Level | Content Type |
|-------------|-------------------|-------|--------------|
| `itop-core-knowledge.md` | iTOP Core Knowledge | Intro + Advanced | Reference |
| `itop-training-methodology.md` | iTOP Training Methodology | Advanced + Educator | Reference |
| `seminar-operations.md` | Seminar Operations | All levels | SOP |
| `customer-journey-and-personas.md` | Customer Journey & Personas | All levels | Reference |
| `patient-behaviour-change.md` | Patient Behaviour Change | Intro + Advanced | Pedagogic Material |
| `educational-psychology.md` | Educational Psychology | Advanced + Educator | Reference |
| `itop-protocols.md` | iTOP Protocols | All levels | SOP |
| `bob-thresholds.md` | BOB Thresholds | All levels | Reference |

---

## What the System Prompt Contains (and does NOT contain)

### Contains
- Agent identity, tone, capabilities
- 8 hard rules (non-negotiable behaviours)
- Instructions to query Notion MCP before answering any knowledge question
- Map of which Notion pages to query for which question categories

### Does NOT contain
- Any knowledge content
- Protocol steps
- Persona descriptions
- Behaviour change frameworks

Knowledge lives in Notion. The system prompt tells the agent where to look.

---

## GitHub Action Spec

File: `.github/workflows/sync-to-notion.yml`

**Trigger:**
```yaml
on:
  push:
    branches: [main]
    paths:
      - 'skills/itop-sop/references/**.md'
  schedule:
    - cron: '0 8 1 * *'  # 1st of every month at 08:00 UTC
```

**Steps:**
1. Checkout repo
2. For each changed `.md` file in `skills/itop-sop/references/`:
   - Match to Notion Asset page by title (see mapping table above)
   - Convert markdown to Notion blocks
   - PATCH the Asset page content via Notion API
   - Set `Change Log` property = git commit message
   - Set `Status` = `In Review`
3. Post summary to Slack / email Sean on completion

**Secrets required:**
```
NOTION_TOKEN=<Notion integration token with Assets DB write access>
NOTION_ASSETS_DB_ID=322aec0f-c060-4f0c-aa21-9a56666493c2
```

---

## Notion Assets DB

- **URL:** https://www.notion.so/seandunne/6e72da8b2cbb4c9ca3ce56e4a675bb5d
- **Data source ID:** `322aec0f-c060-4f0c-aa21-9a56666493c2`
- **Key fields:** Title, Status, Content Type, Level, Audience, Brand, Editability, File Location, Change Log, Review Date

Status flow: `Draft` → `In Review` → `Published` → `Outdated` → `Archived`

---

## Why Not Use GitHub as the Live Source?

GitHub is not a knowledge interface. It is not designed for:
- Barbara or Suncica browsing guidelines without markdown syntax
- Instructors downloading readable references
- The agent querying structured content at runtime
- Partner feedback flowing back into the same system

Notion serves all four. GitHub serves engineering review. Both are necessary — different jobs.

---

## Contacts

| Role | Person | Responsibility |
|------|--------|----------------|
| Architecture owner | Sean Dunne (sean.dunne@curaden.ch) | GitHub, agent, Notion sync |
| Content owner | Barbara Olejarová (barbara.olejarova@curaden.ch) | Knowledge accuracy, review sign-off |
| Content contributor | Mário Rui Araújo | Behavioural science, training methodology |
| Programme head | Suncica Ilija DMD (Suncica.Ilija@curaden.ch) | Final sign-off on published content |

---

## Notion Education Hub

https://www.notion.so/seandunne/Curaden-Education-Hub-3447e8aabbb481ef9ceaf36c73067120

Architecture page (this document in Notion):
https://www.notion.so/seandunne/3457e8aabbb4812cae3bfd79b598c2a7
