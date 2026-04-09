# Feedback Synthesis Guidelines

Reference for Procedure 4 (Feedback Synthesizer).

---

## Feedback Collection Templates

### Practitioner / Clinician Feedback
```
PRACTITIONER FEEDBACK
  Role: practitioner | dentist | hygienist
  Topic: {clinical area or session}
  Date: {ISO date}
  1. What worked well in practice?
  2. What was harder to apply than expected?
  3. Any technique variations that produced better results?
  4. Anything in the protocol that felt unclear or impractical?
  5. Tips for other practitioners:
```

### Educator Feedback
```
EDUCATOR FEEDBACK
  Role: educator | trainer | facilitator
  Topic: {session or curriculum area}
  Date: {ISO date}
  1. Which part of the session had the highest engagement?
  2. Where did learners struggle most?
  3. What teaching approach worked best?
  4. Gaps in the current materials?
  5. Recommendations for curriculum revision:
```

### Student Feedback
```
STUDENT FEEDBACK
  Role: dental_student | student
  Topic: {skill or session}
  Date: {ISO date}
  1. What clicked for you today?
  2. What still feels unclear or difficult?
  3. What would have helped you learn faster?
```

---

## Thematic Categorization Taxonomy

Assign every feedback entry to one or more themes:

| Theme | Description |
|---|---|
| technique | Feedback on physical execution of a clinical skill |
| timing | Feedback on session pacing, duration, or order |
| motivation | Feedback on engagement, relevance, or professional buy-in |
| comprehension | Feedback on clarity of instructions, protocols, or rationale |
| equipment | Feedback on tools, typodonts, or materials |
| curriculum | Feedback on what's missing, sequencing, or depth |
| protocol | Feedback that relates to or contradicts iTOP protocol steps |

---

## Source Role Weighting

Applied when feedback entries conflict or when synthesizing for clinical recommendations:

| Role | Weight | Rationale |
|---|---|---|
| dentist | High | Clinical expertise; patient outcome accountability |
| practitioner / hygienist | High | Direct frontline application experience |
| educator | Medium | Instructional expertise; less direct clinical accountability |
| student | Low (for clinical content) / High (for curriculum gaps) | Valuable for learning experience; limited clinical authority |

Always disclose weighting used in synthesis output.

---

## Protocol Deviation Flagging

When any feedback entry appears to suggest or justify deviating from iTOP Guidelines:

1. Identify the relevant iTOP Guidelines section
2. Flag the entry as `⚠ PROTOCOL DEVIATION FLAG`
3. Do NOT incorporate the deviation into recommendations
4. Include in output under "Protocol Deviation Flags" section for clinician review

Example:
```
⚠ PROTOCOL DEVIATION FLAG
  Entry: "I find angling the brush at 30° works better for my patients"
  iTOP Reference: §3.2 specifies 45° angulation
  Action: Flag for clinician review — do not update SOP
```

---

## Synthesis Report Structure

```
FEEDBACK SYNTHESIS REPORT
  Topic: {topic}
  Entries analysed: {N}
  Roles represented: {breakdown}
  Synthesis type: {best_practices | tips_tricks | curriculum_gaps | educational_insights}
  Weighting applied: {role weighting disclosure}

THEMES (by frequency)
  1. {theme} — {N} mentions — {roles}

KEY INSIGHTS
  □ {insight} [Role: {source}] [Protocol: ALIGNED | FLAG]

RECOMMENDED BEST PRACTICES
  1. {actionable recommendation}

TIPS & TRICKS (Practitioner-sourced)
  • {tip from practitioner/dentist}

CURRICULUM GAPS
  • {identified gap}

PROTOCOL DEVIATION FLAGS
  ⚠ {entry summary} — contradicts §{X} — requires clinician review

EDUCATIONAL INSIGHTS (Psychology-informed)
  • {insight linked to spaced repetition / cognitive load / deliberate practice}
```
