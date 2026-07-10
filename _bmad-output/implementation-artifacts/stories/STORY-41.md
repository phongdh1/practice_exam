---
id: STORY-41
story_key: 9-41-exam-blueprint-metadata
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-27"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
---

# STORY-41: Exam blueprint metadata and topic weighting

**Epic:** EPIC-9

## Acceptance Criteria

### AC-1
**Given** admin configures topic tags and section weight percentages per Subject  
**When** weight percentages per Mock Exam Template sum to 100%  
**Then** metadata drives Mock Exam section breakdown and Progress Analytics  
**And** invalid weight totals block save with clear validation error

## Tasks/Subtasks

- [x] Add topicTags to Subject model and PATCH admin/subjects/:id/blueprint
- [x] Add weightPercent per MockExamSection with 100% sum validation
- [x] Section topicTags and difficulty rules for pool filtering
- [x] Add unit tests for weight validation

## Dev Agent Record

### Completion Notes
✅ Subject topicTags via blueprint endpoint.  
✅ Section weightPercent validated to sum 100% on template create/update/approve.  
✅ SECTION_WEIGHTS_INVALID error on invalid totals.

## File List

- apps/api/prisma/schema.prisma
- apps/api/src/subjects/subjects.service.ts
- apps/api/src/subjects/subjects-admin.controller.ts
- apps/api/src/mock-exams/mock-exams.service.ts
- apps/api/src/mock-exams/mock-exams.service.spec.ts


## Review Approval

Approved by user on 2026-07-01 after re-review. Security fixes and M1 fixed (verdict: approve).

## Status

done
