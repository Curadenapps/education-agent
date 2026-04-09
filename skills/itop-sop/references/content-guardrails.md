# Content Guardrails

Apply to every agent output without exception. These rules extend the original itop-academy guardrails with educational and SOP-specific additions.

---

## Clinical Guardrails

| Rule | Requirement |
|---|---|
| No autonomous efficacy claims | Never output "reduces bleeding", "improves gum health", "clinically proven" without approved Curaden source + clinician review flag |
| No diagnosis | Never suggest clinical diagnoses. Describe measurements and observations only |
| No prescription | Never recommend specific brand products without approval in iTOP product reference |
| Clinician gate on patient output | All patient-intended content requires `[CLINICIAN REVIEW REQUIRED]` — no exceptions |
| Legal gate on marketing | Webflow/marketing channel output must pass through webflow agent compliance check before publishing |
| No fabrication | State clearly when protocols or courses are unavailable — do not invent content |

## Educational Guardrails

| Rule | Requirement |
|---|---|
| No unsubstantiated learning outcome claims | Do not claim a lesson plan "will improve" clinical outcomes without source citation |
| Observable competency gates | All assessment criteria must describe observable behaviours — not abstract qualities (e.g., "demonstrates 45° angulation" not "understands Bass technique") |
| Hands-on minimum | Lesson plans and training events must achieve ≥60% hands-on practical time. Flag output if not met |
| Technology boundary | Do not generate lesson plans that depend on technology. Note technology as a future enhancement layer only |
| Instructor review gate | All lesson plans require `[INSTRUCTOR REVIEW REQUIRED]` on the instructor notes section |

## SOP Guardrails

| Rule | Requirement |
|---|---|
| Source every step | Every SOP step must cite an iTOP Guidelines section — no undocumented protocol steps |
| No invented protocols | If a topic is not covered in `itop-protocols.md`, state the gap — do not fabricate |
| Version control required | Every SOP output must include version number and date |
| Deviation logging | Advise practitioners that deviations must be logged using the deviation log format |

## Feedback Guardrails

| Rule | Requirement |
|---|---|
| Contradictions flagged | Feedback that contradicts iTOP Guidelines must be flagged with `⚠ PROTOCOL DEVIATION FLAG` — never silently incorporated |
| Role weighting disclosed | Synthesis reports must state the weighting applied per source role |
| No anonymous fabrication | Do not generate "representative feedback" — only synthesize provided entries |

## Dropbox Guardrail

| Setting | Behaviour |
|---|---|
| `dry_run: false` | Write file to Dropbox path and return confirmed path |
| `dry_run: true` | Log intended Dropbox path in output — do not write |
| `save_to_dropbox: false` | Skip Dropbox write entirely; return output inline only |

## Guardrail Output Format

Every procedure output must end with:
```
Guardrail: PASS
```
or
```
Guardrail: FLAG
  - {flag reason 1}
  - {flag reason 2}
```

A `FLAG` status does not block output — it marks the content for human review before use.
