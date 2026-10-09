---
name: education-agent-procedures
description: >
  Output procedures for the Education Agent: input fields, steps, and document
  templates for SOPs, lesson plans, event plans, feedback reports, protocol lookups,
  session templates, academy routing, and operational answers. Used alongside the
  system prompt in education-agent-persona.md.
---

# Education Agent — Output Procedures

This file holds **formats only**. Identity, tone, the 8 hard rules, query routing, and the Google Drive source rules all live in [`education-agent-persona.md`](education-agent-persona.md). Where the two differ, the persona wins.

**Knowledge:** every procedure starts by fetching the relevant Notion knowledge pages through the persona's routing table, then checks facts against the linked Drive source documents. Never use the legacy `.md` drafts in `skills/itop-sop/references/` as a source.

**Every output ends with:**
```
Guardrail: {PASS | FLAG — reason}
Sources: {knowledge pages} · {Drive source documents}
Saved: {output path | dry_run | not saved}
```

## Saving outputs

Generated documents go to the **output** Drive folder (`1j5VI1J1qVZ2uLcCkvwFXnfQgVh3Cz5Bn`), never the source-document folder. File name: `{subfolder}/{topic-slug}_{ISO-date}.md`. With `dry_run: true`, report the path without writing.

| Output | Subfolder |
|---|---|
| SOPs & guidelines | `SOPs/` |
| Lesson plans | `Lesson-Plans/` |
| Event plans | `Events/` |
| Feedback reports | `Feedback/` |
| Session templates | `Session-Templates/` |

---

## 1. SOP & Guideline Generator

**Inputs:** `topic` · `audience` (clinician | educator | student) · `sop_type` (clinical | educational | operational) · `save` (default true)

**Steps:** fetch iTOP Clinical Protocols + SOP Templates pages → map topic to protocol entries → build the mandatory sections → mark clinician-gated fields `[CLINICIAN REVIEW REQUIRED]` → cite a source for every step.

```
SOP: {topic}
Version: 1.0 | Date: {ISO date}
Audience: {audience} | Type: {sop_type}
────────────────────────────────────────
PURPOSE
  {1-2 sentences}

SCOPE
  Applies to: {who}
  Does NOT apply to: {exclusions}

NON-NEGOTIABLE RULES
  □ {rule}

STEP-BY-STEP PROTOCOL
  1. {step} [Source: {document, section}]

ASSESSMENT CRITERIA
  Pass: {observable behaviour}
  Fail: {observable behaviour}

CLINICIAN NOTES
  [CLINICIAN REVIEW REQUIRED]
```

---

## 2. Lesson Plan Creator (Touch to Teach)

**Inputs:** `topic` · `audience` (dental_student | hygienist | dentist | educator) · `duration_minutes` · `session_number` (optional) · `bob_focus` (optional)

**Steps:** fetch Touch to Teach Methodology + Lesson Plan Framework pages → apply ODPF (Observe → Demonstrate → Practice → Feedback) → keep theory blocks ≤15 min → enforce ≥60% hands-on, flag if the duration can't fit it.

```
ITOP LESSON PLAN
────────────────────────────────────────
Topic: {topic} | Session {N}
Audience: {audience} | Duration: {X} min | Date: {ISO date}

LEARNING OBJECTIVES
  □ [SKILL] {observable action}
  □ [KNOWLEDGE] {knowledge item}
  □ [ATTITUDE] {attitudinal goal}

MATERIALS & SETUP
  □ Typodont / phantom model
  □ Instrument kit (brushes, interdental aids)
  □ Disclosure tablets
  {□ BOB App device — if bob_focus}

SESSION FLOW
  [00:00–XX:XX] HOOK ({X} min) — one patient story, no lecture
  [XX:XX–XX:XX] OBSERVE ({X} min) — instructor demonstrates on typodont, narrates
  [XX:XX–XX:XX] GUIDED PRACTICE ({X} min) — participants replicate; instructor corrects by touch
      Checkpoint: {observable pass criterion}
  [XX:XX–XX:XX] INDEPENDENT PRACTICE ({X} min) — focus: {micro-skill}
  [XX:XX–XX:XX] FEEDBACK & DEBRIEF ({X} min) — revisit {skill} at session {N+1}

ASSESSMENT
  Competency gate: {pass criterion}
  Remediation: {if not met}

Hands-on: {X}% {PASS ≥60% | FLAG}

INSTRUCTOR NOTES
  [INSTRUCTOR REVIEW REQUIRED]
```

---

## 3. Event & Training Planner

**Inputs:** `event_type` (workshop | cpd_day | certification | study_club | onboarding) · `duration` · `participant_count` · `audience` · `topics[]`

**Steps:** fetch Event Planning Templates + Seminar Operations + Touch to Teach Methodology pages → allocate time per topic, ≥60% hands-on overall → check instructor ratios → build run sheet, stations, equipment list, evaluation.

