import type { ProcedureId } from './types';

/** The 8 procedures in agents/education-agent-procedures.md, as the UI presents them. */
export interface Procedure {
  id: ProcedureId;
  label: string;
  /** What the chip sends as the user's message. */
  prompt: string;
  /** One line on the start screen. */
  blurb: string;
  /** True when the procedure produces a document for the panel. */
  makesDocument: boolean;
  /** Keywords for routing free text in demo mode. */
  keywords: string[];
}

export const PROCEDURES: Procedure[] = [
  {
    id: 'sop',
    label: 'Create SOP',
    prompt: 'Create an SOP for the Modified Bass technique for clinicians.',
    blurb: 'Step-by-step protocol with sources and clinician review fields.',
    makesDocument: true,
    keywords: ['sop', 'guideline', 'standard operating', 'procedure for'],
  },
  {
    id: 'lesson',
    label: 'Lesson plan',
    prompt: 'Build a 90-minute Touch to Teach lesson plan on interdental brushing for hygienists.',
    blurb: 'ODPF session flow with at least 60% hands-on time.',
    makesDocument: true,
    keywords: ['lesson', 'touch to teach', 't2t', 'odpf', 'teach'],
  },
  {
    id: 'event',
    label: 'Event plan',
    prompt: 'Plan a 1-day iTOP Introductory seminar for 16 participants.',
    blurb: 'Checklists, run sheet, stations, ratios and materials.',
    makesDocument: true,
    keywords: ['event', 'seminar plan', 'workshop', 'cpd day', 'plan a'],
  },
  {
    id: 'feedback',
    label: 'Synthesise feedback',
    prompt: 'Synthesise the feedback from last month’s Introductory seminar in Zagreb.',
    blurb: 'Themes, weighted insights and protocol deviation flags.',
    makesDocument: true,
    keywords: ['feedback', 'synthes', 'survey', 'evaluation'],
  },
  {
    id: 'protocol',
    label: 'Protocol lookup',
    prompt: 'What are the steps of the Solo technique?',
    blurb: 'Verbatim protocol wording with its source document.',
    makesDocument: false,
    keywords: ['protocol', 'steps of', 'technique', 'bass', 'solo', 'idb', 'floss'],
  },
  {
    id: 'session',
    label: 'Session template',
    prompt: 'Make a follow-up session template for a patient with BOB 24% and PCR 38%.',
    blurb: 'Patient session sheet mapped from BOB measurements.',
    makesDocument: true,
    keywords: ['session template', 'bob', 'pcr', 'patient session'],
  },
  {
    id: 'academy',
    label: 'Find a course',
    prompt: 'Which Academy course should a newly certified Instructor take next?',
    blurb: 'Matches a role and goal to Curaden Academy courses.',
    makesDocument: false,
    keywords: ['course', 'academy', 'certification', 'become', 'cpd'],
  },
  {
    id: 'operational',
    label: 'Ask a question',
    prompt: 'How many instructors do I need for 20 participants at an Introductory seminar?',
    blurb: 'Ratios, fees, brand rules, checklists and HQ contacts.',
    makesDocument: false,
    keywords: ['how many', 'ratio', 'instructor', 'price', 'fee', 'brand', 'logo', 'can i'],
  },
];

export const procedureById = (id: ProcedureId) => PROCEDURES.find((p) => p.id === id)!;

export const DOC_TYPE_LABEL: Record<ProcedureId, string> = {
  sop: 'SOP',
  lesson: 'Lesson plan',
  event: 'Event plan',
  feedback: 'Feedback report',
  protocol: 'Protocol',
  session: 'Session template',
  academy: 'Course match',
  operational: 'Answer',
};
