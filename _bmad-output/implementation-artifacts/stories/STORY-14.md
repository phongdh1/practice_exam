---
id: STORY-14
story_key: 3-14-platform-disclaimer-guardrails
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-15", "FR-16"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
  - date: "2026-06-30"
    prd_version_or_updated: "EPIC-3 implementation"
    change_summary: "Platform disclaimer CMS, UI guardrails, and prohibited-claims scanner"
    story_delta: "Implemented — ready for review"
---

# STORY-14: Platform disclaimer and prohibited claims guardrails

**Epic:** EPIC-3

As a **Candidate**,  
I want **to see UBCKNN non-affiliation disclaimer and trust that marketing copy is compliant**,  
So that **I understand this is not an official exam product**.

## Acceptance Criteria

### AC-1

**Given** first visit requires Z-02/W-03 disclaimer acknowledgment  

**When** persistent footer disclaimer is always accessible  

**Then** disclaimer text is loaded from system settings CMS field  

**And** Question/Subject text is blocked or flagged for prohibited phrases

## Tasks/Subtasks

- [x] Add `SystemSetting` model with `platform_disclaimer` CMS field and public GET endpoint
- [x] Implement prohibited-claims scanner in `@practice-exam/utils` and API content-compliance service
- [x] Block/flag Subject text on write; filter non-compliant Subject descriptions from candidate catalog
- [x] Add `DisclaimerModal` (Z-02/W-03), `DisclaimerFooter`, and `DisclaimerGate` in `@practice-exam/ui`
- [x] Wire disclaimer on web and Zalo candidate surfaces; run `pnpm test` and `pnpm build`

## Dev Notes

- Disclaimer text admin-configurable via `SystemSetting` CMS field (PRD FR-15)
- First visit modal acknowledgment required; persistent compact footer (EXPERIENCE.md Z-02/W-03)
- Prohibited phrases: guaranteed pass, official exam questions, implied government endorsement (FR-16)
- DESIGN.md disclaimer yellow tokens for banner styling

## Dev Agent Record

### Implementation Plan
`SystemSetting` with seeded `platform_disclaimer`; public `GET /settings/disclaimer`; `scanProhibitedClaims` in utils + `ContentComplianceService`; catalog filters non-compliant subjects; `DisclaimerGate` on web/Zalo candidate pages.

### Debug Log

### Completion Notes
✅ Disclaimer text loaded from `SystemSetting.platform_disclaimer` CMS field via `GET /api/v1/settings/disclaimer`.  
✅ `DisclaimerGate` shows Z-02/W-03 first-visit modal and persistent footer on web and Zalo catalog/detail.  
✅ `scanProhibitedClaims` flags prohibited phrases; `ContentComplianceService.assertCompliant` blocks writes.  
✅ Candidate catalog excludes subjects with prohibited name/description text.  
✅ Review follow-up: admin Subject write paths call assertCompliant; disclaimer gate uses fallback when CMS pending/fails; matchAll for all prohibited-phrase occurrences.  
✅ `pnpm test` and `pnpm build` pass.

## File List

- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260630140000_free_tier_and_settings/migration.sql
- apps/api/src/settings/**
- apps/api/src/content-compliance/**
- apps/api/src/subjects/subjects.service.ts
- apps/api/src/app.module.ts
- packages/types/src/index.ts
- packages/utils/src/content-compliance.ts
- packages/utils/src/content-compliance.test.ts
- packages/utils/src/index.ts
- packages/api-client/src/index.ts
- packages/ui/src/components/disclaimer-modal.tsx
- packages/ui/src/components/disclaimer-footer.tsx
- packages/ui/src/components/disclaimer-gate.tsx
- packages/ui/tailwind-preset.js
- packages/ui/src/index.ts
- packages/ui/src/index.test.ts
- apps/web/src/app/page.tsx
- apps/web/src/app/subjects/[id]/page.tsx
- apps/zalo-mini-app/src/main.tsx
- _bmad-output/implementation-artifacts/stories/STORY-14.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log

| Date | Change |
|------|--------|
| 2026-06-30 | Bootstrapped implementation story (STORY-14) |
| 2026-06-30 | Implemented platform disclaimer and prohibited-claims guardrails (STORY-14) |

## Status

review

### Review Findings

- [x] [Review][Patch] `assertCompliant` is not invoked on any Subject write/admin path — compliance only filters candidate reads [`apps/api/src/content-compliance/content-compliance.service.ts`]
- [x] [Review][Patch] Disclaimer gate is skipped when CMS fetch fails or is still pending — first-visit acknowledgment is not enforced [`apps/web/src/app/page.tsx:93-95`]
- [x] [Review][Patch] `scanProhibitedClaims` reports at most one match per rule (`exec` not global) — multiple occurrences in the same text are under-reported [`packages/utils/src/content-compliance.ts:34`]
- [x] [Review][Defer] Question text compliance not implemented — no Question model in codebase yet (AC partial) — deferred until Question content epic

### Senior Developer Review (AI)

**Outcome:** Changes Requested → fixes applied (2026-06-30)

- [x] Admin Subject create/update wired to assertCompliant
- [x] DisclaimerGate always shown with FALLBACK_PLATFORM_DISCLAIMER
- [x] scanProhibitedClaims uses matchAll for all occurrences
