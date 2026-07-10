---
id: STORY-24
story_key: 5-24-flag-incorrect-questions
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-9"]
ad_refs: []
---

# STORY-24: Flag potentially incorrect questions

**Epic:** EPIC-5

## Acceptance Criteria

### AC-1

**Given** 'Báo cáo câu hỏi' action available post-reveal  
**When** flag creates admin queue entry with User, Question, optional comment  
**Then** flagging does not remove Question from circulation in MVP  
**And** toast confirms 'Đã gửi báo cáo'

## Tasks/Subtasks

- [x] Wire `POST /api/v1/questions/:id/flag` (existing `QuestionFlagsService`)
- [x] `QuestionFlagDialog` + post-reveal action in practice UI
- [x] `api-client.flagQuestion` + web BFF proxy
- [x] Toast 'Đã gửi báo cáo' on success

## Dev Agent Record

### Completion Notes
✅ Flag creates open queue entry; question stays published.  
✅ Practice UI shows ghost 'Báo cáo câu hỏi' after reveal with optional comment.

## File List

- packages/ui/src/components/question-flag-dialog.tsx
- packages/ui/src/components/practice-flow-screen.tsx
- packages/api-client/src/index.ts
- apps/web/src/app/api/questions/[questionId]/flag/route.ts
- apps/api/src/content/question-flags.controller.ts
- apps/api/src/content/question-flags.service.ts

## Status

done

### Review Findings

_No patch or decision findings from EPIC-5 review. STORY-24 acceptance criteria appear satisfied._
