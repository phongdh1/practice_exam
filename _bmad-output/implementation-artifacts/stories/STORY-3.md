---
id: STORY-3
story_key: 1-3-scaffold-nestjs-api
status: review
baseline_commit: NO_VCS
prd_refs: []
ad_refs: ["AD-2", "AD-3"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
  - date: "2026-06-29"
    prd_version_or_updated: "EPIC-1 implementation"
    change_summary: "NestJS API with health endpoint, PrismaService, API envelope"
    story_delta: "Implemented — status review"
---

# STORY-3: Scaffold NestJS API with health check and PrismaService

**Epic:** EPIC-1

As a **platform engineer**,  
I want **a NestJS API skeleton with modular structure and health endpoint**,  
So that **client apps have a REST API to integrate against**.

## Acceptance Criteria

### AC-1

**Given** API exposes `GET /api/v1/health` returning 200  
**When** PrismaService is injectable in modules  
**Then** API envelope follows `{ data, error? }` convention  
**And** no domain logic in Next.js route handlers

## Tasks/Subtasks

- [x] Scaffold NestJS app at `apps/api` with modular structure
- [x] Implement global prefix `api/v1` and `ApiEnvelopeInterceptor` for `{ data }` responses
- [x] Create `HealthModule` with `GET /health` returning 200
- [x] Create global `PrismaModule` exporting injectable `PrismaService`
- [x] Add e2e test for health endpoint with envelope
- [x] Verify Next.js apps contain no domain API route handlers (shell pages only)

## Dev Agent Record

### Implementation Plan
NestJS 11 modular monolith skeleton per AD-2 with BFF-less boundary — domain logic only in API.

### Completion Notes
✅ `GET /api/v1/health` returns 200 with `{ data: { status, timestamp } }`.  
✅ PrismaService is globally injectable via PrismaModule.  
✅ Web/admin apps are presentation shells calling API via api-client (no domain route handlers).

## File List

- apps/api/package.json
- apps/api/nest-cli.json
- apps/api/jest.config.js
- apps/api/src/main.ts
- apps/api/src/app.module.ts
- apps/api/src/health/**
- apps/api/src/prisma/**
- apps/api/src/common/interceptors/api-envelope.interceptor.ts

## Change Log

| Date | Change |
|------|--------|
| 2026-06-29 | Scaffolded NestJS API with health check (STORY-3) |

## Status

review

### Review Findings

- [ ] [Review][Patch] `decodeAccessToken` instantiates unconfigured `JwtService` instead of injecting the module-configured instance [`apps/api/src/auth/auth.service.ts:341`]
