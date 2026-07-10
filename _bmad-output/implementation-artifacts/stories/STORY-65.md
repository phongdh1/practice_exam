---
id: STORY-65
story_key: 14-65-study-mode-api-entitlements
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-47", "FR-5"]
ad_refs: ["AD-11", "AD-3"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-07-09"
    prd_version_or_updated: "sprint-change-proposal-2026-07-09-study-mode"
    change_summary: "New EPIC-14 Study Mode — FR-47 API, StudyTierUsage, StudyViewLog, server-side gating separate from Free Tier"
    story_delta: "Created"
  - date: "2026-07-09"
    prd_version_or_updated: "dev-story STORY-65"
    change_summary: "Implemented Study Mode API: schema, entitlements, study module, types, api-client, unit+e2e tests"
    story_delta: "ready-for-dev → review"
---

# STORY-65: Study Mode API and study-tier entitlement

**Epic:** EPIC-14

As a **Candidate**,  
I want **to browse Published questions with answers and explanations in Study Mode**,  
So that **I can review the full question bank before or alongside practice**.

## Acceptance Criteria

### AC-1: Study question list (no answer leakage)

**Given** a Candidate opens Study Mode for a Subject they do not subscribe to  
**When** they request `GET /api/v1/study/subjects/:subjectId/questions` (paginated)  
**Then** only Published Questions for that Subject are returned with stem and metadata (topic, difficulty, question type)  
**And** the response excludes correct answer, explanation, and any answer-indicator fields  
**And** the response includes `studyTier: { used, limit, remaining, periodKey, isAtLimit }` for that Subject

### AC-2: Study detail consumes view atomically

**Given** a freemium Candidate with remaining Study Tier allowance  
**When** they open question detail via `GET /api/v1/study/subjects/:subjectId/questions/:questionId`  
**Then** the response includes options, correct answer key(s), and explanation  
**And** the Study Tier counter increments atomically by 1 for that User+Subject+ICT period  
**And** the Free Tier practice counter (`free_tier_usage`) is unchanged

### AC-3: Study Tier cap blocks new detail views

**Given** a freemium Candidate who has used their Study Tier limit this month for a Subject (default 5)  
**When** they request detail for a question not yet viewed this period  
**Then** the API returns `403` with code `STUDY_TIER_EXCEEDED` and subscribe CTA metadata  
**And** Practice Mode remains available if Free Tier practice allowance remains

### AC-4: Subscribed users have unlimited study access

**Given** a Candidate with an active Subscription for the Subject  
**When** they browse Study Mode list and detail  
**Then** all Published questions are accessible without incrementing Study Tier counter  
**And** re-viewing questions does not affect counters

### AC-5: Idempotent re-view within period

**Given** a Candidate re-opens a question detail they already viewed this calendar month (ICT)  
**When** they request the same question detail again  
**Then** the full detail is returned without consuming an additional Study Tier view  
**And** `StudyViewLog` enforces uniqueness on `(userId, subjectId, questionId, periodKey)`

### AC-6: Subject-scoped entitlements only

**Given** Study Mode is scoped to Subject per STORY-61  
**When** entitlements are evaluated  
**Then** counters and Subscription checks use `subjectId` only — never `courseId`

### AC-7: Draft and archived questions excluded

**Given** Questions exist in Draft, In Review, or Archived states  
**When** Study Mode list or detail is requested  
**Then** only Published Questions are served  
**And** requests for non-published question IDs return `404`

## Tasks / Subtasks

- [x] Add Prisma models `StudyTierUsage`, `StudyViewLog`, and `SubjectPricing.studyTierLimit` (default 5) with migration (AC: #1–#5)
- [x] Extend `EntitlementsService` with `getStudyTierStatus()`, `consumeStudyView()` — mirror atomic patterns from `consumeFreeTierQuestion` (AC: #2, #3)
- [x] Create `StudyModule` (`study.controller.ts`, `study.service.ts`) with list + detail endpoints (AC: #1–#7)
- [x] Add shared types: `StudyTierStatus`, `StudyQuestionListItem`, `StudyQuestionDetail` in `@practice-exam/types` (AC: #1, #2)
- [x] Add `api-client` query keys and methods for study list/detail (AC: #1, #2)
- [x] Unit tests: entitlement isolation (practice consume ≠ study consume), idempotent re-view, cap enforcement, subscribed bypass
- [x] Integration/e2e tests for study HTTP routes (auth, envelope, `STUDY_TIER_EXCEEDED`)

## Dev Notes

### Architecture compliance

- **AD-11:** Study question selection and answer gating are server-side only. List DTO must never include answers. Detail gating runs in `StudyService` before payload assembly.
- **AD-3:** Supabase PostgreSQL + Prisma; use transaction pooler for runtime, `DIRECT_URL` for migration.
- **Separate module:** New `apps/api/src/study/` — do **not** fold into `PracticeService` (different consumption semantics: browse vs session).
- **Extend, don't replace:** Extend `EntitlementsService` for Study Tier; keep `FreeTierUsage` unchanged.

### Proposed schema (from sprint proposal)

```prisma
model SubjectPricing {
  // existing fields
  studyTierLimit  Int  @default(5) @map("study_tier_limit")  // NEW
}

model StudyTierUsage {
  userId      String @map("user_id")
  subjectId   String @map("subject_id")
  periodKey   String @map("period_key")
  viewedCount Int    @default(0) @map("viewed_count")
  @@id([userId, subjectId, periodKey])
}

model StudyViewLog {
  userId     String   @map("user_id")
  subjectId  String   @map("subject_id")
  questionId String   @map("question_id")
  periodKey  String   @map("period_key")
  viewedAt   DateTime @default(now()) @map("viewed_at")
  @@unique([userId, subjectId, questionId, periodKey])
}
```

### Detail endpoint flow

1. Auth required (JWT).
2. Verify Subject exists and is candidate-visible.
3. Load Published question; 404 if not published.
4. If active Subscription for `subjectId` → return full payload, no consumption.
5. If `StudyViewLog` exists for user+subject+question+period → return full payload, no increment.
6. Else `consumeStudyView()` in transaction → if at limit, `403 STUDY_TIER_EXCEEDED`; else insert log, increment counter, return full payload.

### ICT period

Reuse `@practice-exam/utils` `ict-period` utility (same as STORY-13 Free Tier). Limit read from `SubjectPricing.studyTierLimit` (default 5).

### Files to create/modify

| Area | Path |
|------|------|
| Schema | `apps/api/prisma/schema.prisma` |
| Migration | `apps/api/prisma/migrations/*_study_mode/` |
| Study module | `apps/api/src/study/**` |
| Entitlements | `apps/api/src/entitlements/entitlements.service.ts` |
| App module | `apps/api/src/app.module.ts` |
| Types | `packages/types/src/index.ts` |
| API client | `packages/api-client/src/index.ts` |

### Previous story intelligence

- **STORY-13:** Atomic `createMany` + conditional `updateMany` pattern for Free Tier — apply same TOCTOU-safe pattern for Study Tier.
- **STORY-21:** `PracticeService` consumes Free Tier on answer submit inside transaction — Study detail consumption must be similarly transactional with `StudyViewLog` insert.
- **STORY-61:** Monetization is Subject-level only; never gate by Course.

### Testing requirements

- Integration test proving `consumeFreeTierQuestion` unchanged when study detail consumed.
- Contract test: list response JSON must not contain `correctAnswer`, `explanation`, or `isCorrect` fields.
- E2E: 6th new detail view returns `STUDY_TIER_EXCEEDED`; re-view of question 1 does not increment.

### References

- [Source: sprint-change-proposal-2026-07-09-study-mode.md §6, §7]
- [Source: prd.md §4.3a FR-47]
- [Source: addendum.md Study Tier Data Model]
- [Source: STORY-13 entitlements patterns]

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Debug Log References

- Prisma client regenerated after schema changes (`pnpm exec prisma generate`)
- `@practice-exam/types` build required before api-client typecheck resolves new exports

### Completion Notes List

- Added `StudyTierUsage`, `StudyViewLog`, and `SubjectPricing.studyTierLimit` (default 5) with migration `20260709140000_study_mode`
- Extended `EntitlementsService` with `getStudyTierStatus()` and `consumeStudyView()` using TOCTOU-safe createMany/updateMany pattern; `STUDY_TIER_EXCEEDED` includes subscribe CTA metadata
- Created `StudyModule` with list (stem-only), detail (answer+explanation, consumes view), and tier status endpoints; subscribed users bypass consumption; idempotent re-view via `StudyViewLog` uniqueness
- Study tier counters are isolated from `FreeTierUsage` / practice consumption
- Shared types and api-client methods/query keys added for study flows
- Tests: unit (`entitlements.service.spec`, `study.service.spec`) + e2e (`study.controller.spec`) — all pass

### File List

- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260709140000_study_mode/migration.sql
- apps/api/src/entitlements/entitlements.service.ts
- apps/api/src/entitlements/entitlements.service.spec.ts
- apps/api/src/study/dto/study.dto.ts
- apps/api/src/study/study.service.ts
- apps/api/src/study/study.service.spec.ts
- apps/api/src/study/study.controller.ts
- apps/api/src/study/study.controller.spec.ts
- apps/api/src/study/study.module.ts
- apps/api/src/app.module.ts
- packages/types/src/index.ts
- packages/api-client/src/index.ts
- packages/api-client/src/index.test.ts

### Review Follow-ups (AI)

- [x] [AI-Review][High] Move idempotent re-view guard inside `consumeStudyViewInTransaction` (check `StudyViewLog` before increment); handle `P2002` on concurrent duplicate opens so detail returns 200 without extra consumption (AC-5)
- [x] [AI-Review][Medium] Add e2e test: subscribed user can list/detail all study questions without incrementing `studyTierUsage` (AC-4)
- [x] [AI-Review][Medium] Add integration test for concurrent duplicate detail requests (same user+question+period) asserting single consumption
- [x] [AI-Review][Low] Document or adjust `studyTier.remaining` for subscribed users (`hasActiveSubscription: true` — UI should treat as unlimited)

### Review Findings

- [x] [Review][Patch] Idempotent re-view check runs outside transaction — concurrent duplicate detail requests can hit `studyViewLog.create` unique violation → 500 instead of idempotent 200; may violate AC-5 under concurrency [`apps/api/src/study/study.service.ts:98-112`, `apps/api/src/entitlements/entitlements.service.ts:316-318`]
- [x] [Review][Patch] `consumeStudyViewInTransaction` increments counter before inserting view log and never checks existing log inside the transaction — TOCTOU race with the service-layer pre-check [`apps/api/src/entitlements/entitlements.service.ts:272-333`]
- [x] [Review][Patch] Missing e2e coverage for subscribed-user study bypass on HTTP routes (AC-4) [`apps/api/src/study/study.controller.spec.ts`]
- [x] [Review][Patch] No test for concurrent/idempotent race on duplicate detail opens [`apps/api/src/study/study.controller.spec.ts`]
- [x] [Review][Defer] `study_tier_usage.subject_id` has no FK to `subjects` (mirrors `free_tier_usage` pattern) [`apps/api/prisma/schema.prisma:450-460`] — deferred, pre-existing schema convention

### Senior Developer Review (AI)

**Outcome:** Changes Requested (2026-07-09)

**Verdict:** Changes Requested — core FR-47 flows implemented and tests pass, but study view consumption has a TOCTOU race that can break AC-5 idempotent re-view under concurrent requests.

**Summary by severity:**

| Severity | Count | Notes |
|----------|-------|-------|
| High | 1 | Concurrent duplicate detail opens — idempotency guard outside transaction |
| Medium | 3 | In-tx log check missing; subscribed e2e gap; no concurrency test |
| Low | 1 | Subscribed `remaining` semantics ambiguous for UI |

**AC coverage:**

| AC | Status | Evidence |
|----|--------|----------|
| AC-1 | Pass | List selects stem/metadata only; e2e asserts no answer fields |
| AC-2 | Pass | Detail returns answers; atomic consume; free tier untouched in e2e |
| AC-3 | Pass | 6th new view → 403 `STUDY_TIER_EXCEEDED` with subscribe CTA |
| AC-4 | Partial | Logic correct in service + unit test; no e2e for subscribed bypass |
| AC-5 | Partial | Sequential re-view works; concurrent duplicate opens unguarded |
| AC-6 | Pass | All gates use `subjectId` only |
| AC-7 | Pass | Published-only filter; 404 for unknown IDs |

**Recommended fix (High):** At the start of `consumeStudyViewInTransaction`, `findUnique` on `StudyViewLog` for `(userId, subjectId, questionId, periodKey)`; if exists, return current tier status without increment. Wrap `studyViewLog.create` in `P2002` handler that returns idempotent success. Remove or keep service-layer pre-check as fast-path only.

## Status

review
