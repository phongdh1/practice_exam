---
id: STORY-13
story_key: 3-13-free-tier-entitlement-enforcement
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-5"]
ad_refs: ["AD-11"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
  - date: "2026-06-30"
    prd_version_or_updated: "EPIC-3 implementation"
    change_summary: "Free Tier entitlement enforcement with server-side tracking and UI paywall"
    story_delta: "Implemented — ready for review"
---

# STORY-13: Free Tier entitlement enforcement

**Epic:** EPIC-3

As a **Candidate**,  
I want **to practice up to the monthly Free Tier limit per Subject without subscribing**,  
So that **I can try the product before paying**.

## Acceptance Criteria

### AC-1

**Given** Free Tier counter resets ICT midnight on 1st of month per User per Subject  

**When** default limit is 20 questions (admin-overridable)  

**Then** at limit Practice Mode shows subscribe prompt Z-23/W-23  

**And** Free Tier does not grant Mock Exam access

## Tasks/Subtasks

- [x] Add `FreeTierUsage` Prisma model, migration, and ICT period utility in `@practice-exam/utils`
- [x] Implement `EntitlementsModule` with usage tracking, atomic consume, and mock-exam gate (server-side)
- [x] Add authenticated entitlement API endpoints and `api-client` methods
- [x] Wire catalog/detail UI meters from real entitlement data; add Free Tier paywall (Z-23/W-23)
- [x] Add unit/integration tests; run `pnpm test` and `pnpm build`

## Dev Notes

- Free Tier counter resets ICT (`Asia/Ho_Chi_Minh`) midnight on 1st of month per User per Subject (PRD FR-5, §14 #6)
- Default limit 20 from `SubjectPricing.freeTierLimit` (admin-overridable)
- Server-authoritative entitlement per AD-11; atomic increment on practice consume
- Mock Exam requires active Subscription; Free Tier does not grant access
- STORY-12 UI meters currently show 0/limit placeholder — wire from `GET /entitlements/free-tier`
- Paywall copy per EXPERIENCE.md Z-23/W-23

## Dev Agent Record

### Implementation Plan
`FreeTierUsage` model with ICT period key; `EntitlementsService` for list/consume/mock-exam gate; authenticated REST endpoints; web BFF routes for cookie auth; Zalo direct API; UI meters and `FreeTierPaywall` on subject detail practice action.

### Debug Log

### Completion Notes
✅ `GET /api/v1/entitlements/free-tier` and subject-scoped endpoints track usage per User/Subject/ICT month.  
✅ `POST /api/v1/entitlements/:subjectId/consume` atomically enforces limit server-side (`FREE_TIER_EXCEEDED`).  
✅ Mock exam access denied without active subscription (`MOCK_EXAM_REQUIRES_SUBSCRIPTION`).  
✅ Catalog/detail UI meters wired from real entitlement data when authenticated.  
✅ Free Tier paywall (Z-23/W-23) shown at limit on practice action.  
✅ Review follow-up: atomic consume (createMany + conditional updateMany); entitlements e2e tests; web 401 UX; server mock-exam gate via BFF.  
✅ `pnpm test` (43 API tests) and `pnpm build` pass.

## File List

- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260630140000_free_tier_and_settings/migration.sql
- apps/api/src/entitlements/**
- apps/api/src/app.module.ts
- apps/api/package.json
- packages/types/src/index.ts
- packages/utils/src/ict-period.ts
- packages/utils/src/ict-period.test.ts
- packages/utils/src/index.ts
- packages/api-client/src/index.ts
- packages/api-client/src/index.test.ts
- packages/ui/src/components/free-tier-paywall.tsx
- packages/ui/src/components/subject-detail-view.tsx
- packages/ui/src/index.ts
- apps/web/src/app/page.tsx
- apps/web/src/app/subjects/[id]/page.tsx
- apps/web/src/app/api/entitlements/**
- apps/zalo-mini-app/src/main.tsx
- _bmad-output/implementation-artifacts/stories/STORY-13.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log

| Date | Change |
|------|--------|
| 2026-06-30 | Bootstrapped implementation story (STORY-13) |
| 2026-06-30 | Implemented Free Tier entitlement enforcement (STORY-13) |

## Status

review

### Review Findings

- [x] [Review][Patch] Free Tier consume has a TOCTOU race — concurrent POSTs at the limit boundary can exceed the monthly cap [`apps/api/src/entitlements/entitlements.service.ts:93-122`]
- [x] [Review][Patch] No e2e/integration tests for entitlements HTTP endpoints (consume, mock-exam gate) [`apps/api/src/entitlements/`]
- [x] [Review][Patch] Web practice action fails silently for unauthenticated users (401 with no user feedback) [`apps/web/src/app/subjects/[id]/page.tsx:59-65`]
- [x] [Review][Patch] Mock exam gate uses client-side `alert()` instead of server `assertMockExamAccess` and proper blocked-state UI [`apps/web/src/app/subjects/[id]/page.tsx:71-75`]
- [x] [Review][Defer] `Subscription.subjectId` is an untyped String without FK to `subjects.id` [`apps/api/prisma/schema.prisma:124`] — deferred, pre-existing schema

### Senior Developer Review (AI)

**Outcome:** Changes Requested → fixes applied (2026-06-30)

- [x] Atomic consume via createMany + conditional updateMany
- [x] Entitlements controller e2e tests
- [x] Web 401 feedback on practice; server mock-exam gate via BFF
