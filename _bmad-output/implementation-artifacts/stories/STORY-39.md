---
id: STORY-39
story_key: 9-39-subject-crud-go-live-gate
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-25"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
---

# STORY-39: Subject CRUD with go-live gate

**Epic:** EPIC-9

## Acceptance Criteria

### AC-1
**Given** each Subject has name, code, description, display order, visibility status  
**When** archived Subjects hidden from Candidates; existing Subscriptions remain valid until expiry  
**Then** Subject cannot activate until >= 200 Published Questions and one approved Mock Exam Template  
**And** reorder updates display order without breaking existing Subscriptions

## Tasks/Subtasks

- [x] Extend Subject model with topicTags; default visibility archived for new subjects
- [x] Add admin list, archive, activate, reorder endpoints with AdminJwtGuard
- [x] Implement go-live gate validation (200 published questions + 1 approved template)
- [x] Add unit tests for go-live gate, reorder, archive

## Dev Agent Record

### Completion Notes
✅ `GET/POST/PATCH admin/subjects` with archive, activate, reorder.  
✅ Go-live gate blocks activation until 200 published questions + 1 approved template.  
✅ Archived subjects excluded from candidate catalog (existing behavior preserved).

## File List

- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260701160000_mock_exam_config/**
- apps/api/src/subjects/**
- packages/types/src/index.ts


## Review Approval

Approved by user on 2026-07-01 after re-review. Security fixes and M1 fixed (verdict: approve).

## Status

done
