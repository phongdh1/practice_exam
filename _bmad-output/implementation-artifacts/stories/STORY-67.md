---
id: STORY-67
story_key: 14-67-subject-detail-study-integration
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-47", "FR-4"]
ad_refs: ["AD-12"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-07-09"
    prd_version_or_updated: "sprint-change-proposal-2026-07-09-study-mode"
    change_summary: "Subject detail Z-11/W-11 — Study CTA and Study Tier meter alongside existing Free Tier meter"
    story_delta: "Created"
  - date: "2026-07-09"
    prd_version_or_updated: "dev-story STORY-67"
    change_summary: "Subject detail Study CTA, Study Tier meter, formatters, web/Zalo wiring"
    story_delta: "ready-for-dev → review"
---

# STORY-67: Subject detail Study CTA and Study Tier meter

**Epic:** EPIC-14

As a **Candidate**,  
I want **to see my Study Tier usage and enter Study Mode from Subject detail**,  
So that **I can choose browse-and-read review alongside practice and mock exams**.

## Acceptance Criteria

### AC-1: Study CTA on Subject detail

**Given** a Candidate views Subject detail Z-11 (Zalo) or W-11 (web)  
**When** the page renders action buttons  
**Then** a secondary/outline button "Xem tất cả câu hỏi" is visible  
**And** button order is Study → Practice (primary "Luyện tập") → Mock ("Thi thử")  
**And** tapping navigates to Z-12/W-12 Study list for that Subject

### AC-2: Study Tier meter on Subject detail

**Given** a Candidate is not subscribed to the Subject  
**When** Subject detail loads  
**Then** Study Tier meter displays "Đã xem {n}/{limit} câu ôn miễn phí tháng này" using `{components.study-meter-badge}`  
**And** meter is stacked below the existing Free Tier meter ("Đã dùng {n}/20 câu luyện tập miễn phí tháng này")  
**And** both meters use real data from entitlement APIs (not placeholders)

### AC-3: Subscribed user hides Study meter

**Given** a Candidate has an active Subscription for the Subject  
**When** Subject detail loads  
**Then** Study Tier meter is hidden (same rule as Free Tier meter)  
**And** Study CTA remains available with unlimited access

### AC-4: Independent meter semantics

**Given** a freemium Candidate has used Study Tier views but has Free Tier practice remaining (or vice versa)  
**When** they view Subject detail  
**Then** each meter reflects its own counter independently  
**And** labels clearly distinguish "câu ôn" (study) from "câu luyện tập" (practice)

### AC-5: Catalog card optional study hint

**Given** catalog cards on Z-10/W-10 (STORY-12)  
**When** authenticated and not subscribed  
**Then** Subject detail remains the primary Study entry point  
**And** no regression to existing catalog card price badge, subscription pill, or Free Tier meter behavior

## Tasks / Subtasks

- [x] Extend `SubjectDetailView` with Study CTA button and `StudyMeterBadge` (AC: #1, #2)
- [x] Wire Study Tier status from `GET /api/v1/study/subjects/:subjectId/questions` meta or dedicated entitlement endpoint (AC: #2)
- [x] Update web `apps/web/src/app/subjects/[id]/page.tsx` (AC: #1–#4)
- [x] Update Zalo subject detail route in `apps/zalo-mini-app` (AC: #1–#4)
- [x] Add formatter helpers in `@practice-exam/utils` for study meter copy (AC: #2, #4)
- [x] Unit tests for meter formatters and detail view conditional rendering (subscribed vs freemium)
- [x] Verify existing Practice and Mock CTAs unchanged (regression)

## Dev Notes

### Architecture compliance

- **AD-12:** Extend existing `SubjectDetailView` in `@practice-exam/ui` — same component used by web and Zalo per STORY-12.
- Study meter visual weight matches Free Tier meter but distinct caption per DESIGN.md.

### UX contract (EXPERIENCE.md)

| Component | Screens | Behavior |
|-----------|---------|----------|
| Study CTA | Z-11, W-11 | Secondary/outline → Z-12/W-12 |
| Study Tier meter | Z-11, W-11 | Hidden when subscribed; ICT monthly reset |
| Free Tier meter | Z-11, W-11 | Existing copy updated to "câu luyện tập" per UX reconcile |

### Dependencies

- **STORY-65:** Study Tier status API (`studyTier` in list response or `GET /entitlements/study-tier/:subjectId`).
- **STORY-66:** Study list screens must exist for CTA navigation target (can implement CTA + meter before full study UI if routes stubbed).

### Files to modify

| Area | Path |
|------|------|
| Shared detail view | `packages/ui/src/components/subject-detail-view.tsx` |
| Study meter | `packages/ui/src/components/study-meter-badge.tsx` (new) |
| Formatters | `packages/utils/src/subject-display.ts` |
| Web detail | `apps/web/src/app/subjects/[id]/page.tsx` |
| Zalo detail | `apps/zalo-mini-app/src/main.tsx` |

### Previous story intelligence

- **STORY-12:** Subject detail already wires Free Tier meter from entitlement API — follow same fetch/hydration pattern for Study Tier.
- **STORY-13:** Meter shows 0/limit when unauthenticated — apply same auth-gated behavior for Study meter.
- **STORY-61:** Course grouping on catalog does not change Subject detail monetization fields.

### Testing requirements

- Regression: Practice CTA still triggers practice flow; Mock CTA still gated by subscription.
- Visual: both meters visible for freemium; neither visible when subscribed.

### References

- [Source: EXPERIENCE.md Z-11 components table, UJ-7 step 1]
- [Source: sprint-change-proposal §8.9]
- [Source: STORY-12 SubjectDetailView]
- [Source: STORY-65 study tier API]

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Debug Log References

- Study tier fetched via `GET /api/study/subjects/:id/tier` (web BFF) and `getStudyTierStatus` (Zalo direct)
- Updated `formatFreeTierMeter` copy to distinguish "câu luyện tập" from study "câu ôn"

### Completion Notes List

- Extended `SubjectDetailView` with `onStudy`, `studyTierStatus`, action button order Study → Practice → Mock
- `StudyMeterBadge` stacked below Free Tier meter; hidden when subscribed
- Added `formatStudyTierMeter()` + unit test; updated free tier meter copy + test
- Web W-11 and Zalo Z-11 wired study tier query and `handleStudy` navigation

### File List

- packages/utils/src/subject-display.ts
- packages/utils/src/subject-display.test.ts
- packages/utils/src/index.ts
- packages/ui/src/components/subject-detail-view.tsx
- packages/ui/src/components/study-meter-badge.tsx
- apps/web/src/app/(candidate)/(shell)/subjects/[id]/page.tsx
- apps/web/src/app/api/study/subjects/[subjectId]/tier/route.ts
- apps/zalo-mini-app/src/main.tsx

### Review Findings

- [x] [Review][Patch] `handleStudy` navigates to study route when tier preflight returns non-401 error (500/network) [`apps/web/src/app/(candidate)/(shell)/subjects/[id]/page.tsx:84-90`]
- [x] [Review][Patch] Missing unit tests for `SubjectDetailView` conditional meter/CTA rendering (subscribed vs freemium) per story task [`packages/ui/src/components/subject-detail-display.test.ts`]

## Status

done
