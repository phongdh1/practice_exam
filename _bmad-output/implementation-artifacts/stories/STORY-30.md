---
id: STORY-30
story_key: 7-30-attempt-history-api-list-ui
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-13"]
ad_refs: []
---

# STORY-30: Attempt History API and list UI

**Epic:** EPIC-7

## Acceptance Criteria

### AC-1

**Given** history identical on web and Zalo for same User  
**When** entries show type, Subject, date, score  
**Then** tap opens attempt detail with questions and explanations for mocks  
**And** empty state CTA 'Bắt đầu luyện tập'

## Tasks/Subtasks

- [x] `GET /api/v1/progress/attempts` unified chronological history API
- [x] `GET /api/v1/progress/attempts/practice/:sessionId` practice detail with explanations
- [x] Shared types and api-client methods for attempt history
- [x] `AttemptHistoryList` UI component (W-41/Z-41)
- [x] Web BFF routes and `/progress/history` page
- [x] Zalo `/progress/history` route with shared data
- [x] Unit tests for progress service history merge

### Review Follow-ups (AI)

- [x] [AI-Review][Medium] Add pagination or capped limit to `listAttemptHistory`
- [x] [AI-Review][Medium] Validate `type` param and return 404 for unknown values on web and Zalo detail routes
- [x] [AI-Review][Low] Extend service specs for empty history and `SESSION_IN_PROGRESS` guard

## Dev Agent Record

### Completion Notes
✅ Unified attempt history merges completed practice sessions and mock attempts chronologically.  
✅ Practice detail endpoint returns per-question reviews with explanations.  
✅ Mock detail reuses existing results API with question review flow.  
✅ Empty state shows CTA "Bắt đầu luyện tập".  
✅ Resolved review finding [Medium]: Added `MAX_ATTEMPT_HISTORY_ITEMS` (100) cap with per-source `take` and post-merge slice.  
✅ Resolved review finding [Medium]: Web and Zalo detail routes validate `type` is `practice`|`mock` before fetching.  
✅ Resolved review finding [Low]: Added specs for empty history, history cap, and `SESSION_IN_PROGRESS` guard.

## File List

- apps/api/src/progress/progress.service.ts
- apps/api/src/progress/progress.controller.ts
- apps/api/src/progress/progress.module.ts
- apps/api/src/progress/progress.service.spec.ts
- apps/api/src/app.module.ts
- packages/types/src/index.ts
- packages/api-client/src/index.ts
- packages/ui/src/components/attempt-history-list.tsx
- packages/ui/src/components/practice-session-detail-screen.tsx
- packages/ui/src/index.ts
- apps/web/src/app/api/progress/attempts/route.ts
- apps/web/src/app/api/progress/attempts/practice/[sessionId]/route.ts
- apps/web/src/app/progress/history/page.tsx
- apps/web/src/app/progress/history/[type]/[id]/page.tsx
- apps/zalo-mini-app/src/main.tsx

## Change Log

- 2026-07-01: Implemented attempt history API, list UI, and detail screens for web and Zalo.
- 2026-07-01: Addressed code review findings - 3 items resolved (history cap, type validation, extended specs).
- 2026-07-01: Second-pass code review approved — all stories done.

## Status

done

### Review Findings

- [x] [Review][Patch] Attempt history API returns unbounded list — no pagination or limit [`apps/api/src/progress/progress.service.ts:19-70`]
- [x] [Review][Patch] Detail pages do not validate `type` route param is `practice` or `mock` — invalid values fall through to mock results fetch [`apps/web/src/app/progress/history/[type]/[id]/page.tsx:39`]
- [x] [Review][Patch] Missing unit tests for empty history merge and in-progress session rejection [`apps/api/src/progress/progress.service.spec.ts`]

### Senior Developer Review (AI)

**Outcome:** Changes Requested (2026-07-01)

**Severity:** High 0 · Medium 2 · Low 1

Core AC-1 satisfied: unified chronological history, type/subject/date/score fields, practice detail with explanations, mock detail via results API, empty-state CTA, identical data paths on web (BFF) and Zalo (api-client). Auth, user scoping, and suspension checks are correct. `progress.service.spec.ts` passes (3/3).

**Top issues:** unbounded history payload at scale; unvalidated attempt `type` param on detail route.

**Action Items:**
- [x] [Medium] Add pagination or capped limit to `listAttemptHistory`
- [x] [Medium] Validate `type` param and return 404 for unknown values on web and Zalo detail routes
- [x] [Low] Extend service specs for empty history and `SESSION_IN_PROGRESS` guard

### Senior Developer Review (AI) — Second Pass

**Outcome:** Approve (2026-07-01)

**Severity:** High 0 · Medium 0 · Low 0

All first-pass medium/low findings verified resolved: `MAX_ATTEMPT_HISTORY_ITEMS` (100) cap with per-source `take` and post-merge slice; `type` param guarded on web and Zalo detail routes (queries disabled, inline error for invalid values); extended service specs (8/8 passing). AC-1 satisfied.

**Prior medium issues:** All resolved.

**Tests:** `progress.service.spec.ts` 8/8 pass; full API suite 138/138 pass.
