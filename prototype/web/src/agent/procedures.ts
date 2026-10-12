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
  /** Live mode: put in the message box for the person to finish (documents only). */
  starter?: string;
  /** Keywords for routing free text in demo mode. */
  keywords: string[];
}

export const PROCEDURES: Procedure[] = [
  {
    id: 'sop',
    label: 'SOP',
    prompt: 'Create an SOP for the Modified Bass technique for clinicians.',
    blurb: 'A step-by-step procedure your team can follow.',
    starter: 'Please create an SOP about ',
    makesDocument: true,
    keywords: ['sop', 'guideline', 'standard operating', 'procedure for'],
  },
  {
    id: 'lesson',
    label: 'Lesson plan',
    prompt: 'Build a 90-minute Touch to Teach lesson plan on interdental brushing for hygienists.',
    blurb: 'A Touch to Teach session plan, mostly hands-on.',
    starter: 'Please create a lesson plan about ',
    makesDocument: true,
    keywords: ['lesson', 'touch to teach', 't2t', 'odpf', 'teach'],
  },
  {
    id: 'event',
    label: 'Seminar plan',
    prompt: 'Plan a 1-day iTOP Introductory seminar for 16 participants.',
    blurb: 'Checklists, timetable, staff and materials for a seminar.',
    starter: 'Please plan a seminar: type (Introductory, Advanced or Recall), number of participants, and date: ',
    makesDocument: true,
    keywords: ['event', 'seminar plan', 'workshop', 'cpd day', 'plan a'],
  },
  {
    id: 'feedback',
    label: 'Feedback summary',
    prompt: 'Synthesise the feedback from last month’s Introductory seminar in Zagreb.',
    blurb: 'The main points from participant feedback.',
    starter: 'Please summarise this feedback (paste it below, with who wrote each comment):\n',
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
    label: 'Patient session sheet',
    prompt: 'Make a follow-up session template for a patient with BOB 24% and PCR 38%.',
    blurb: 'A session sheet based on a patient’s BOB results.',
    starter: 'Please make a patient session sheet. Session type (first visit, follow-up or re-check), BOB %, PCR %: ',
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
  event: 'Seminar plan',
  feedback: 'Feedback summary',
  protocol: 'Protocol',
  session: 'Patient session sheet',
  academy: 'Course match',
  operational: 'Answer',
};

/** Label for use mid-sentence ("Your seminar plan is ready"); keeps acronyms like SOP. */
export const docNoun = (id: ProcedureId) => (DOC_TYPE_LABEL[id] === 'SOP' ? 'SOP' : DOC_TYPE_LABEL[id].toLowerCase());

/** Start-screen groupings. */
export const DOCUMENT_TYPES = PROCEDURES.filter((p) => p.makesDocument);
export const EXAMPLE_QUESTIONS = PROCEDURES.filter((p) => !p.makesDocument);
