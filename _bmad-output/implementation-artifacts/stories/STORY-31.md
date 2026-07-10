---
id: STORY-31
story_key: 7-31-subject-performance-summary-aggregates
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-14"]
ad_refs: []
---

# STORY-31: Subject performance summary aggregates

**Epic:** EPIC-7

## Acceptance Criteria

### AC-1

**Given** summary updates within 5 minutes of session completion  
**When** 30/90 day toggles on Z-40/W-40  
**Then** Subjects with no attempts show empty card with practice CTA  
**And** aggregates computed server-side

## Tasks/Subtasks

- [x] `GET /api/v1/progress/subjects?days=30|90` server-side aggregates
- [x] Per-subject stats: questions attempted, correctness rate, mock scores
- [x] Shared `SubjectPerformanceSummary` and `ProgressSummaryResponse` types
- [x] `SubjectPerformanceCard` empty state with practice CTA
- [x] Unit tests for aggregate computation
- [x] Web BFF proxy route

### Review Follow-ups (AI)

- [x] [AI-Review][Medium] Batch subject summary queries (groupBy or single raw query) to eliminate N+1
- [x] [AI-Review][Medium] Validate `days` enum (`30`|`90`) with `BadRequestException` on invalid values
- [x] [AI-Review][Medium] Align `mockAttemptsCount` with scored attempts only, or document mixed null handling
- [x] [AI-Review][Low] Add specs for `days=90` and zero-attempt subject cards

## Dev Agent Record

### Completion Notes
✅ Server computes aggregates from practice answers and completed mock attempts per active subject.  
✅ 30/90-day window filter applied via query param.  
✅ Subjects without attempts return `hasAttempts: false` for empty card rendering.  
✅ Resolved review finding [Medium]: Replaced per-subject N+1 with two batched queries grouped in-memory by subjectId.  
✅ Resolved review finding [Medium]: Invalid `days` query now returns 400 `INVALID_DAYS`.  
✅ Resolved review finding [Medium]: `mockAttemptsCount` now counts only scored attempts (matches average denominator).  
✅ Resolved review finding [Low]: Added specs for 90-day window and `hasAttempts: false` subjects.

## File List

- apps/api/src/progress/progress.service.ts
- apps/api/src/progress/progress.controller.ts
- packages/types/src/index.ts
- packages/api-client/src/index.ts
- packages/ui/src/components/progress-dashboard.tsx
- apps/web/src/app/api/progress/subjects/route.ts

## Change Log

- 2026-07-01: Implemented subject performance summary aggregates API.
- 2026-07-01: Addressed code review findings - 4 items resolved (batch queries, days validation, mock count alignment, extended specs).
- 2026-07-01: Second-pass code review approved — all stories done.

## Status

done

### Review Findings

- [x] [Review][Patch] N+1 query pattern — two DB round-trips per active subject in `getSubjectSummaries` [`apps/api/src/progress/progress.service.ts:85-144`]
- [x] [Review][Patch] Invalid `days` query silently coerced to 30 instead of returning 400 [`apps/api/src/progress/progress.controller.ts:32`]
- [x] [Review][Patch] `mockAttemptsCount` includes attempts with null `scorePercent` while average excludes them — inconsistent stats [`apps/api/src/progress/progress.service.ts:109-122`]
- [x] [Review][Patch] Missing unit tests for 90-day window and subjects with `hasAttempts: false` [`apps/api/src/progress/progress.service.spec.ts`]

### Senior Developer Review (AI)

**Outcome:** Changes Requested (2026-07-01)

**Severity:** High 0 · Medium 3 · Low 1

AC-1 satisfied: server-side aggregates, 30/90-day toggle via query param, empty cards via `hasAttempts: false`, practice CTA on empty subjects. On-demand computation meets the 5-minute freshness intent (always current on fetch).

**Top issues:** N+1 scalability risk as subject catalog grows; silent invalid `days` input; mock count/average inconsistency when `scorePercent` is null.

**Action Items:**
- [x] [Medium] Batch subject summary queries (groupBy or single raw query) to eliminate N+1
- [x] [Medium] Validate `days` enum (`30`|`90`) with `BadRequestException` on invalid values
- [x] [Medium] Align `mockAttemptsCount` with scored attempts only, or document mixed null handling
- [x] [Low] Add specs for `days=90` and zero-attempt subject cards

### Senior Developer Review (AI) — Second Pass

**Outcome:** Approve (2026-07-01)

**Severity:** High 0 · Medium 0 · Low 0

All first-pass medium/low findings verified resolved: batched `findMany` queries (2 round-trips, in-memory grouping); `INVALID_DAYS` 400 for non-30/90 values; `mockAttemptsCount` aligned to scored attempts only; specs for 90-day window and `hasAttempts: false`. AC-1 satisfied.

**Prior medium issues:** All resolved.

**Tests:** `progress.service.spec.ts` 8/8 pass; full API suite 138/138 pass.
