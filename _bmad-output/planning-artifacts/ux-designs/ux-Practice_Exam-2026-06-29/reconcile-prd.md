# Reconcile: PRD → UX Spines

**Source:** `_bmad-output/planning-artifacts/prds/prd-Practice_Exam-2026-06-29/prd.md`  
**Targets:** `DESIGN.md`, `EXPERIENCE.md`  
**Date:** 2026-06-29  
**Method:** Fast-path batch reconciliation

## Summary

UX spines fully cover PRD MVP scope across three surfaces. All six user journeys (UJ-1–UJ-6) map to named screens and Key Flows. Functional requirements FR-1–FR-46 are addressed at the UX behavior layer; implementation detail deferred to architecture per PRD intent.

**Gaps found:** 0 blocking.  
**Dropped ideas:** None — PRD is prescriptive; no qualitative ideas omitted.  
**UX additions beyond PRD:** Screen IDs for traceability; component token names; Vietnamese microcopy examples; Zalo 3-tab IA [ASSUMPTION].

---

## Journey Coverage

| Journey | PRD reference | UX coverage | Climax beat |
|---|---|---|---|
| UJ-1 Linh free practice (Zalo) | §2.3 | Z-01→Z-23 flow; Z-91 OAuth edge | Free Tier cap clearly shown 20/20 |
| UJ-2 Linh subscribes (Zalo) | §2.3 | Z-24→Z-26; Z-11 badge | "Đang hoạt động đến {date}" green pill |
| UJ-3 Minh links accounts | §2.3 | W-51→W-52; Z-10 parity | Identical subscription on web and Zalo |
| UJ-4 Linh Mock Exam | §2.3 | Z-30→Z-35; Z-40 analytics | Section breakdown matching CNVCK weights |
| UJ-5 Hương publishes | §2.3 | A-31→A-41; A-32 preview | Preview matches candidate rendering |
| UJ-6 Trung configures Subject | §2.3 | A-21→A-52; A-10 dashboard | Catalog reflects admin config on Zalo |

---

## Feature / FR Mapping

| PRD feature | FRs | UX surface |
|---|---|---|
| Authentication & Identity | FR-1–3 | Z-01, W-01–02, W-51–52, Z-51, Z-91, W-91 |
| Subject Catalog & Subscriptions | FR-4–7 | Z-10–11, W-10–11, Z-23–26, W-23–26 |
| Practice Mode | FR-8–9 | Z-20–22, W-20–22; flag on Z-21 |
| Mock Exams | FR-10–12 | Z-30–35, W-30–35 |
| Progress Analytics | FR-13–14 | Z-40–42, W-40–42 |
| Legal & Disclaimers | FR-15–16 | Z-02, W-03, disclaimer banner; tone rules |
| Editorial Workflow | FR-17–20 | A-30–42 |
| Question Bank Admin | FR-21–24 | A-30–33 |
| Subject Admin | FR-25–27 | A-20–22 |
| Mock Exam Config | FR-28–30 | A-50–52 |
| User Management | FR-31–35 | A-60–65 |
| Payments Admin | FR-36–40 | A-70–74 |
| Zalo Integration | FR-41–43 | A-80–83; Z-24–25 |
| RBAC & Settings | FR-44–46 | A-90–92; Z-90, W-90 |

---

## NFR Alignment

| NFR (PRD §8) | UX treatment |
|---|---|
| Performance <3s / 500ms question transition | Skeleton cold loads; optimistic answer submit |
| WCAG 2.1 AA web | Accessibility Floor section |
| Zalo a11y guidelines | 44px targets; platform rules noted |
| Vietnamese UI, VND | Voice and Tone; formatting conventions |
| Legal disclaimer | Z-02, W-03, persistent banner component |

---

## PRD Assumptions Inherited

All PRD §16 assumptions accepted without UX conflict. UX-specific assumptions indexed in EXPERIENCE.md §Assumptions Index (UX-A1–A12).

---

## Deferred / Out of Scope (confirmed not in UX)

Matches PRD §5, §6.2: no native apps, no auto-renew UI, no study groups/chat, no gamification, no B2B, no multi-vertical, no VAT invoice UI, no impersonation mode.

---

## Qualitative Ideas

PRD did not specify visual brand. UX fast path inferred professional navy/green palette and shadcn/ui — flagged `[ASSUMPTION]` in DESIGN.md and EXPERIENCE.md for stakeholder confirmation.

---

## Reconciliation verdict

**PASS** — UX spines ready for `bmad-architecture`. Recommend confirming UX-A3 (brand colors) and UX-A4 (logo) before marketing creative.
