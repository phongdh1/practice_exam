---
id: STORY-7
story_key: 2-7-google-oauth-signin-web
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-1"]
ad_refs: ["AD-4"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "EPIC-2 implementation"
    change_summary: "Google OAuth sign-in on web via Passport"
    story_delta: "Implemented — status review"
---

# STORY-7: Google OAuth sign-in on web

**Epic:** EPIC-2

As a **Candidate**,  
I want **to sign in with Google on the responsive web app**,  
So that **I can access my account quickly on web**.

## Acceptance Criteria

### AC-1

**Given** user selects Google on W-01  
**When** OAuth completes successfully  
**Then** User and AuthIdentity(google) are created or resolved  
**And** JWT access (15m) and refresh (7d) tokens are issued

## Tasks/Subtasks

- [x] Add Passport Google OAuth20 strategy at `GET /auth/google` + callback
- [x] Issue JWT token pair on successful Google sign-in
- [x] Add Google sign-in button on W-01
- [x] Redirect OAuth callback to web `/auth/callback` with tokens
- [x] Add `GOOGLE_*` env vars to `.env.example`

## Dev Agent Record

### Implementation Plan
Passport Google strategy with callback redirect to web app; reuses shared `signInWithOAuth` and `TokenService`.

### Completion Notes
✅ Google OAuth flow via `GET /api/v1/auth/google` and callback.  
✅ W-01 includes Google sign-in CTA.  
✅ Tokens issued with 15m access / 7d refresh per AD-4.

## File List

- apps/api/src/auth/strategies/google.strategy.ts
- apps/api/src/auth/auth.controller.ts
- apps/web/src/app/sign-in/page.tsx
- apps/web/src/app/auth/callback/page.tsx
- .env.example

## Change Log

| Date | Change |
|------|--------|
| 2026-06-29 | Implemented Google OAuth sign-in (STORY-7) |

## Status

review

### Review Findings

- [ ] [Review][Patch] Google OAuth callback redirects with access/refresh tokens in URL query params — leaks via history, referrer, logs [`apps/api/src/auth/auth.controller.ts:79`]
- [ ] [Review][Patch] OAuth link state `link:{userId}` is unsigned — attacker can forge state and link/merge onto arbitrary victim without JWT [`apps/api/src/auth/auth.controller.ts:60`, `parseLinkState`]
- [ ] [Review][Patch] OAuth callback silently redirects home when tokens missing from query string [`apps/web/src/app/auth/callback/page.tsx:15`]
