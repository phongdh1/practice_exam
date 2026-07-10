---
id: STORY-28
story_key: 6-28-mock-exam-scoring-results
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-12"]
ad_refs: []
---

# STORY-28: Mock exam scoring, results, and question review

**Epic:** EPIC-6

## Acceptance Criteria

### AC-1

**Given** score calculated against configured passing threshold  
**When** section breakdown matches template Subject weights  
**Then** results persist permanently in Attempt History  
**And** Z-35/W-35 shows explanations for all questions

## Tasks/Subtasks

- [x] Weighted scoring by section `weightPercent`
- [x] Persist `scorePercent`, `passed`, `sectionScores` on submit
- [x] Results API with section breakdown + per-question explanations
- [x] `MockExamResultsScreen` and `MockExamQuestionReviewScreen` UI
- [x] Unit tests for scoring path via service integration

## Dev Agent Record

### Completion Notes
✅ Score = sum of (section score × weight). Pass when ≥ `passingScorePercent`.  
✅ Completed attempts stored with `sectionScores` JSON for history.  
✅ Results endpoint returns explanations for W-35/Z-35 drill-down.

## File List

- apps/api/src/mock-exams/mock-exam-attempts.service.ts
- packages/types/src/index.ts
- packages/ui/src/components/mock-exam-results-screen.tsx
- packages/ui/src/components/mock-exam-question-review-screen.tsx
- apps/web/src/app/api/mock-exams/attempts/[attemptId]/results/route.ts

## Status

review

### Review Findings

- [x] [Review][Patch] `getResults` recalculates score instead of reading persisted `sectionScores` — drift if questions unpublished after submit [`apps/api/src/mock-exams/mock-exam-attempts.service.ts:416-509`]
- [x] [Review][Patch] `questionReviews` can crash on missing questions — `scoreAttempt` uses `questionMap.get(questionId)!` without guard [`apps/api/src/mock-exams/mock-exam-attempts.service.ts:~477`]
- [x] [Review][Decision] "Attempt History" scope — resolved option (a): DB persistence on `mock_exam_attempts` satisfies AC for EPIC-6; W-41/Z-41 history UI deferred to progress epic [`STORY-28` AC-1, `deferred-work.md`]
