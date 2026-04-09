# iTOP SOP Generator

An AI assistant for the Curaden iTOP methodology. It helps you create SOPs, lesson plans, training events, and synthesize feedback — all saved directly to Dropbox.

**You do not need to understand GitHub to use this.** This page is just where the assistant lives. Your actual outputs go to Dropbox.

---

## What does this assistant do?

Ask it to help with any of the following:

| What you want | Say something like |
|---|---|
| Write a clinical SOP or guideline | *"Create an SOP for the Modified Bass technique"* |
| Build a hands-on lesson plan | *"Create a 60-minute lesson plan on interdental care for hygienists"* |
| Plan a training event or CPD day | *"Plan a half-day iTOP workshop for 12 dentists"* |
| Summarise feedback into best practices | *"Here is feedback from 3 practitioners — synthesise into tips and tricks"* |
| Look up an iTOP protocol step | *"What are the iTOP steps for a follow-up session?"* |
| Generate a patient session template | *"Create an initial session template with BOB score 18%"* |
| Find a Curaden Academy course | *"What Academy courses cover BOB measurement for beginners?"* |
| Check if a seminar plan is compliant | *"Can I run an iTOP Introductory with 1 instructor for 15 people?"* |
| Understand certification pathways | *"How do I become an iTOP Lecturer?"* |
| Get a before/during/after checklist | *"What do I need to do before my iTOP seminar next month?"* |
| Check brand or logo rules | *"Can I use the iTOP logo alongside the CURAPROX logo?"* |
| Understand a technique | *"Walk me through the Bass technique step by step"* |

---

## Where do my outputs go?

Everything the assistant generates is saved to your Dropbox folder:

```
Dropbox → HQ-Education → HQ-Apps
    ├── SOPs/
    ├── Lesson-Plans/
    ├── Events/
    ├── Feedback/
    └── Session-Templates/
```

You do not need to copy or save anything manually.

---

## Important: What this assistant will NOT do

This assistant is designed to support clinicians, not replace them.

- It will **never diagnose** a patient condition
- It will **never prescribe** a product or treatment
- It will **always mark** patient-facing content as `[CLINICIAN REVIEW REQUIRED]`
- It will **never invent** protocol steps — if something isn't in the iTOP Guidelines, it will tell you
- It will **flag** any feedback that contradicts approved iTOP protocols rather than quietly accepting it

---

## The teaching philosophy: Touch to Teach

All lesson plans and training events this assistant creates follow a hands-on-first approach:

1. **Observe** — Watch the instructor demonstrate on a model (typodont) first
2. **Guided practice** — Try it yourself while the instructor physically guides your hands
3. **Independent practice** — Practise on your own while the instructor coaches
4. **Feedback** — Structured review of what to improve

At least 60% of every session must be hands-on. The assistant will flag any plan that falls below this.

Technology (apps, screens, digital tools) is noted as a **future enhancement** — current training is entirely hands-on.

---

## Reference content

All key iTOP content has been loaded from the iTOP Guidelines 2024 and the Introduction Brochure:

- **Protocols** — Bass technique, IDB, Solo, Loop floss, IAP/IAC measurement
- **Operational rules** — T2T ratios, certification pathways, seminar requirements, brand rules, HQ contacts
- **Course catalogue** — iTOP Info, Introductory, Advanced, Recall, Educator

To update any of this content, edit the relevant file in `skills/itop-sop/references/`.

---

## File structure (for the technical team)

```
itop-agent/
├── agents/
│   └── itop-sop-generator.md       ← Main agent definition
└── skills/
    └── itop-sop/
        └── references/
            ├── itop-protocols.md       ← Bass, IDB, Solo, Loop floss, IAP/IAC steps
            ├── bob-thresholds.md       ← BOB/PCR/MGI scoring thresholds
            ├── sop-templates.md        ← SOP document structure
            ├── touch-to-teach.md       ← Hands-on teaching framework
            ├── lesson-plan-framework.md← Lesson plan structure & objectives
            ├── event-planning.md       ← Event layout & run sheet templates
            ├── feedback-synthesis.md   ← Feedback collection & synthesis
            ├── educational-psychology.md← Learning science principles
            ├── content-guardrails.md   ← Clinical & educational safety rules
            ├── itop-operational-knowledge.md ← Ratios, certification, brand, contacts
            └── academy-catalogue.md    ← iTOP course listings (Intro, Advanced, Recall, Educator)
```

---

## Questions?

Contact the Curaden digital team or refer to the iTOP Guidelines 2024 for clinical content queries.
