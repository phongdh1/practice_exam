---
id: STORY-62
story_key: 9-62-subject-management-within-course
status: in-progress
baseline_commit: NO_VCS
prd_refs: []
ad_refs: []
---

# STORY-62: Subject management within Course

**Epic:** EPIC-9

As a **Platform Admin**,
I want **each Subject to belong to exactly one Course**,
So that **questions and mock exams remain Subject-based while the catalog can derive Course context**.

## Acceptance Criteria

### AC-1: Subject requires Course
**Given** an admin creates or edits a Subject  
**When** they submit the form or API request  
**Then** a valid `courseId` is required and the Subject belongs to exactly one Course.

### AC-2: Existing Subject relationships stay unchanged
**Given** Questions and Mock Exam Templates reference Subjects  
**When** Course ownership is added  
**Then** Questions and Mock Exam Templates continue referencing Subjects, and Course is derived through Subject.

### AC-3: Go-live gate remains Subject-level
**Given** a Subject is activated  
**When** the existing go-live gate runs  
**Then** it still requires 200 published Questions and 1 approved Mock Exam Template for that Subject.

### AC-4: Admin Subject UI requires Course selection
**Given** an admin creates or edits a Subject  
**When** they use the admin UI  
**Then** Course selection is required and only valid Courses can be selected.

### AC-5: Existing subscriptions remain valid
**Given** users already have Subject subscriptions  
**When** Subjects receive Course ownership  
**Then** subscriptions remain valid until expiry and entitlement/payment logic remains Subject-based.

## Tasks/Subtasks

- [x] Add required `Subject.courseId` relation and migration strategy compatible with existing Subjects (AC: #1, #5)
- [x] Update Subject DTOs/service/admin API to require and persist `courseId` on create/edit (AC: #1)
- [x] Include Course context in admin Subject views without changing Question or Mock Exam Template ownership (AC: #2)
- [x] Preserve Subject go-live gate behavior and tests under Course ownership (AC: #3)
- [x] Add admin `/subjects` list/create/edit UI pages with required Course selection (AC: #4)
- [x] Add/update unit tests for required Course selection, invalid Course handling, go-live preservation, and subscription-safe behavior (AC: #1-#5)

## Dev Notes

- `courseId` is required for new and updated Subjects after this story.
- Questions, mock exam templates, subscriptions, payments, free tier usage, and entitlements stay linked to `subjectId`.
- Mock exam templates continue to reference Subjects; never move them to Course.
- Go-live gate logic remains unchanged: 200 published questions and one approved template per Subject.
- Admin UI has no `/subjects` pages currently; create minimal pages consistent with existing admin pages.

## Dev Agent Record

### Implementation Plan

Extended the Subject model/API with required Course ownership, then added admin Subject pages that require selecting a Course. Downstream content, mock exam, subscription, and payment behavior remains keyed by Subject.

### Debug Log

- 2026-07-02: Resolver failed because available Python lacks `tomllib`; applied documented customization fallback.
- 2026-07-02: `git rev-parse HEAD` failed because workspace is not a Git repository; baseline set to `NO_VCS`.
- 2026-07-02: `pnpm --filter @practice-exam/api typecheck` still fails on pre-existing spec mock typing issues outside STORY-61/62; API build and Jest pass.

### Completion Notes

- Subject create now requires `courseId`; Subject update can move a Subject to another valid Course.
- Admin Subject views include Course code/name context; Question and Mock Exam Template ownership remains unchanged through `subjectId`.
- Go-live gate remains unchanged at 200 published questions plus 1 approved template per Subject.
- Added admin `/subjects`, `/subjects/new`, and `/subjects/[id]` pages with required Course selection.
- Tests: Subject service/controller coverage updated for Course ownership and archived Course catalog hiding; full API Jest suite 196/196 passing.

## File List

- _bmad-output/implementation-artifacts/stories/STORY-62.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260702193000_courses_catalog_grouping/migration.sql
- apps/api/src/subjects/**
- apps/api/src/courses/**
- apps/admin/src/app/subjects/**
- apps/admin/src/app/courses/**
- apps/admin/src/components/admin-app-frame.tsx
- apps/admin/src/lib/admin-nav.ts
- packages/types/src/index.ts
- packages/api-client/src/index.ts
- packages/ui/src/components/subject-catalog-grid.tsx

## Change Log

- 2026-07-02: Created STORY-62 and moved to in-progress for implementation.
- 2026-07-02: Implemented Subject Course ownership and moved to review.

### Review Findings

- [x] [Review][Patch] Active subject allowed under archived course [apps/api/src/subjects/subjects.service.ts:225] — `assertCourseActive` enforced on activation and `visibility: active` updates.
- [x] [Review][Patch] Subject can be moved to archived course without guard [apps/api/src/subjects/subjects.service.ts:158] — blocks moving active subjects to archived courses.
- [x] [Review][Patch] Admin subject form allows archived course selection [apps/admin/src/app/subjects/new/page.tsx:130] — create form lists active courses only; edit keeps current archived course if already assigned.
- [x] [Review][Patch] Admin activate button ignores go-live gate [apps/admin/src/app/subjects/page.tsx:99] — disabled when `!goLive.canActivate` with tooltip; API errors surfaced inline.
- [x] [Review][Patch] P2002 duplicate subject code returns 500 [apps/api/src/subjects/subjects.service.ts:125] — mapped to `SUBJECT_CODE_EXISTS` conflict.
- [x] [Review][Defer] Go-live gate counts approved templates without re-validating pool after questions unpublished [apps/api/src/subjects/subjects.service.ts:335] — deferred, edge case; template approval already validated pool at approve time.

## Status

done
