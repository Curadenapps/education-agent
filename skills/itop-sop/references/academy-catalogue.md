# Curaden Academy Course Catalogue

**Status: PLACEHOLDER — To be populated by the Curaden Academy team.**

This file is the reference for Procedure 7 (Academy Routing). Until populated, the agent will acknowledge unavailable content rather than fabricate course listings.

---

## How to Populate This File

Add course entries in the following format:

```
## {Course Title}

- **ID:** {unique course ID}
- **Role:** clinician | patient | educator
- **Topic:** {clinical area or skill}
- **Format:** video | PDF | interactive | webinar | in-person
- **Duration:** {X minutes | X hours | X CPD credits}
- **Level:** beginner | intermediate | advanced
- **URL:** {Curaden Academy URL}
- **Summary:** {1-2 sentence description — no efficacy claims without sourcing}
- **Tags:** {comma-separated keywords for matching}
```

---

## Course Areas Expected (to be completed)

Courses to be added should cover at minimum:

**Clinician-Level**
- iTOP Foundation (Modified Bass technique, BOB measurement)
- iTOP Advanced (Interdental protocols, patient communication)
- BOB App Clinical Use
- iTOP Certification Programme
- CPD: Behaviour Change in Oral Health Coaching

**Educator-Level**
- iTOP Train the Trainer
- Touch-to-Teach Facilitation Skills
- Designing iTOP Workshop Programmes

**Patient-Level**
- Understanding Your BOB Score
- Home Care Technique Guide

---

## Guardrail

The agent must not generate course listings that are not documented here.
If no match is found, output:

```
No Academy course currently matches "{topic}" for role "{role}".
Please ask the Curaden Academy team to add relevant content to academy-catalogue.md,
or contact Curaden Academy directly for available programmes.
```
