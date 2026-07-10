# Reconcile: Sprint Change Proposal — Study Mode → UX Spines

**Source:** `_bmad-output/planning-artifacts/sprint-change-proposal-2026-07-09-study-mode.md`  
**PRD:** `prd-Practice_Exam-2026-06-29/prd.md` (FR-47, UJ-7, Study Tier)  
**Targets:** `EXPERIENCE.md`, `DESIGN.md`  
**Date:** 2026-07-09  
**Method:** Fast-path Update mode (approved PRD; no reviewer gate)

## Summary

Additive UX update for Study Mode. No rollback of prior Practice Mode screens (Z-20–22). New screen band Z-12–14 / W-12–14 inserted between Subject detail and Practice setup.

**Gaps found:** 0 blocking.  
**Conflicts with prior UX:** 1 intentional clarification (see below).  
**Dropped ideas:** None from sprint proposal.

---

## Prior UX vs PRD Study Rules

| Topic | Prior UX (2026-06-29) | PRD / Sprint (2026-07-09) | Resolution |
|---|---|---|---|
| Free Tier meter copy | "Đã dùng {n}/20 câu **miễn phí** tháng này." | "câu **luyện tập** miễn phí" to distinguish from Study | **Updated** — clearer dual-pool labeling on Z-11/W-11 |
| Study Mode screens | Not in IA | Z-12–14 / W-12–14 | **Added** |
| UJ-7 | Not in Key Flows | Named journey with Linh | **Added** |
| Subject detail CTAs | Practice + Mock only | Study + Practice + Mock coexist | **Updated** Z-11/W-11 component patterns |
| Paywall | Z-23 Free Tier only | Z-14 Study Tier (separate) | **Added** Z-14/W-14; Z-23 unchanged for practice cap |

No contradiction on entitlement semantics — prior UX simply predated Study Mode. Server-side gating (list stem-only, detail consumes view) is behavioral spec in EXPERIENCE.md; architecture owns enforcement.

---

## New Screen Coverage

| Screen ID | Purpose | PRD ref |
|---|---|---|
| Z-12 / W-12 | Study question list (no answers) | FR-47 |
| Z-13 / W-13 | Study detail (answer + explanation) | FR-47 |
| Z-14 / W-14 | Study Tier paywall (default 5 views) | FR-47 |
| Z-11 / W-11 (update) | Study CTA + Study Tier meter | FR-47, UJ-7 |

---

## DESIGN.md Delta

Minimal component additions only:

- `{components.study-meter-badge}`
- `{components.study-question-row}` / `{components.study-question-row-locked}`
- Study detail reuses `{components.answer-option-correct}` read-only

---

## Reconciliation Verdict

**PASS** — UX spines aligned with approved PRD FR-47 and sprint proposal §8.8–8.9. Ready for `bmad-create-story` (STORY-65..68).
