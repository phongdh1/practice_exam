---
id: STORY-42
story_key: 9-42-mock-exam-template-crud
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-28"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
---

# STORY-42: Mock Exam Template CRUD

**Epic:** EPIC-9

## Acceptance Criteria

### AC-1
**Given** template specifies sections with Subject, question count, and time limit  
**When** total duration and passing score threshold are configurable  
**Then** fixed vs randomized Question selection per section is supported  
**And** randomized selection draws only from Published Questions matching Subject and difficulty rules

## Tasks/Subtasks

- [x] Add MockExamTemplate and MockExamSection Prisma models + migration
- [x] Implement admin CRUD endpoints (create, update, approve, archive, list)
- [x] Support fixed and randomized section selection modes
- [x] Add unit tests for template create and section validation

## Dev Agent Record

### Completion Notes
✅ MockExamTemplate + MockExamSection models with draft/approved/archived lifecycle.  
✅ Admin endpoints at admin/mock-exam-templates.  
✅ Fixed mode uses fixedQuestionIds; randomized draws from published pool with topic/difficulty filters.

## File List

- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260701160000_mock_exam_config/**
- apps/api/src/mock-exams/**
- apps/api/src/app.module.ts
- packages/types/src/index.ts


## Review Approval

Approved by user on 2026-07-01 after re-review. Security fixes and M1 fixed (verdict: approve).

## Status

done
