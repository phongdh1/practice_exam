---
id: STORY-27
story_key: 6-27-pre-submit-cross-section-review
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-11"]
ad_refs: []
---

# STORY-27: Pre-submit cross-section answer review

**Epic:** EPIC-6

## Acceptance Criteria

### AC-1

**Given** after final section user reaches Z-33/W-33 review grid  
**When** can jump to any question and change answer  
**Then** 'Nộp bài' requires confirmation dialog  
**And** submit is explicit and irreversible

## Tasks/Subtasks

- [x] Review phase transition after final section
- [x] `GET .../review` grid endpoint
- [x] Cross-section question jump via `getQuestion(questionId)` in review/edit mode
- [x] `MockExamReviewGrid` with confirmation dialog before submit
- [x] Irreversible submit marks attempt `completed`

## Dev Agent Record

### Completion Notes
✅ Review grid shows answered/unanswered state per question.  
✅ Submit requires explicit confirmation dialog ("Nộp bài").  
✅ Completed attempts cannot resume editing.

## File List

- apps/api/src/mock-exams/mock-exam-attempts.service.ts
- apps/api/src/mock-exams/mock-exam-attempts.controller.ts
- packages/ui/src/components/mock-exam-review-grid.tsx
- packages/ui/src/components/mock-exam-flow-screen.tsx
- apps/web/src/app/api/mock-exams/attempts/[attemptId]/review/route.ts
- apps/web/src/app/api/mock-exams/attempts/[attemptId]/submit/route.ts

## Status

review

### Review Findings

- [x] [Review][Patch] Review-grid answer edit calls `advanceSection` instead of save-only — when `reviewQuestionId` set, CTA triggers `onFinishSection` → `INVALID_PHASE` / breaks cross-section edit [`packages/ui/src/components/mock-exam-flow-screen.tsx:~452`]
- [x] [Review][Patch] Wrong section label when editing from review grid — uses `attempt.currentSectionIndex` instead of `question.sectionIndex` [`packages/ui/src/components/mock-exam-flow-screen.tsx:~435`]
- [x] [Review][Defer] Submit allowed with unanswered questions — review grid warns but `submitAttempt` does not block [`packages/ui/src/components/mock-exam-review-grid.tsx:51-53`, `apps/api/src/mock-exams/mock-exam-attempts.service.ts:391-414`] — deferred, timed-exam semantics
