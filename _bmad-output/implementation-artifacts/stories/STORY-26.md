---
id: STORY-26
story_key: 6-26-timed-mock-exam-execution
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-11"]
ad_refs: ["AD-11"]
---

# STORY-26: Timed mock exam execution with section rules

**Epic:** EPIC-6

## Acceptance Criteria

### AC-1

**Given** timer counts down; auto-submit on expiry  
**When** forward-only within section; no back to prior section during timed attempt  
**Then** answers saved incrementally on connection loss  
**And** bottom tabs hidden during active exam [UX-A8]

## Tasks/Subtasks

- [x] Prisma `MockExamAnswer` + attempt phase/timer fields migration
- [x] Attempt lifecycle API: start, get question, save answer, advance section, timer sync
- [x] Server-persisted section timer with auto-advance on expiry
- [x] Forward-only enforcement in `getQuestion` / `saveAnswer`
- [x] `MockExamTimerBar` + `MockExamSectionQuestion` UI components
- [x] Unit tests for attempt start and question retrieval

## Dev Agent Record

### Completion Notes
✅ Section timer stored as `sectionEndsAt`; `syncTimer` auto-advances expired sections.  
✅ Answers upserted incrementally via `mock_exam_answers`.  
✅ Focus-mode exam UI omits bottom nav during section/review phases (flow screen).

## File List

- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260701180000_mock_exam_attempts_execution/migration.sql
- apps/api/src/mock-exams/mock-exam-attempts.service.ts
- apps/api/src/mock-exams/mock-exam-attempt.types.ts
- packages/ui/src/components/mock-exam-timer-bar.tsx
- packages/ui/src/components/mock-exam-section-question.tsx
- packages/ui/src/components/mock-exam-flow-screen.tsx

## Status

review

### Review Findings

- [x] [Review][Patch] Bottom nav never hidden during mock exam (UX-A8) — `hideBottomNav = false` always on web page [`apps/web/src/app/subjects/[id]/mock-exams/page.tsx:43,70`]
- [x] [Review][Patch] Client timer never resyncs with server — countdown from initial `sectionRemainingMs` only; tab sleep / clock skew desyncs from `syncTimer` [`packages/ui/src/components/mock-exam-timer-bar.tsx`]
- [x] [Review][Decision] Bottom nav hide scope — selected option (b), hide during section + review active exam phases [`apps/web/src/app/subjects/[id]/mock-exams/page.tsx`, `EXPERIENCE.md` UX-A8]
- [x] [Review][Patch] Server timer sync marks expiry without calling `onExpire` — when `onSync` returns `sectionRemainingMs <= 0`, `expiredRef` is set but `onExpire` never runs; tab-return sync can stall at 0:00 [`packages/ui/src/components/mock-exam-timer-bar.tsx:78-83`]
- [x] [Review][Patch] Timer expiry does not persist in-progress answer — `handleTimerExpire` calls `advanceSection` without `saveAnswer` for current `selectedKeys` [`packages/ui/src/components/mock-exam-flow-screen.tsx:319-336`]
- [x] [Review][Patch] AC incremental save on connection loss not met — answers only persist on explicit CTA; briefing claims auto-save on disconnect [`packages/ui/src/components/mock-exam-flow-screen.tsx:246-293`, `packages/ui/src/components/mock-exam-briefing.tsx:50`]
- [x] [Review][Patch] Mid-attempt `QUESTION_NOT_FOUND` (e.g. emergency unpublish) surfaces as unhandled rejection in `handleJumpToQuestion` [`packages/ui/src/components/mock-exam-flow-screen.tsx:339-344`, `apps/api/src/mock-exams/mock-exam-attempts.service.ts:212-216`]
- [x] [Review][Defer] `syncTimer` auto-advances on expiry without `SECTION_INCOMPLETE` guard — intentional timed auto-submit; differs from manual `advanceSection` [`apps/api/src/mock-exams/mock-exam-attempts.service.ts:562-586`] — deferred, timed-expiry behavior
