/**
 * Demo adapter: streams canned answers so the UI can be reviewed without a backend.
 * Content is drawn from the iTOP knowledge pages (legacy drafts in
 * skills/itop-sop/references/) and is labelled as sample output in the UI.
 */
import { PROCEDURES } from './procedures';
import type { AgentAdapter, AgentDocument, AgentEvent, AgentRequest, ProcedureId, Source } from './types';

interface Script {
  text: string;
  document?: Omit<AgentDocument, 'id' | 'createdAt' | 'procedure'>;
  sources: Source[];
}

const today = () => new Date().toISOString().slice(0, 10);

const SRC = {
  protocols: { title: 'iTOP Clinical Protocols', kind: 'knowledge' } as Source,
  guidelines: { title: 'iTOP Guidelines 2024', kind: 'drive' } as Source,
  brochure: { title: 'iTOP Introduction Brochure', kind: 'drive' } as Source,
  sopTemplates: { title: 'SOP Templates', kind: 'knowledge' } as Source,
  t2t: { title: 'Touch to Teach Methodology', kind: 'knowledge' } as Source,
  lessonFramework: { title: 'Lesson Plan Framework', kind: 'knowledge' } as Source,
  seminarOps: { title: 'Seminar Operations', kind: 'knowledge' } as Source,
  eventTemplates: { title: 'Event Planning Templates', kind: 'knowledge' } as Source,
  operational: { title: 'iTOP Operational Knowledge', kind: 'knowledge' } as Source,
  feedback: { title: 'Feedback Synthesis', kind: 'knowledge' } as Source,
  bob: { title: 'BOB Thresholds', kind: 'knowledge' } as Source,
  behaviour: { title: 'Patient Behaviour Change', kind: 'knowledge' } as Source,
  academy: { title: 'Academy Catalogue', kind: 'knowledge' } as Source,
};

