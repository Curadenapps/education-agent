# SOP Templates

Reference for Procedure 1 (SOP & Guideline Generator).

## SOP Types

| Type | Use Case | Review Cycle |
|---|---|---|
| Clinical SOP | Patient-facing procedures, technique protocols | Annual minimum |
| Educational SOP | Teaching delivery, assessment criteria, instructor conduct | Annual minimum |
| Operational SOP | Equipment setup, hygiene, facility protocols | Annual minimum |

## Mandatory Sections (all SOP types)

Every generated SOP must include all of the following. No section may be omitted.

1. **Header** — Title, version, date, audience, source citation
2. **Purpose** — 1–2 sentences stating what the SOP governs
3. **Scope** — Who it applies to and explicit exclusions
4. **Non-Negotiable Rules** — Checkbox list; these are hard requirements, not guidelines
5. **Step-by-Step Protocol** — Numbered, sequential, observable actions
6. **Assessment Criteria** — Pass/fail in observable behavioural terms
7. **Clinician Notes** — Always `[CLINICIAN REVIEW REQUIRED]` for clinical SOPs
8. **References** — Source attribution with section number

## Version Control

- Version numbering: `1.0`, `1.1` (minor), `2.0` (major revision)
- All changes require re-review and updated date
- Superseded versions must be archived, not deleted
- Version history block at document footer:

```
VERSION HISTORY
  v1.0 | {ISO date} | Initial release
  v1.1 | {ISO date} | {Change summary}
```

## Deviation Logging

If a practitioner deviates from a clinical SOP, log using:

```
DEVIATION LOG
  Date: {ISO date}
  SOP: {title} v{version}
  Section: {step number}
  Deviation: {description}
  Reason: {justification}
  Clinician review: [REQUIRED]
```

## Non-Negotiable Rule Format

Rules in the Non-Negotiable section must be:
- Written as observable actions (not intentions)
- Prefixed with □ checkbox
- Specific enough to be auditable
- Cross-referenced to iTOP Guidelines section where applicable

Example:
```
□ Apply Modified Bass technique with 45° bristle angulation at gingival margin [iTOP §3.2]
□ Complete all 6 zones before moving to interdental phase [iTOP §3.4]
□ Do not proceed to patient without typodont competency checkpoint [iTOP §5.1]
```
