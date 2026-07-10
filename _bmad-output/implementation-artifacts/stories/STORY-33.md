---
id: STORY-33
story_key: 8-33-question-crud-lifecycle-states
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-17", "FR-21"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
---

# STORY-33: Question CRUD with lifecycle states

**Epic:** EPIC-8

## Acceptance Criteria

### AC-1
**Given** lifecycle: Draft → In Review → Published; rejection returns to Draft with comments  
**When** Published edits create new Draft version requiring re-review  
**Then** Questions belong to exactly one Subject  
**And** image attachments supported; duplicate stem warns editor

## Tasks/Subtasks

- [x] Add Prisma Question, QuestionVersion models and migration
- [x] Implement QuestionsService CRUD with lifecycle transitions
- [x] Add AdminJwtGuard and admin question endpoints
- [x] Add duplicate stem detection warning
- [x] Add unit tests for create, submit-for-review, duplicate warning

## Dev Agent Record

### Completion Notes
✅ Question CRUD with draft/in_review/published/archived lifecycle.  
✅ Published edits spawn new draft version via parentQuestionId.  
✅ QuestionVersion audit snapshots on draft edits.  
✅ imageUrls[] on Question model; duplicate stem normalized comparison.

## File List

- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260701120000_question_bank/**
- apps/api/src/questions/**
- apps/api/src/admin-auth/**
- packages/types/src/index.ts


## Review Approval

Approved by user on 2026-07-01 (verdict: approve with changes). Code review follow-up improvements are treated as nice-to-have/deferred unless already documented in this story.

## Status

done
