---
id: STORY-25
story_key: 6-25-mock-exam-listing-attempt-limits
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-10", "FR-30"]
ad_refs: ["AD-11"]
---

# STORY-25: Mock exam listing and attempt limit enforcement

**Epic:** EPIC-6

## Acceptance Criteria

### AC-1

**Given** Free Tier users cannot start Mock Exams  
**When** list shows duration, question count, Subjects covered  
**Then** default 3 attempts per User per template per calendar month  
**And** exhausted attempts show disabled card with message

## Tasks/Subtasks

- [x] Candidate template list API with entitlement + attempt metadata
- [x] `MockExamTemplateList` UI (W-30/Z-30) with disabled exhausted cards
- [x] Web mock-exam list page and API proxy routes
- [x] Unit tests for listing and free-tier block on start

## Dev Agent Record

### Completion Notes
✅ `GET /api/v1/mock-exam-attempts/by-subject/:subjectId` returns templates with attempts remaining, `canStart`, and access flags.  
✅ Free tier blocked at start via `EntitlementsService.getMockExamAccess`.  
✅ Subject detail navigates to `/subjects/[id]/mock-exams`.

## File List

- apps/api/src/mock-exams/mock-exam-attempts.service.ts
- apps/api/src/mock-exams/mock-exam-attempts.controller.ts
- apps/api/src/mock-exams/mock-exams.service.ts
- apps/api/src/mock-exams/dto/mock-exam-attempt.dto.ts
- apps/api/src/mock-exams/mock-exam-attempts.service.spec.ts
- packages/types/src/index.ts
- packages/ui/src/components/mock-exam-template-list.tsx
- packages/ui/src/components/mock-exam-flow-screen.tsx
- apps/web/src/app/subjects/[id]/mock-exams/page.tsx
- apps/web/src/app/subjects/[id]/page.tsx
- apps/web/src/lib/mock-exam-api.ts
- apps/web/src/app/api/mock-exams/**

## Status

review

### Review Findings

- [x] [Review][Patch] Template list missing "Subjects covered" — API exposes `subjectIds` but `MockExamTemplateList` only shows duration/count/pass threshold [`packages/ui/src/components/mock-exam-template-list.tsx`, `apps/api/src/mock-exams/mock-exam-attempts.service.ts:59`]
- [x] [Review][Patch] Cross-subject templates show raw subject UUIDs when section `subjectId` is absent from catalog map passed to list [`packages/ui/src/components/mock-exam-template-list.tsx:36-38`, `apps/web/src/app/subjects/[id]/mock-exams/page.tsx:43-46`]
