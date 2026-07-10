---
id: STORY-12
story_key: 3-12-candidate-subject-catalog-ui
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-4"]
ad_refs: ["AD-12"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
  - date: "2026-06-30"
    prd_version_or_updated: "EPIC-3 implementation"
    change_summary: "Candidate Subject catalog UI on web (W-10/W-11) and Zalo (Z-10/Z-11)"
    story_delta: "Implemented — status review"
---

# STORY-12: Candidate Subject catalog UI on web and Zalo

**Epic:** EPIC-3

As a **Candidate**,  
I want **to browse the Subject catalog on Z-10 and W-10**,  
So that **I can discover Phase 1 Subjects and their subscription status**.

## Acceptance Criteria

### AC-1

**Given** catalog renders Subject cards with price badge and subscription/Free Tier meter  

**When** Phase 1 Subjects appear prominently  

**Then** tap/click opens Subject detail Z-11/W-11  

**And** pull-to-refresh works on catalog

## Tasks/Subtasks

- [x] Add subject display formatters in `@practice-exam/utils` (VND price, Free Tier meter, subscription pill text)
- [x] Enhance `SubjectCard` with price badge, subscription pill or Free Tier meter, featured styling, and click handler
- [x] Add shared `SubjectCatalogGrid`, `SubjectDetailView`, `CatalogSkeleton`, and `PullToRefresh` in `@practice-exam/ui`
- [x] Wire W-10 catalog on web home and W-11 detail at `/subjects/[id]` using `listSubjects()` API
- [x] Wire Z-10 catalog and Z-11 detail routes in zalo-mini-app with pull-to-refresh
- [x] Add unit tests for formatters and UI component exports; verify full `pnpm test` and `pnpm build`

## Dev Notes

- Consumes `GET /api/v1/subjects` via `api-client.listSubjects()` (STORY-11)
- `@practice-exam/ui` shared components per AD-12; Tailwind preset tokens from DESIGN.md
- Subject card shows name, price/month, subscription pill OR Free Tier meter (default meter with 0/limit until STORY-13)
- Phase 1: first two subjects from API `displayOrder` rendered as featured cards
- Z-10/W-10 screen IDs in headings; navigation to Z-11/W-11 on card tap/click
- Pull-to-refresh on catalog per EXPERIENCE.md; use touch pull on Zalo and web mobile
- Subscription status pill placeholder-ready for future entitlement API; show Free Tier meter when not subscribed
- Vietnamese copy per UX contract

## Dev Agent Record

### Implementation Plan
Shared subject display formatters in utils; enhanced SubjectCard and catalog components in ui; W-10/Z-10 fetch catalog via listSubjects; W-11/Z-11 detail routes; PullToRefresh on catalog.

### Debug Log

### Completion Notes
✅ W-10 and Z-10 render live Subject catalog from `GET /api/v1/subjects` with price badge and Free Tier meter (0/limit default).  
✅ First two subjects featured as Phase 1 with ring + "Giai đoạn 1" badge.  
✅ Card tap navigates to W-11 `/subjects/[id]` and Z-11 `/subjects/$subjectId`.  
✅ Pull-to-refresh refetches catalog on web and Zalo; desktop "Làm mới" button added.  
✅ Z-10 allows unauthenticated catalog browse (parity with W-10); sign-in CTA shown when logged out.  
✅ `pnpm test` and `pnpm build` pass after review fixes.

## File List

- packages/utils/src/subject-display.ts
- packages/utils/src/subject-display.test.ts
- packages/utils/src/index.ts
- packages/ui/src/components/subject-card.tsx
- packages/ui/src/components/catalog-skeleton.tsx
- packages/ui/src/components/subject-catalog-grid.tsx
- packages/ui/src/components/subject-detail-view.tsx
- packages/ui/src/components/pull-to-refresh.tsx
- packages/ui/src/index.ts
- packages/ui/src/index.test.ts
- packages/ui/package.json
- packages/api-client/src/index.ts
- packages/api-client/src/index.test.ts
- apps/web/src/app/page.tsx
- apps/web/src/app/subjects/[id]/page.tsx
- apps/zalo-mini-app/src/main.tsx
- _bmad-output/implementation-artifacts/stories/STORY-12.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log

| Date | Change |
|------|--------|
| 2026-06-30 | Bootstrapped implementation story (STORY-12) |
| 2026-06-30 | Implemented candidate Subject catalog UI on web and Zalo (STORY-12) |

## Status

review

### Review Findings

- [x] [Review][Decision] Zalo catalog requires authentication before Z-10 browse, while web W-10 is public — **resolved: Z-10 now matches W-10** (unauthenticated catalog browse per PRD/EXPERIENCE.md; auth required only for practice/consume)
- [x] [Review][Patch] Pull-to-refresh is touch-only; desktop web W-10 has no refresh affordance when pull gesture is unavailable [`packages/ui/src/components/pull-to-refresh.tsx`]
- [x] [Review][Defer] Subject detail resolves subject by scanning the full catalog list rather than a dedicated endpoint [`apps/web/src/app/subjects/[id]/page.tsx:48`] — deferred, performance-only

### Senior Developer Review (AI)

**Outcome:** Changes Requested → fixes applied (2026-06-30)

- [x] Zalo Z-10 auth parity with web W-10 (public catalog browse)
- [x] Desktop refresh button on PullToRefresh
