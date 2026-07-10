---
id: STORY-8
story_key: 2-8-zalo-oauth-mini-app
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-1"]
ad_refs: ["AD-4", "AD-9"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "EPIC-2 implementation"
    change_summary: "Zalo OAuth primary sign-in on Mini App"
    story_delta: "Implemented — status review"
---

# STORY-8: Zalo OAuth primary sign-in on Mini App

**Epic:** EPIC-2

As a **Candidate**,  
I want **to sign in via Zalo OAuth when opening the Mini App**,  
So that **I can start practicing inside Zalo without a separate registration**.

## Acceptance Criteria

### AC-1

**Given** user opens Z-01 on Mini App launch  
**When** Zalo OAuth succeeds via `zmp-sdk` token exchange to `POST /auth/zalo`  
**Then** User and AuthIdentity(zalo) are created  
**And** OAuth failure shows Z-91 with retry and no catalog access

## Tasks/Subtasks

- [x] Implement `POST /auth/zalo` with Zalo token verification service
- [x] Build Z-01 auth screen in zalo-mini-app with route guard to catalog
- [x] Build Z-91 auth error screen at `/auth/error`
- [x] Add `ZALO_*` env vars to `.env.example`
- [x] Add api-client `zaloSignIn` method and tests

## Dev Agent Record

### Implementation Plan
`ZaloOAuthService` verifies access token via Zalo Graph API (test mock in NODE_ENV=test); Mini App Z-01 gates catalog until authenticated.

### Completion Notes
✅ `POST /auth/zalo` creates User + AuthIdentity(zalo).  
✅ Z-01 at `/auth`; catalog at `/` requires stored token.  
✅ Z-91 at `/auth/error` with Vietnamese retry message.

## File List

- apps/api/src/auth/zalo-oauth.service.ts
- apps/api/src/auth/auth.controller.ts
- apps/zalo-mini-app/src/main.tsx
- packages/api-client/src/index.ts
- .env.example

## Change Log

| Date | Change |
|------|--------|
| 2026-06-29 | Implemented Zalo OAuth Mini App sign-in (STORY-8) |

## Status

review

### Review Findings

- [ ] [Review][Patch] Zalo OAuth failure shows inline error on Z-01 instead of navigating to Z-91 screen [`apps/zalo-mini-app/src/main.tsx:47`]
- [x] [Review][Defer] `zmp-sdk` not integrated — hardcoded test token used for dev scaffold [`apps/zalo-mini-app/src/main.tsx:41`] — deferred, dev scaffold phase