const SCRIPTS: Record<ProcedureId, () => Script> = {
  sop: () => ({
    text:
      'Here is a clinical SOP for the Modified Bass technique, built from the iTOP Clinical Protocols page and checked against the iTOP Guidelines 2024. Every step carries its source. The clinician notes are left open for review, so the guardrail is marked FLAG until a clinician signs off.',
    document: {
      title: 'SOP — Modified Bass Technique',
      guardrail: { status: 'FLAG', flags: ['Clinician notes need review before use'] },
      sources: [SRC.protocols, SRC.sopTemplates, SRC.guidelines],
      body: `# SOP: Modified Bass Technique

**Version** 1.0 · **Date** ${today()} · **Audience** Clinician · **Type** Clinical

## Purpose
Teach patients to clean the sulcus area systematically with zero pressure, using the Modified Bass technique.

## Scope
- **Applies to:** iTOP-trained clinicians instructing adult patients
- **Does not apply to:** children (chewing surfaces are handled differently)

## Non-negotiable rules
- [ ] Bristles must enter the sulcus. Surface brushing is not sufficient.
- [ ] Zero pressure once in the sulcus. Movement does the work, not force.
- [ ] Systematic zone coverage. No jumping between zones.

## Step-by-step protocol
1. Position the brush half on the gums and half on the teeth, bristles directed toward the sulcus. *[Source: iTOP Guidelines 2024, §3]*
2. Once in the sulcus, release all pressure. *[§3]*
3. Begin small circular movements, continuing along the jaw in overlapping strokes. *[§3]*
4. Stay in the border between soft and hard tissue, bristles always in the sulcus. *[§3]*
5. Clean all surfaces systematically. No surface left untouched. *[§3]*
6. Leave chewing surfaces until the end. *[§3]*

**Products:** CS 5460 ultra soft, CS smart

## Assessment criteria
- **Pass:** bristles visibly placed at the gingival margin; no blanching of the gingiva; zones followed in order
- **Fail:** visible pressure, bristles on the tooth surface only, or zones skipped

## Clinician notes
[CLINICIAN REVIEW REQUIRED]`,
    },
    sources: [SRC.protocols, SRC.sopTemplates, SRC.guidelines],
  }),

  lesson: () => ({
    text:
      'This 90-minute plan follows Observe → Demonstrate → Practice → Feedback. Theory stays under 15 minutes and hands-on time comes to 67%, above the 60% minimum. Participants practise on typodonts before working on each other.',
    document: {
      title: 'Lesson plan — Interdental brushing (IDB)',
      guardrail: { status: 'PASS', flags: [] },
      sources: [SRC.t2t, SRC.lessonFramework, SRC.protocols],
      body: `# iTOP Lesson Plan: Interdental Brushing

**Audience** Hygienists · **Duration** 90 min · **Date** ${today()}

## Learning objectives
- [ ] **Skill:** selects the correct CPS size for each measured space using the IAP
- [ ] **Knowledge:** explains why interdental spaces matter (about 30% of tooth surfaces)
- [ ] **Attitude:** treats non-traumatic technique as the first priority

## Materials & setup
- [ ] Typodonts, one per pair
- [ ] IAP probes and IAC charts
- [ ] CPS prime (06–011) and CPS perio (405–410) sets
- [ ] Disclosure tablets

## Session flow
| Time | Block | What happens |
|---|---|---|
| 00:00–00:05 | Hook | One patient story: bleeding gums that stopped within days |
| 00:05–00:15 | Observe | Instructor measures and brushes on a typodont, narrating each step |
| 00:15–00:30 | Demonstrate | Instructor guides one participant's hand through sizing and insertion |
| 00:30–01:15 | Practice | Pairs measure, record on IAC, insert IDBs; instructor corrects by touch |
| 01:15–01:30 | Feedback | Peer feedback in pairs; one takeaway each |

**Checkpoint:** inserts the IDB without force in 3 consecutive spaces.

## Assessment
- **Competency gate:** correct size chosen for 5 of 6 spaces, no forcing
- **Remediation:** repeat the Practice block at the next session with a 1:2 ratio

**Hands-on:** 67% — PASS (≥60%)

## Instructor notes
[INSTRUCTOR REVIEW REQUIRED]`,
    },
    sources: [SRC.t2t, SRC.lessonFramework, SRC.protocols],
  }),

  event: () => ({
    text:
      'For 16 participants at an Introductory seminar the Touch to Teach ratio is at most 1:8, so you need 2 Instructors alongside the Lecturer. The plan below covers the checklists, run sheet and stations. Remember to publish the seminar on curadenacademy.com.',
    document: {
      title: 'Event plan — iTOP Introductory, 1 day',
      guardrail: { status: 'PASS', flags: [] },
      sources: [SRC.seminarOps, SRC.eventTemplates, SRC.operational],
      body: `# iTOP Event Plan: Introductory Seminar

**Type** Introductory · **Duration** 1 day · **Participants** 16 · **Instructors** 2 (ratio 1:8)

## Pre-event checklist
- **T-4 weeks:** publish on curadenacademy.com; confirm Lecturer and 2 Instructors; book a room for island tables
- **T-1 week:** confirm materials and participant list; send joining instructions
- **T-1 day:** set up 2 islands of 8; test projector and lighting
- **Day-of:** registration, name badges, certificates ready (issued by HQ only)

## Run sheet
| Time | Activity | Lead |
|---|---|---|
| 09:00 | Welcome and the iTOP philosophy | Lecturer |
| 09:45 | Biofilm and the three criteria | Lecturer |
| 10:30 | Break | |
| 10:45 | Touch to Teach: Modified Bass on typodonts | Instructors |
| 12:30 | Lunch | |
| 13:30 | Touch to Teach: interdental brushing | Instructors |
| 15:15 | Break | |
| 15:30 | Practice on each other, peer feedback | Instructors |
| 16:30 | Wrap-up, recall invitation, evaluation | Lecturer |

## Stations
- **Island 1:** 8 participants, Instructor A, typodonts, CS and CPS sets
- **Island 2:** 8 participants, Instructor B, same kit

## Equipment master list
- [ ] Typodonts × 8
- [ ] CS 5460 brushes × 16
- [ ] CPS prime sets × 16
- [ ] IAP probes × 16
- [ ] Mirrors × 16
- [ ] Disclosure tablets × 1 box

**Hands-on:** 63% — PASS (≥60%)

## Post-event evaluation
Collect participant feedback the same day and send a recall invitation within 2 weeks.`,
    },
    sources: [SRC.seminarOps, SRC.eventTemplates, SRC.operational],
  }),

  feedback: () => ({
    text:
      'I grouped the sample feedback (14 entries) into four themes. Practical sessions scored highest. One item suggests brushing with firm pressure, which contradicts the protocol, so it is flagged and left out of the recommendations.',
    document: {
      title: 'Feedback report — Introductory, Zagreb',
      guardrail: { status: 'FLAG', flags: ['1 protocol deviation in the feedback'] },
      sources: [SRC.feedback, SRC.protocols],
      body: `# Feedback Synthesis Report

**Topic** Introductory seminar, Zagreb · **Type** Best practices · **Entries** 14 (sample data)
**Roles** 9 practitioners · 3 dentists · 2 educators
**Weighting** clinical points: dentist = practitioner > educator

## Themes
1. **Hands-on time** — 9 mentions — practitioners, dentists
2. **Interdental sizing** — 6 mentions — practitioners
3. **Pace of theory** — 4 mentions — educators
4. **Recall follow-up** — 3 mentions — dentists

## Key insights
- [ ] Participants want more time sizing IDBs on typodonts *[practitioner] [Protocol: ALIGNED]*
- [ ] Theory block ran over 15 minutes *[educator] [Protocol: ALIGNED]*

## Recommended best practices
1. Move 10 minutes from theory to the IDB practice block.
2. Hand out IAC charts at the start so sizing is recorded from the first space.

## ⚠ Protocol deviation flags
- "Press firmly so the bristles reach under the gum" contradicts **iTOP Guidelines 2024, §3** (zero pressure in the sulcus). Not used without clinician review.

## Curriculum gaps
- No guidance yet on sizing for implants in the Introductory material.`,
    },
    sources: [SRC.feedback, SRC.protocols],
  }),

  protocol: () => ({
    text: `**Solo technique** (iTOP Introduction Brochure, §5). Products: CS 1006 single brush, CS 1009.

1. No toothpaste or water. The technique relies entirely on touch feedback.
2. Take a comfortable position. A mirror isn't needed after the first orientation.
3. Place the bristles directly in the sulcus, on hard dental tissue only.
4. Clean tooth by tooth.
5. Don't skip chewing surfaces, especially deep fissures.

It is particularly useful for patients with braces and implants.`,
    sources: [SRC.protocols, SRC.brochure],
  }),

  session: () => ({
    text:
      'BOB 24% falls in the Improvement tier (10–25%) and PCR 38% in the Intensive tier (over 30%). The template focuses on supervised re-training. Every patient-facing field is marked for clinician review.',
    document: {
      title: 'Session template — Follow-up',
      guardrail: { status: 'FLAG', flags: ['Patient-facing content needs clinician review'] },
      sources: [SRC.bob, SRC.protocols, SRC.behaviour],
      body: `# iTOP Session Template

**Session type** Follow-up · **Date** ${today()}
**Clinician** [CLINICIAN REVIEW REQUIRED] · **Patient ID** [CLINICIAN REVIEW REQUIRED]

## BOB measurement summary
| Metric | Value | Tier |
|---|---|---|
| BOB% | 24% | Improvement (10–25%) |
| PCR% | 38% | Intensive (>30%) |
| MGI | — | not recorded |

**Trend:** not enough sessions to compare

## iTOP intervention plan
- **Technique focus:** Modified Bass, supervised step-by-step re-training
- **Interdental aid:** re-measure spaces with IAP; start with at most 2 CPS sizes
- **Key message:** "Let's practise the gum line together until it feels easy."

## Next session
- **Recall interval:** [CLINICIAN REVIEW REQUIRED]
- **Goal:** PCR under 30%

## Clinician notes
*Left blank for the clinician.*`,
    },
    sources: [SRC.bob, SRC.protocols, SRC.behaviour],
  }),

  academy: () => ({
    text: `For a newly certified Instructor, the usual next step is **iTOP Advanced** (2 days). It deepens practice integration and gives you 1:1 time at a 1:6 ratio.

After that, ask HQ about the mentoring route to **Lecturer**: a mentor is assigned, you prepare and present to the HQ team, and you run your first seminar with your mentor.

Course dates are published on curadenacademy.com.`,
    sources: [SRC.academy, SRC.operational],
  }),

  operational: () => ({
    text: `For an Introductory seminar the Touch to Teach ratio is **at most 1:8**, and it is a hard limit. For 20 participants you need **3 Instructors** (8 + 8 + 4), plus the Lecturer.

If you can only get 2 Instructors, cap registration at 16.`,
    sources: [SRC.operational, SRC.seminarOps],
  }),
};

