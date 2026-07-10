---
id: STORY-22
story_key: 5-22-practice-question-ui
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-8"]
ad_refs: ["AD-12"]
---

# STORY-22: Practice question UI with immediate feedback

**Epic:** EPIC-5

## Acceptance Criteria

### AC-1

**Given** one question visible with answer-option component states  
**When** MCQ requires explicit 'Xác nhận' before reveal  
**Then** correct/incorrect shown with icon+text not color alone  
**And** explanation displays after submit

## Tasks/Subtasks

- [x] `PracticeQuestionView` component (W-21/Z-21) with confirm-before-reveal
- [x] Icon+text correct/incorrect feedback states on `AnswerOption`
- [x] Web practice page `/subjects/[id]/practice`
- [x] Zalo practice route `/subjects/$subjectId/practice`

## Dev Agent Record

### Completion Notes
✅ Shared `PracticeFlowScreen` orchestrates question UI on web and Zalo.  
✅ `Xác nhận` gates reveal; explanation shown post-submit.

## File List

- packages/ui/src/components/practice-question-view.tsx
- packages/ui/src/components/practice-flow-screen.tsx
- packages/ui/src/components/answer-option.tsx
- packages/ui/src/index.ts
- apps/web/src/app/subjects/[id]/practice/page.tsx
- apps/zalo-mini-app/src/main.tsx

## Status

done

### Review Findings

- [x] [Review][Patch] `bootstrap` `useEffect` re-runs when `session` updates after first answer — can reset to resume/loading mid-question [`packages/ui/src/components/practice-flow-screen.tsx:74-126`]
- [x] [Review][Patch] Paywall path in `loadQuestion` uses stale `session` closure instead of `sessionId` arg — `endSession` may not run [`packages/ui/src/components/practice-flow-screen.tsx:91-96`]
- [x] [Review][Defer] Answer option states still rely heavily on color borders; icons lack `aria-label` [`packages/ui/src/components/answer-option.tsx`, `practice-question-view.tsx`]
