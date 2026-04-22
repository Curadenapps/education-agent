# Curaden Education Agent

An AI assistant for the Curaden iTOP (Individually Trained Oral Prophylaxis) methodology. Helps Curaden Partners, iTOP Lecturers, Instructors, Academy staff, and sales representatives with seminar operations, staff certification, patient behaviour change, instructor development, and partner engagement.

---

## What does this assistant do?

| What you want | Say something like |
|---|---|
| Understand iTOP's core purpose | *"Why does iTOP exist? What is the knowledge–behaviour gap?"* |
| Check seminar compliance | *"Can I run an iTOP Introductory with 1 instructor for 15 people?"* |
| Plan a training event | *"Plan a full-day iTOP Introductory seminar for 12 dentists"* |
| Understand the Advanced programme | *"Walk me through the iTOP Advanced programme structure"* |
| Learn about the Jenga exercise | *"How does the Jenga Clinical Tower work in the Advanced seminar?"* |
| Build a lesson plan | *"Create a 90-minute T2T lesson plan on interdental care"* |
| Generate an SOP | *"Create an SOP for the Modified Bass technique"* |
| Apply behaviour science | *"My patient understands the technique but isn't doing it at home — what's blocking them?"* |
| Write a patient plan | *"Help me close this session with a specific one-thing plan for this patient"* |
| Structure a follow-up | *"How should I open the follow-up conversation after a first IDB session?"* |
| Reframe a BOB result | *"My patient's BOB dropped from 28 to 14 — how do I present this?"* |
| Understand instructor methodology | *"Explain minimum viable correctness and when to use it"* |
| Apply the feedback principles | *"How should I give feedback during a T2T session without creating dependency?"* |
| Identify a partner persona | *"My partner refuses to sell products in the clinic but is very engaged with the education — who is this?"* |
| Engage a specific persona | *"How do I convince a prevention-sceptic clinic owner to attend iTOP Advanced?"* |
| Navigate the customer journey | *"What should I do in the first 2 weeks after an iTOP seminar?"* |
| Find Academy courses | *"What Academy course covers advanced patient coaching for a certified Instructor?"* |
| Check certification pathways | *"How do I become an iTOP Lecturer?"* |
| Check brand rules | *"Can I use the iTOP logo alongside the CURAPROX logo?"* |

---

## What this assistant will NOT do

- **Never diagnose** a patient condition
- **Never prescribe** a product or treatment
- **Always mark** patient-facing content as `[CLINICIAN REVIEW REQUIRED]`
- **Never invent** protocol steps — if something isn't in the knowledge base, it will say so
- **Flag** any feedback that contradicts approved iTOP protocols rather than quietly accepting it
- **Never deliver iTOP dogmatically** — the agent explains principles and decision-making frameworks, not rigid rules

---

## File structure

```
education-agent/
├── agents/
│   ├── education-agent-persona.md           ← Agent identity, capabilities, hard rules
│   └── education-agent.md           ← SOP generation procedures
└── skills/
    └── itop-sop/
        └── references/
            ├── itop-core-knowledge.md              ← Philosophy, three criteria, programme structures, T2T, active learning
            ├── itop-training-methodology.md        ← Skill acquisition model, feedback, time management, COMPASS facilitation
            ├── seminar-operations.md               ← Customer journey, checklists, materials, ratios, pricing, contacts
            ├── customer-journey-and-personas.md    ← 8 dental professional personas, partner engagement, CRM, KPIs
            ├── patient-behaviour-change.md         ← COM-B, HAPA, session arc, implementation intentions, BOB reframing
            ├── educational-psychology.md           ← Motor learning, guidance hypothesis, deliberate practice, MI
            ├── itop-protocols.md                   ← Bass, IDB, Solo, Loop floss, IAP/IAC, session structure
            ├── bob-thresholds.md                   ← BOB/PCR/MGI thresholds and intervention mapping
            ├── sop-templates.md                    ← SOP document structure
            ├── lesson-plan-framework.md            ← Lesson plan structure and objectives
            ├── touch-to-teach.md                   ← ODPF hands-on teaching framework
            ├── event-planning.md                   ← Event layout and run sheet templates
            ├── feedback-synthesis.md               ← Feedback collection and synthesis
            ├── content-guardrails.md               ← Clinical and educational safety rules
            ├── itop-operational-knowledge.md       ← Ratios, certification, brand, contacts
            └── academy-catalogue.md                ← iTOP course listings
```

---

## Architecture

- **GitHub** (`github.com/Curadenapps/itop-agent`) — canonical source for all agent files
- **Dropbox** — human-facing working file storage for the team
- **Claude Projects** — operational layer for non-technical users

To update any knowledge content, edit the relevant file in `skills/itop-sop/references/` and commit to the main branch.

---

## Questions?

Contact the Curaden digital team or refer to the iTOP Official Document Series for clinical and educational content queries.
