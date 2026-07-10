---
id: STORY-10
story_key: 2-10-merge-users-account-link
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-3"]
ad_refs: ["AD-4"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "EPIC-2 implementation"
    change_summary: "Merge Users on account link with FR-3 rules"
    story_delta: "Implemented — status review"
---

# STORY-10: Merge Users on account link with FR-3 rules

**Epic:** EPIC-2

As a **Candidate**,  
I want **the system to merge two existing accounts when I link providers**,  
So that **I keep all progress and avoid duplicate subscriptions**.

## Acceptance Criteria

### AC-1

**Given** linking would merge two User records  
**When** merge executes server-side  
**Then** all Attempt History from both Users is retained under survivor  
**And** duplicate active Subscription for same Subject retains longer period; W-52/Z merge summary shown

## Tasks/Subtasks

- [x] Implement `UserMergeService` with FR-3 subscription dedup (longer period wins)
- [x] Reassign PracticeSession records to survivor User on merge
- [x] Return `mergeSummary` in link/auth responses
- [x] Build W-52 merge summary page at `/account/merge-summary`
- [x] Add unit tests for merge subscription deduplication

## Dev Agent Record

### Implementation Plan
Transactional merge in `UserMergeService`; practice sessions moved; duplicate active subscriptions resolved by retaining longer `periodEnd`.

### Completion Notes
✅ Merge retains all practice sessions under survivor.  
✅ Duplicate subscriptions for same subject keep longer period.  
✅ W-52 shows merge summary counts.

## File List

- apps/api/src/auth/user-merge.service.ts
- apps/api/src/auth/user-merge.service.spec.ts
- apps/api/src/auth/auth.service.ts
- apps/api/prisma/schema.prisma
- apps/web/src/app/account/merge-summary/page.tsx
- packages/types/src/index.ts

## Change Log

| Date | Change |
|------|--------|
| 2026-06-29 | Implemented User merge on link (STORY-10) |

## Status

review

### Review Findings

- [ ] [Review][Patch] Zalo merge summary screen missing — Z-51 shows `alert()` instead of merge summary UI per AC [`apps/zalo-mini-app/src/main.tsx:119`]
- [ ] [Review][Patch] Refresh token rotation is non-atomic — parallel refresh or delete-then-create failure can orphan sessions [`apps/api/src/auth/token.service.ts:43`]
