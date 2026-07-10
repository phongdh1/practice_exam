# PRD Quality Review — Practice Exam CNVCK MVP

## Overall verdict

This PRD is **decision-ready for MVP build**. The thesis (affordable per-Subject CNVCK practice via Zalo + web) is coherent, FRs are testable, scope omissions are explicit, and launch phasing de-risks content inventory. Residual risk is content ops velocity (200 Questions × 2 Subjects before go-live) and Zalo review compliance — both acknowledged in §12–§13.

**Grade: Good** — all dimensions adequate or strong; no critical findings post-finalize.

## Decision-readiness — strong

Trade-offs are honest: no auto-renew, no VAT invoices at launch, phased Subject rollout, full sát hạch mock deferred. §14 Resolved Decisions closes the open questions that blocked UX/architecture. Non-goals in §5 prevent scope creep.

### Findings
- **[low]** VAT deferral threshold informal (§15) — "monthly revenue > 50M VND" is a placeholder. *Fix:* Legal review before launch marketing.

## Substance over theater — strong

UJs drive real FR chains (Linh free → pay → mock; Minh link; Hương editorial). SMs validate conversion and cross-channel sync, not vanity DAU. Counter-metrics prevent gaming Free Tier.

### Findings
- None post-finalize.

## Strategic coherence — strong

Features serve the per-Subject affordable practice thesis. MVP scope kind is revenue + problem-solving hybrid — freemium proves quality, subscription proves willingness to pay. Phase 1 (2 Subjects) matches "smallest thing that validates."

### Findings
- None.

## Done-ness clarity — adequate

46 FRs each have testable consequences. FR-11 navigation rules now explicit (forward within section, review before submit). Go-live gate on FR-25 is measurable (≥200 Questions + mock template).

### Findings
- **[medium]** Admin impersonation deferred (§6.2) — support may need workarounds early. *Fix:* Document manual User lookup workflow in ops runbook (architecture/addendum).

## Scope honesty — strong

§5 Non-Goals, §6.2 Out of Scope table, §15 Deferred Items, and 22 indexed assumptions. Phase 2 timeline (90 days) is a commitment that may need PM revisit if editorial velocity lags.

### Findings
- **[low]** Phase 2 "90 days" is aspirational, not tied to SM. *Fix:* Track Subject activation count as operational KPI outside PRD.

## Downstream usability — strong

Glossary (20 terms) used consistently. FR/UJ/SM IDs contiguous. UJs have named protagonists. Addendum holds RBAC matrix and data model for architecture extraction.

### Findings
- None.

## Shape fit — strong

Consumer + multi-stakeholder B2B (editors, admins) — UJ density appropriate. Admin FRs grouped for epic decomposition without listing 80+ atomic functions in PRD body.

### Findings
- None.

## Mechanical notes

- Assumptions Index (§16) roundtrips with inline tags — verified.
- Section renumbering after finalize: §13 Launch Content, §14 Resolved, §15 Deferred, §16 Assumptions — consistent.
- Brief addendum admin inventory marked defer where not in MVP FRs — see PRD addendum.
