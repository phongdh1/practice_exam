---
id: STORY-6
story_key: 2-6-email-registration-password-signin
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-1"]
ad_refs: ["AD-4"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
  - date: "2026-06-29"
    prd_version_or_updated: "EPIC-2 implementation"
    change_summary: "Email registration and password sign-in on web"
    story_delta: "Implemented — status review"
---

# STORY-6: Email registration and password sign-in on web

**Epic:** EPIC-2

As a **Candidate**,  
I want **to register and sign in with email/password on the responsive web app**,  
So that **I can access my account without a social provider**.

## Acceptance Criteria

### AC-1

**Given** unauthenticated user opens W-01/W-02  
**When** submits valid credentials  
**Then** exactly one User and AuthIdentity(email) is created or resolved  
**And** failed auth shows Vietnamese error with retry and no partial session

## Tasks/Subtasks

- [x] Add Prisma `User` and `AuthIdentity` models with email provider + migration
- [x] Implement `POST /auth/register` and `POST /auth/login` with JWT access (15m) + refresh (7d)
- [x] Add Vietnamese auth error messages and API exception filter
- [x] Add shared auth types and api-client methods
- [x] Build web W-01 sign-in and W-02 register pages with Next.js auth route handlers
- [x] Add unit/e2e tests for email registration and login flows

## Dev Agent Record

### Implementation Plan
Prisma User/AuthIdentity models per AD-4; NestJS auth module with bcrypt password hashing, JWT token pair, Vietnamese error filter; web W-01/W-02 with cookie proxy route handlers.

### Completion Notes
✅ `POST /auth/register` and `POST /auth/login` create/resolve single User + AuthIdentity(email).  
✅ Failed login returns Vietnamese message with no tokens issued.  
✅ Web pages at `/sign-in` and `/register` with httpOnly cookie proxy.

## File List

- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260629120000_auth_identity/**
- apps/api/src/auth/**
- apps/api/src/common/filters/api-exception.filter.ts
- apps/api/src/app.module.ts
- apps/api/src/main.ts
- packages/types/src/index.ts
- packages/api-client/src/index.ts
- apps/web/src/app/sign-in/**
- apps/web/src/app/register/**
- apps/web/src/app/api/auth/**
- .env.example

## Change Log

| Date | Change |
|------|--------|
| 2026-06-29 | Implemented email registration and sign-in (STORY-6) |

## Status

review

### Review Findings

- [ ] [Review][Patch] Google OAuth callback stores tokens via `document.cookie` without `httpOnly`, unlike email login proxy route [`apps/web/src/app/auth/callback/page.tsx:16`]
- [ ] [Review][Patch] Login proxy route lacks guard for malformed JSON or missing `data.tokens` in upstream response [`apps/web/src/app/api/auth/login/route.ts:23`]
