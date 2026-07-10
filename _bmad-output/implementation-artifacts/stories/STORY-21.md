---
id: STORY-21
story_key: 5-21-practice-session-api
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-8"]
ad_refs: ["AD-11"]
---

# STORY-21: Practice session API with server-side question selection

**Epic:** EPIC-5

## Acceptance Criteria

### AC-1

**Given** PracticeService serves only Published Questions for Subject  
**When** supports single choice, multiple choice, true/false  
**Then** Free Tier counter increments atomically when applicable  
**And** in-progress session persisted with 24h resume TTL

## Tasks/Subtasks

- [x] Expand `PracticeSession` + `PracticeAnswer` Prisma models and migration
- [x] Implement `PracticeModule` with server-side question selection (published only)
- [x] Free Tier consume on answer via `EntitlementsService`
- [x] 24h session TTL with expire/resume and `forceNew` start
- [x] Unit tests in `practice.service.spec.ts`

## Dev Agent Record

### Completion Notes
✅ `POST/GET /api/v1/practice/sessions/*` endpoints with JWT auth.  
✅ Random published question selection excluding answered IDs.  
✅ Atomic free-tier increment on each submitted answer.  
✅ 70 API tests pass.

## File List

- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260701140000_practice_sessions/migration.sql
- apps/api/src/practice/**
- apps/api/src/app.module.ts
- packages/types/src/index.ts
- packages/utils/src/practice-answer.ts
- packages/utils/src/practice-answer.test.ts
- packages/utils/src/index.ts

## Status

done

### Review Findings

- [x] [Review][Patch] Free-tier `consumeFreeTierQuestion` runs outside answer `$transaction` — quota lost on txn failure / double-charge on retry [`apps/api/src/practice/practice.service.ts:168-192`]
- [x] [Review][Patch] Concurrent duplicate `POST .../answer` can double-consume free tier before unique constraint rejects second insert [`apps/api/src/practice/practice.service.ts:135-171`]
- [x] [Review][Patch] No server-side binding between `GET .../question` and `POST .../answer` — client can submit any published `questionId`; repeated GET harvests stems without consuming quota [`apps/api/src/practice/practice.service.ts:105-125,294-312`]
- [x] [Review][Patch] No partial unique constraint on `(userId, subjectId)` for `in_progress` sessions — concurrent starts create orphans [`apps/api/prisma/schema.prisma` PracticeSession]
- [x] [Review][Patch] No practice HTTP e2e tests (auth, envelope, route ordering, failure paths) [`apps/api/src/practice/`]
- [x] [Review][Patch] `getSession` does not validate `expiresAt` — may return `resumable: true` for expired sessions [`apps/api/src/practice/practice.service.ts:96-102`]
- [x] [Review][Patch] `validateSelectedKeys` does not reject duplicate keys in `multiple_choice` [`apps/api/src/practice/practice.service.ts:315-342`]
- [x] [Review][Defer] `selectNextQuestion` loads all published questions into memory — scale defer [`apps/api/src/practice/practice.service.ts:294-312`]
- [x] [Review][Defer] Migration deletes `practice_sessions` rows with NULL `subject_id` without archive [`apps/api/prisma/migrations/20260701140000_practice_sessions/migration.sql:14`]
