---
id: STORY-68
story_key: 14-68-admin-study-tier-limit-config
status: ready-for-dev
baseline_commit: NO_VCS
prd_refs: ["FR-26", "FR-47"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-07-09"
    prd_version_or_updated: "sprint-change-proposal-2026-07-09-study-mode"
    change_summary: "Admin A-21 — Study Tier limit field alongside Free Tier limit per FR-26 extension"
    story_delta: "Created"
---

# STORY-68: Admin Study Tier limit configuration per Subject

**Epic:** EPIC-14

As a **Platform Admin**,  
I want **to configure the Study Tier view limit per Subject on A-21**,  
So that **ops can tune browse-and-read freemium separately from practice Free Tier**.

## Acceptance Criteria

### AC-1: Study Tier limit field on A-21

**Given** a Super Admin edits a Subject on A-21  
**When** the pricing section renders  
**Then** a "Study Tier limit" integer field appears alongside existing monthly price and Free Tier limit  
**And** default value is 5 views/month when creating a new Subject  
**And** field label/help text clarifies: "Số lần xem đáp án + giải thích miễn phí mỗi tháng (Study Mode)"

### AC-2: Validation and persistence

**Given** admin submits Subject create or update  
**When** Study Tier limit is provided  
**Then** value must be a positive integer ≥ 1 [ASSUMPTION: minimum 1 view]  
**And** value persists to `SubjectPricing.studyTierLimit`  
**And** Free Tier limit and Study Tier limit are independently validated and stored

### AC-3: Propagation to candidate experience

**Given** admin changes Study Tier limit for a Subject  
**When** a Candidate loads Study Mode or Subject detail meter  
**Then** the new limit applies on next API request (no app restart)  
**And** existing `StudyTierUsage.viewedCount` for current period is preserved (limit change does not reset usage)

### AC-4: API DTO alignment

**Given** admin Subject create/update DTOs  
**When** Study Tier limit is omitted on update  
**Then** existing value is preserved (partial update semantics)  
**And** admin GET Subject detail returns `studyTierLimit` in pricing payload

### AC-5: RBAC

**Given** non-super-admin roles access A-21  
**When** they attempt Subject pricing edits  
**Then** existing RBAC rules from STORY-39 apply (super_admin for Subject CRUD)

## Tasks / Subtasks

- [ ] Ensure `SubjectPricing.studyTierLimit` exists in schema (may be added in STORY-65 migration) (AC: #2)
- [ ] Extend admin Subject DTOs (`CreateSubjectDto`, `UpdateSubjectDto`) with `studyTierLimit` validation (AC: #2, #4)
- [ ] Update `SubjectsService` create/update to persist `studyTierLimit` (AC: #2, #3)
- [ ] Update admin A-21 form (`apps/admin/src/app/subjects/[id]/page.tsx` or equivalent) with Study Tier field (AC: #1)
- [ ] Update candidate catalog/detail API responses if pricing shape is exposed to clients (AC: #3)
- [ ] Unit tests: validation (min 1), default 5 on create, independent from `freeTierLimit`
- [ ] Verify STORY-40 price floor (10,000 VND) behavior unchanged

## Dev Notes

### Architecture compliance

- Extends **FR-26** admin pricing config — parallel to existing `freeTierLimit` in STORY-40.
- Study Tier limit is read by `EntitlementsService.getStudyTierStatus()` and `StudyService` (STORY-65).

### UX contract

- Screen **A-21** per EXPERIENCE.md: "Name, code, description, pricing, Free Tier + Study Tier limits (FR-26)".
- UJ-6 step 1: admin sets price 100.000 ₫, Free Tier 20, **Study Tier 5**.

### Dependencies

- **STORY-65:** Schema field `study_tier_limit` on `subject_pricing` — coordinate migration ownership (65 adds schema; 68 adds admin UI + DTO if not in 65).
- **STORY-40:** Existing pricing form and `MIN_SUBJECT_PRICE_VND` — add field without breaking price validation.

### Files to modify

| Area | Path |
|------|------|
| DTOs | `apps/api/src/subjects/dto/admin-subject.dto.ts` |
| Service | `apps/api/src/subjects/subjects.service.ts` |
| Admin UI | `apps/admin/src/app/subjects/**` |
| Types | `packages/types/src/index.ts` |
| Tests | `apps/api/src/subjects/subjects.service.spec.ts` |

### Testing requirements

- Create Subject with default study limit 5.
- Update study limit to 10 → candidate `studyTier.limit` reflects 10 on next request.
- Invalid values (0, negative, non-integer) rejected with validation error.

### References

- [Source: prd.md FR-26 consequences — Study Tier limit admin-configurable]
- [Source: sprint-change-proposal §8.4, §3.3 STORY-68]
- [Source: EXPERIENCE.md A-21, UJ-6]
- [Source: STORY-40 pricing patterns]

## Dev Agent Record

### Agent Model Used

(pending)

### Debug Log References

### Completion Notes List

### File List

## Status

ready-for-dev
