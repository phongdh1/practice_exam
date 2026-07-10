---
id: STORY-43
story_key: 9-43-exam-pool-rules-attempt-limits
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-29", "FR-30"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
---

# STORY-43: Exam pool rules and attempt limits

**Epic:** EPIC-9

## Acceptance Criteria

### AC-1
**Given** auto-generation fails with clear admin error if pool lacks sufficient Published Questions  
**When** generated exams are previewable on A-52 before release to Candidates  
**Then** default 3 attempts per User per template per calendar month  
**And** Candidates see remaining attempts before starting Mock Exam

## Tasks/Subtasks

- [x] Add difficulty/topic pool rules with INSUFFICIENT_QUESTION_POOL errors
- [x] Add GET admin/mock-exam-templates/:id/preview endpoint
- [x] Add MockExamAttempt model and monthly attempt tracking (default 3)
- [x] Add candidate endpoints for attempt status and access summary
- [x] Add unit tests for pool validation and attempt limits

## Dev Agent Record

### Completion Notes
✅ Pool validation on approve and preview with clear admin errors.  
✅ Preview endpoint returns generated question sets per section.  
✅ monthlyAttemptLimit default 3; getAttemptStatus + access endpoint for candidates.

## File List

- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260701160000_mock_exam_config/**
- apps/api/src/mock-exams/**
- packages/types/src/index.ts


## Review Approval

Approved by user on 2026-07-01 after re-review. Security fixes and M1 fixed (verdict: approve).

## Status

done