function route(text: string): ProcedureId {
  const t = text.toLowerCase();
  const hit = PROCEDURES.find((p) => p.keywords.some((k) => t.includes(k)));
  return hit?.id ?? 'operational';
}

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

/** Splits into small word groups so the stream reads naturally. */
function chunks(text: string): string[] {
  return text.match(/\S+\s*/g)?.reduce<string[]>((acc, word, i) => {
    if (i % 3 === 0) acc.push(word);
    else acc[acc.length - 1] += word;
    return acc;
  }, []) ?? [text];
}

export const mockAdapter: AgentAdapter = {
  label: 'Demo mode',
  live: false,
  async *send(request: AgentRequest, signal: AbortSignal): AsyncIterable<AgentEvent> {
    const last = request.messages[request.messages.length - 1];
    const files = request.attachments ?? [];

    await sleep(600, signal); // "thinking"

    if (files.length && !last.text.trim()) {
      const names = files.map((f) => f.name).join(', ');
      for (const c of chunks(
        `Got it: ${names}. In the live version I read the file and use it alongside the knowledge pages. Tell me what you'd like: an SOP, a lesson plan, or a summary.`,
      )) {
        await sleep(35, signal);
        yield { type: 'text', delta: c };
      }
      yield { type: 'done' };
      return;
    }

    const script = SCRIPTS[request.procedure ?? route(last.text)]();
    const intro = files.length ? `I'll take ${files.map((f) => f.name).join(', ')} into account. ` : '';

    for (const c of chunks(intro + script.text)) {
      await sleep(35, signal);
      yield { type: 'text', delta: c };
    }

    if (script.document) {
      await sleep(400, signal);
      yield {
        type: 'document',
        document: {
          ...script.document,
          id: crypto.randomUUID(),
          procedure: request.procedure ?? route(last.text),
          createdAt: new Date().toISOString(),
        },
      };
    }
    yield { type: 'sources', sources: script.sources };
    yield { type: 'done' };
  },
};
