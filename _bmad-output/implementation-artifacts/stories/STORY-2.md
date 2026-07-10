---
id: STORY-2
story_key: 1-2-configure-prisma
status: review
baseline_commit: NO_VCS
prd_refs: []
ad_refs: ["AD-3", "AD-13"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
  - date: "2026-06-29"
    prd_version_or_updated: "EPIC-1 implementation"
    change_summary: "Prisma configured with Supabase dual URL datasource"
    story_delta: "Implemented — status review"
---

# STORY-2: Configure Supabase PostgreSQL and Prisma datasource

**Epic:** EPIC-1

As a **platform engineer**,  
I want **Prisma configured against Supabase PostgreSQL with pooler URLs**,  
So that **the API can persist data in the managed Vietnam-region database**.

## Acceptance Criteria

### AC-1

**Given** `.env.example` documents `DATABASE_URL` (pooler :6543) and `DIRECT_URL` (session :5432)  
**When** developer runs `prisma migrate dev`  
**Then** migrations apply via `directUrl`  
**And** runtime NestJS uses transaction pooler connection

## Tasks/Subtasks

- [x] Document `DATABASE_URL` and `DIRECT_URL` in root `.env.example`
- [x] Create `apps/api/prisma/schema.prisma` with `url` + `directUrl` datasource
- [x] Add initial migration `20260629000000_init`
- [x] Add `prisma:validate` script using `.env.example` placeholders
- [x] Add schema unit tests verifying dual URL configuration
- [x] Configure `load-env.ts` to read monorepo root `.env` for NestJS runtime

## Dev Agent Record

### Implementation Plan
Prisma at `apps/api/prisma/` per AD-3 with transaction pooler for runtime and session pooler for migrations.

### Completion Notes
✅ Schema validates with `pnpm prisma:validate` using `.env.example` placeholders.  
✅ Initial migration created; `prisma migrate dev` requires real Supabase credentials in local `.env` (not committed).  
✅ PrismaService loads root `.env` for runtime `DATABASE_URL` pooler connection.

## File List

- .env.example
- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/**
- apps/api/src/load-env.ts
- apps/api/src/prisma/prisma.schema.spec.ts

## Change Log

| Date | Change |
|------|--------|
| 2026-06-29 | Configured Prisma dual URL datasource (STORY-2) |

## Status

review
