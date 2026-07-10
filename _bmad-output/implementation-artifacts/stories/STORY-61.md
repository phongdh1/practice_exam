---
id: STORY-61
story_key: 9-61-course-crud-catalog-grouping
status: done
baseline_commit: NO_VCS
prd_refs: []
ad_refs: []
---

# STORY-61: Course CRUD and catalog grouping

**Epic:** EPIC-9

As a **Platform Admin**,
I want **to manage Courses as catalog groupings above Subjects**,
So that **candidate catalogs can be organized without moving monetization away from Subjects**.

## Acceptance Criteria

### AC-1: Course fields and lifecycle
**Given** an admin creates or updates a Course  
**When** they provide name, code, description, display order, and visibility status  
**Then** the Course is persisted with those fields and can be archived or activated.

### AC-2: Admin-only Course management
**Given** a non-super-admin role calls Course management endpoints  
**When** they attempt create, update, archive, activate, or reorder actions  
**Then** access is denied by existing admin RBAC conventions.

### AC-3: Reorder Courses
**Given** multiple Courses exist  
**When** an admin submits an ordered Course ID list  
**Then** display order is updated deterministically without changing Subjects, subscriptions, or payments.

### AC-4: Candidate catalog hides archived Courses
**Given** a Course is archived  
**When** candidates view the catalog  
**Then** Subjects under that Course are hidden from candidate catalog grouping.

### AC-5: Monetization remains Subject-level
**Given** Course grouping is introduced  
**When** subscriptions, payments, or pricing are evaluated  
**Then** they still reference Subjects only and existing Subject subscriptions remain valid until expiry.

## Tasks/Subtasks

- [x] Add Course data model, migration, and seed-safe defaults (AC: #1, #5)
- [x] Add admin Course service/controller CRUD, archive/activate, and reorder endpoints guarded for `super_admin` (AC: #1-#3)
- [x] Add shared Course types and api-client methods/query keys (AC: #1-#3)
- [x] Add admin `/courses` list/create/edit UI pages using existing admin patterns (AC: #1-#3)
- [x] Update candidate catalog response/UI to group active Subjects by active Course while preserving Subject-level pricing (AC: #4, #5)
- [x] Add unit tests for Course CRUD, reorder, archived catalog behavior, and RBAC-sensitive service behavior where applicable (AC: #1-#5)

## Dev Notes

- Course is catalog grouping only; do not add Course pricing, checkout, subscription, entitlement, or payment references.
- Subject subscriptions remain keyed by `subjectId`; do not migrate subscription/payment ownership.
- Candidate catalog should not show archived Courses and should not expose Subjects whose parent Course is archived.
- Follow existing `subjects` module conventions for admin DTO validation, service errors, ordering, and controller guards.

## Dev Agent Record

### Implementation Plan

Added Course persistence/API first, then wired shared types/client and admin pages. Candidate catalog grouping is derived by Course while leaving all monetization fields on Subject catalog items.

### Debug Log

- 2026-07-02: Resolver failed because available Python lacks `tomllib`; applied documented customization fallback.
- 2026-07-02: `git rev-parse HEAD` failed because workspace is not a Git repository; baseline set to `NO_VCS`.
- 2026-07-02: `pnpm --filter @practice-exam/api typecheck` still fails on pre-existing spec mock typing issues outside STORY-61/62; API build and Jest pass.

### Completion Notes

- Added `Course` model, `CourseVisibility`, migration with default Course backfill, and required Subject FK support.
- Added `GET/POST/PATCH /admin/courses`, archive/activate, and reorder service/controller guarded for `super_admin`.
- Added admin `/courses`, `/courses/new`, and `/courses/[id]` pages.
- Candidate catalog now filters archived Courses and groups Subjects by active Course while preserving Subject pricing/free-tier fields.
- Tests: Course service unit coverage, Subject catalog/controller updates, full API Jest suite 196/196 passing.

## File List

- _bmad-output/implementation-artifacts/stories/STORY-61.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260702193000_courses_catalog_grouping/migration.sql
- apps/api/src/app.module.ts
- apps/api/src/courses/**
- apps/api/src/subjects/**
- apps/api/src/prisma/prisma.schema.spec.ts
- apps/admin/src/app/courses/**
- apps/admin/src/app/subjects/**
- apps/admin/src/components/admin-app-frame.tsx
- apps/admin/src/lib/admin-nav.ts
- packages/types/src/index.ts
- packages/api-client/src/index.ts
- packages/ui/src/components/subject-catalog-grid.tsx

## Change Log

- 2026-07-02: Created STORY-61 and moved to in-progress for implementation.
- 2026-07-02: Implemented Course CRUD/catalog grouping and moved to review.

### Review Findings

- [x] [Review][Decision] Partial reorder semantics — resolved: API requires the **full** ordered course list (`INCOMPLETE_COURSE_REORDER`).
- [x] [Review][Decision] Archive course with active subjects — resolved: archiving a course auto-archives active child subjects.
- [x] [Review][Patch] Course reorder missing from api-client and admin UI [apps/admin/src/app/courses/page.tsx] — added `adminReorderCourses` and Up/Down reorder controls.
- [x] [Review][Patch] Active subject allowed under archived course [apps/api/src/subjects/subjects.service.ts:225] — `assertCourseActive` enforced on activation.
- [x] [Review][Patch] P2002 duplicate course code returns 500 [apps/api/src/courses/courses.service.ts:27] — mapped to `COURSE_CODE_EXISTS` conflict.
- [x] [Review][Defer] Subject reorder missing api-client/admin UI [apps/api/src/subjects/subjects-admin.controller.ts] — deferred, STORY-39 API exists; UI wiring out of STORY-61 scope.

## Status

done
