# Input Reconciliation — Product Brief

**Input:** `_bmad-output/planning-artifacts/briefs/brief-Practice_Exam-2026-06-29/brief.md` + `addendum.md`  
**Against:** `prd.md` + `addendum.md`  
**Run at:** 2026-06-29

## Summary

Brief content is **fully captured** in the PRD at MVP scope. Technical overflow correctly delegated to PRD addendum. Four qualitative gaps surfaced and resolved during finalize.

## Coverage

| Brief element | PRD location | Status |
|---|---|---|
| CNVCK-only vertical | §1, §5, §6 | ✓ |
| Web + Zalo Mini App | §4.1, §10 | ✓ |
| Freemium + per-Subject subscription | §4.2, §11 | ✓ |
| Editorial workflow | §4.7 | ✓ |
| Cross-channel identity | §4.1 FR-2, FR-3 | ✓ |
| Payments (ZaloPay, VNPay, MoMo) | §4.2 FR-6, §4.12 | ✓ |
| Legal disclaimers | §4.6, §9 | ✓ |
| Admin back-office domains | §4.8–§4.14 | ✓ |
| Out-of-scope items | §5, §6.2 | ✓ |
| Success criteria | §7 | ✓ |
| Risks | §12 | ✓ |
| Tech direction (non-binding) | PRD addendum | ✓ |

## Gaps Found and Resolved

1. **Launch Subject list unspecified in brief** — PRD §13 adds phased launch plan (2 Subjects day 1, 6 within 90 days) aligned with Thông tư 135/2025 eight-program framework.
2. **Free tier exact defaults** — Brief said TBD; PRD sets 20/month with ICT reset (§14 #6).
3. **Account merge behavior** — Brief addendum flagged as assumption; PRD FR-3 confirms merge-all-progress.
4. **Full sát hạch mock exam timing** — Brief implied exam-faithful mocks; PRD §13.3 defers cross-Subject sát hạch mock until all 8 Subjects active; per-Subject mocks at launch.

## Not in Brief (PRD additions — intentional)

- Named user journeys (UJ-1–6) — required for UX downstream
- Go-live content gate (200 Questions + mock template) — operational readiness
- Phase 2 Subject rollout timeline — de-risking launch
- Counter-metrics SM-C1, SM-C2 — conversion quality guardrails

## Verdict

**Reconciled.** No blocking gaps remain between brief and PRD.