```
ITOP EVENT PLAN
────────────────────────────────────────
Event: {title} | Type: {event_type}
Date: {ISO date} | Duration: {X} hrs/days
Audience: {audience} | Participants: {N} | Instructors: {N} (ratio {1:X})
────────────────────────────────────────
PRE-EVENT CHECKLIST
  T-4 weeks: {tasks}
  T-1 week:  {tasks}
  T-1 day:   {tasks}
  Day-of:    {tasks}

RUN SHEET
  {TIME} — {activity} ({duration} min) — {facilitator}

STATION MAP
  Station {N}: {name} — {equipment} — max {N} participants

EQUIPMENT MASTER LIST
  □ {item} × {qty}

Hands-on: {X}% {PASS ≥60% | FLAG}

POST-EVENT EVALUATION
  {evaluation framework}
```

---

## 4. Feedback Synthesizer

**Inputs:** `feedback_entries[]` with `source_role` each (practitioner | dentist | educator | student; max 20 per request) · `topic` · `synthesis_type` (best_practices | tips_tricks | curriculum_gaps | educational_insights)

**Steps:** fetch Feedback Synthesis + Educational Psychology pages → group by theme (technique / timing / motivation / comprehension) → weight clinical points dentist = practitioner > educator > student and state the weighting → check against iTOP Clinical Protocols and flag contradictions → only synthesise entries provided.

```
FEEDBACK SYNTHESIS REPORT
────────────────────────────────────────
Topic: {topic} | Type: {synthesis_type}
Entries: {N} | Date: {ISO date} | Roles: {breakdown}
Weighting: {as applied}

THEMES
  1. {theme} — {N} mentions — {roles}

KEY INSIGHTS
  □ {insight} [Source: {role}] [Protocol: ALIGNED | FLAG]

RECOMMENDED BEST PRACTICES
  1. {recommendation}

TIPS & TRICKS (practitioner-sourced)
  • {tip}

⚠ PROTOCOL DEVIATION FLAGS
  {item} contradicts {source document, section} — do not use without clinician review

CURRICULUM GAPS
  • {gap}
```

---

## 5. Protocol Lookup

**Inputs:** keywords (e.g. "Modified Bass", "IDB", "session 1 structure")

**Steps:** fetch iTOP Clinical Protocols page → match the closest entry → return the wording verbatim from the Drive source document where available → no paraphrasing of clinical content.

```
Protocol: {topic}
Source: {Drive document, section}
Content: {verbatim text}
Clinician note: {interpretation flag, if any}
```

---

## 6. Session Template

**Inputs:** `session_type` (initial | follow_up | re_check) · `bob_results` (optional) · `patient_profile` (optional)

**Steps:** fetch iTOP Clinical Protocols page; if BOB results given, also BOB Thresholds + Patient Behaviour Change → map to intervention tier → mark every patient-facing field `[CLINICIAN REVIEW REQUIRED]`.

```
iTOP SESSION TEMPLATE
─────────────────────────────────────────
Session Type: {type} | Date: {YYYY-MM-DD}
Clinician: [CLINICIAN REVIEW REQUIRED]
Patient ID: [CLINICIAN REVIEW REQUIRED]

BOB MEASUREMENT SUMMARY
  BOB%: {value or —}   PCR%: {value or —}   MGI: {value or —}
  Trend: {improving | stable | worsening | first session}

iTOP INTERVENTION PLAN
  Technique focus: {technique}
  Interdental aid: {aid / size}
  Key message: {1 sentence — no efficacy claims}

NEXT SESSION
  Recall interval: [CLINICIAN REVIEW REQUIRED]
  Goal: {target}

CLINICIAN NOTES
  {free text — not generated}
```

---

## 7. Academy Routing

**Inputs:** `role` (clinician | patient) · `topic` · `level` (optional)

**Steps:** fetch Academy Catalogue page → filter by role and topic → return 1–3 matches → never give patient materials as a primary result to clinicians → if nothing matches, say so.

```
Academy Recommendations: {role} — {topic}
─────────────────────────────────────────
1. {Course title}
   Format: {format} | Duration: {X} | Level: {level}
   URL: {link}
   Why: {1 line}
```

---

## 8. Operational Guidance

**Inputs:** a free-form question from a Partner, Lecturer, Instructor or Academy staff member.

**Steps:** fetch iTOP Operational Knowledge + Seminar Operations (and iTOP Brand Style Guidelines for brand questions) → answer directly in plain prose → cite the rule when flagging non-compliance → flag a violating plan before offering the fix → route Academy-Department decisions (presentation changes, logo exceptions, Lecturer contracts) to HQ contacts.

Always flag: instructor ratios exceeded ("you need X instructors for Y participants"), mixed iTOP / CURAPROX branding, self-made certificates, skipping publication on curadenacademy.com.

No template — plain prose, then the standard footer.

---

## Output schema (for integrations)

```json
{
  "agent": "education-agent",
  "procedure": "sop | lesson-plan | event-plan | feedback | protocol-lookup | session-template | academy-routing | operational",
  "status": "ok | flagged | error",
  "run_id": "ISO-8601",
  "output": "...",
  "guardrail_flags": [],
  "clinician_review_required": true,
  "hands_on_percentage": null,
  "sources": [{ "title": "...", "type": "knowledge_page | drive_document", "url": "..." }],
  "saved_path": null,
  "save_status": "written | dry_run | skipped | error"
}
```
