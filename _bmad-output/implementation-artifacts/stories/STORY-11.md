---
id: STORY-11
story_key: 3-11-subject-catalog-api
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-4"]
ad_refs: ["AD-3"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
  - date: "2026-06-30"
    prd_version_or_updated: "EPIC-3 implementation"
    change_summary: "Subject catalog API for active Subjects with pricing and Free Tier limits"
    story_delta: "Implemented — status review"
---

# STORY-11: Subject catalog API for active Subjects

**Epic:** EPIC-3

As a **Candidate**,  
I want **to retrieve all active Subjects with pricing and Free Tier limits**,  
So that **I can choose which môn to practice**.

## Acceptance Criteria

### AC-1

**Given** API returns only active visible Subjects  
**When** each Subject includes name, description, monthly price VND, Free Tier limit  
**Then** archived Subjects are excluded from candidate responses  
**And** price matches admin configuration

## Tasks/Subtasks

- [x] Add Prisma `Subject` and `SubjectPricing` models with migration
- [x] Implement `GET /api/v1/subjects` returning active catalog with pricing and free tier limit
- [x] Add `SubjectCatalogItem` shared type and api-client `listSubjects()` method
- [x] Add unit and e2e tests for catalog filtering and response shape

## Dev Notes

- Subject catalog lives in `api/subjects` per architecture spine (FR-4, AD-3)
- `SubjectPricing` is 1:1 with `Subject`; monthly amount and free tier limit are admin-configured
- Only `visibility: active` subjects appear in candidate catalog; archived subjects excluded
- Response uses standard `{ data }` API envelope

## Dev Agent Record

### Implementation Plan
Prisma Subject + SubjectPricing models; NestJS SubjectsModule with public GET endpoint; shared types and api-client method for web/Zalo consumers (STORY-12).

### Completion Notes
✅ `GET /api/v1/subjects` returns active subjects ordered by displayOrder with monthlyPriceVnd and freeTierLimit.  
✅ Archived subjects excluded via Prisma `where: { visibility: "active" }`.  
✅ Unit and e2e tests verify catalog shape and filtering.  
✅ Review follow-up: Logger.warn for active subjects missing SubjectPricing; compliance filter unit test.

## File List

- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260630120000_subject_catalog/**
- apps/api/src/subjects/**
- apps/api/src/app.module.ts
- packages/types/src/index.ts
- packages/api-client/src/index.ts

## Change Log

| Date | Change |
|------|--------|
| 2026-06-30 | Implemented Subject catalog API (STORY-11) |

## Status

review

### Review Findings

- [x] [Review][Patch] Active subjects missing a `SubjectPricing` row are silently excluded from the catalog with no admin signal [`apps/api/src/subjects/subjects.service.ts:17-18`]
- [x] [Review][Patch] No unit test covers prohibited-claims filtering on catalog responses (added in STORY-14) [`apps/api/src/subjects/subjects.service.spec.ts`]

### Senior Developer Review (AI)

**Outcome:** Changes Requested → fixes applied (2026-06-30)

- [x] Missing-pricing admin signal via Logger.warn
- [x] Compliance filter unit test added
