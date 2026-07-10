---
id: STORY-69
story_key: 2-69-web-session-provider-shell-auth
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-1", "FR-2"]
ad_refs: ["AD-4"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-07-10"
    prd_version_or_updated: "sprint-change-proposal-2026-07-10-web-admin-ux"
    change_summary: "Web session provider + authenticated shell state from Correct Course Proposal 1"
    story_delta: "Created — in-progress"
---

# STORY-69: Web session provider and authenticated shell state

**Epic:** EPIC-2

As a **Candidate**,  
I want **the web shell to reflect my login state immediately after sign-in**,  
So that **I see authenticated navigation on all pages without a manual refresh**.

## Acceptance Criteria

### AC-1 — Post-login shell state

**Given** a candidate signs in via W-01 (email or Google)  
**When** login succeeds and the user is redirected to `/`  
**Then** shell header/nav immediately reflects authenticated state (no manual refresh)  
**And** progress and subject pages show the same authenticated account affordance

### AC-2 — Session probe

**Given** an authenticated candidate on any `(candidate)/(shell)` page  
**When** the client loads  
**Then** `GET /api/auth/me` (BFF) returns `{ id, displayName, avatarUrl, identities }`  
**And** unauthenticated requests return 401 without redirect loop

### AC-3 — Query invalidation

**Given** a successful login, register-with-session, or OAuth callback  
**When** auth cookies are set  
**Then** TanStack Query invalidates session and entitlements keys  
**And** shell UI updates on the next render

## Tasks/Subtasks

- [x] API `GET /api/v1/auth/me` with JWT guard returning user profile summary
- [x] BFF `GET /api/auth/me` proxying API with httpOnly cookie
- [x] `useWebSession` hook + `WebSessionProvider` in apps/web
- [x] `(candidate)/(shell)/layout.tsx` — derive `accountAction` from session globally
- [x] Login + OAuth callback — invalidate session queries; OAuth uses httpOnly BFF set-session
- [x] Home page — use session for auth state; remove page-local shell accountAction
- [x] `packages/api-client` — `getMe()` + `queryKeys.auth.me`
- [x] Spec: `spec-web-session-provider.md`
- [x] Typecheck + API test for auth/me

## Dev Agent Record

### Implementation Plan

BFF session probe reads httpOnly cookies; clients never rely on `document.cookie` for auth state. Complements `spec-frontend-401-login-redirect` (logout path). Shell layout owns account affordance; pages consume `useWebSession` for catalog/auth-gated UI.

### Completion Notes

✅ BFF session probe + API `GET /auth/me` with linked identity timestamps.  
✅ `WebSessionProvider` at root; shell layout drives global account affordance.  
✅ Login/OAuth invalidate session + entitlements; OAuth uses httpOnly `set-session` BFF.  
✅ Tests: auth.controller getMe (2 cases); api-client query key; web tsc clean.

## File List

- apps/api/src/auth/auth.controller.ts
- apps/api/src/auth/auth.service.ts
- apps/api/src/auth/auth.controller.spec.ts
- apps/web/src/app/api/auth/me/route.ts
- apps/web/src/app/api/auth/set-session/route.ts
- apps/web/src/components/web-session-provider.tsx
- apps/web/src/lib/invalidate-web-session.ts
- apps/web/src/app/(candidate)/layout.tsx
- apps/web/src/app/(candidate)/(shell)/layout.tsx
- apps/web/src/app/(candidate)/(shell)/page.tsx
- apps/web/src/app/sign-in/page.tsx
- apps/web/src/app/auth/callback/page.tsx
- packages/api-client/src/index.ts
- packages/types/src/index.ts
- _bmad-output/implementation-artifacts/spec-web-session-provider.md

## Links

- Sprint change proposal: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-07-10-web-admin-ux.md` (Proposal 1)
- Implementation spec: `_bmad-output/implementation-artifacts/spec-web-session-provider.md`
- Related (logout): `_bmad-output/implementation-artifacts/spec-frontend-401-login-redirect.md`

## Change Log

| Date | Change |
|------|--------|
| 2026-07-10 | Story created from Correct Course Proposal 1 — implementation started |

## Status

done

### Review Findings

- [x] [Review][Decision] Register post-signup flow — BFF `/api/auth/register` sets httpOnly session cookies, and `register/page.tsx` invalidates session after successful register. AC-3 requires register-with-session invalidation; spec lists auto-login after sign-up as "Ask First". **Resolved: Option A: auto-login redirect /**.
- [x] [Review][Patch] Register omits session query invalidation after cookie-setting register [`apps/web/src/app/register/page.tsx:31`]
- [x] [Review][Patch] OAuth callback ignores `set-session` failure before redirect [`apps/web/src/app/auth/callback/page.tsx:21-27`]
- [x] [Review][Patch] `GET /auth/me` omits suspended-user check (login rejects suspended accounts) [`apps/api/src/auth/auth.service.ts:333-347`]
- [x] [Review][Patch] BFF `/api/auth/me` lacks upstream fetch/JSON error handling [`apps/web/src/app/api/auth/me/route.ts:12-17`]
- [x] [Review][Defer] `clearWebSession` / `getWebAccessToken` read `document.cookie` but tokens are httpOnly — client-side session clear/token read ineffective; needs BFF logout route [`apps/web/src/lib/session.ts:1-13`] — deferred, pre-existing
- [x] [Review][Defer] OAuth tokens passed in URL query params (referrer/history leak risk) — Google routes commented out; existing redirect contract [`apps/web/src/app/auth/callback/page.tsx:16-17`] — deferred, pre-existing
- [x] [Review][Defer] No unit/integration tests for BFF `/api/auth/me` or `/api/auth/set-session` routes — API `auth/me` e2e covered; BFF layer untested — deferred, test-gap acceptable for MVP
