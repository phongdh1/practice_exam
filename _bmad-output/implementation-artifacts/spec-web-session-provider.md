---
title: 'Web session provider and authenticated shell state'
type: 'feature'
created: '2026-07-10'
status: 'done'
story: 'STORY-69'
story_key: '2-69-web-session-provider-shell-auth'
baseline_commit: 'NO_VCS'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/spec-frontend-401-login-redirect.md'
  - '{project-root}/_bmad-output/planning-artifacts/sprint-change-proposal-2026-07-10-web-admin-ux.md'
---

## Intent

**Problem:** After email or OAuth sign-in, the candidate shell can remain in guest state until a hard refresh. Root cause: no shared session provider; home page infers auth from a stale free-tier query cache; only home sets `accountAction` via `useCandidateShell`.

**Approach:** Add BFF `GET /api/auth/me` (reads httpOnly cookies server-side), API `GET /api/v1/auth/me`, TanStack Query session key, `WebSessionProvider` + `useWebSession`, and shell layout that derives nav account affordance globally. Invalidate session + entitlements on login/OAuth. Complements `spec-frontend-401-login-redirect` (401 → logout); this spec covers login **state establishment**.

**Out of scope (STORY-70+):** W-50 account page UI, admin notifications, table UX, catalog pagination.

## Boundaries & Constraints

**Always:**
- Session probe via BFF `/api/auth/me` — never `document.cookie` for httpOnly tokens
- Optional-auth probe: 401 on `/api/auth/me` returns null client-side; no redirect
- Shell `(candidate)/(shell)/layout.tsx` owns `accountAction` from session
- OAuth callback sets cookies via BFF `POST /api/auth/set-session` (httpOnly parity with email login)

**Ask First:**
- Next.js middleware route protection
- Changing register flow to auto-login after sign-up

**Never:**
- Implement W-50 profile page (STORY-70)
- Break existing 401 logout redirect behavior

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|----------|--------------|---------------------------|
| Guest on home | No cookies | Session null; nav shows "Đăng nhập"; LandingHero visible |
| Email login success | BFF sets httpOnly cookies | Session query invalidated; nav shows account affordance |
| OAuth callback | Tokens POST to set-session | httpOnly cookies; session invalidated; redirect `/` |
| Expired session | `/api/auth/me` → 401 | Session null; guest affordance (401 guard on protected APIs still redirects) |
| Progress page logged in | Valid session | Same account affordance as home without page-local shell setup |
| Already on sign-in | N/A | No session redirect loop |

## Code Map

- `packages/types/src/index.ts` — `AuthMeUser`, `AuthIdentityLinkedView`
- `packages/api-client/src/index.ts` — `getMe()`, `queryKeys.auth.me`
- `apps/api/src/auth/auth.service.ts` — `getMe(userId)`
- `apps/api/src/auth/auth.controller.ts` — `GET auth/me`
- `apps/web/src/app/api/auth/me/route.ts` — BFF proxy
- `apps/web/src/app/api/auth/set-session/route.ts` — httpOnly cookie setter for OAuth
- `apps/web/src/components/web-session-provider.tsx` — provider + `useWebSession`
- `apps/web/src/lib/invalidate-web-session.ts` — shared invalidation helper
- `apps/web/src/app/(candidate)/layout.tsx` — wrap with `WebSessionProvider`
- `apps/web/src/app/(candidate)/(shell)/layout.tsx` — session-driven `accountAction`
- `apps/web/src/app/(candidate)/(shell)/page.tsx` — use session for catalog auth state
- `apps/web/src/app/sign-in/page.tsx`, `auth/callback/page.tsx` — invalidate on success

## Tasks & Acceptance

- [ ] API + BFF auth/me endpoints
- [ ] WebSessionProvider + shell layout integration
- [ ] Login/OAuth invalidation + OAuth httpOnly cookies
- [ ] Home page session integration
- [ ] Tests + typecheck

**Acceptance Criteria:**
- Post-login redirect to `/` shows authenticated nav without hard refresh
- Progress page shows same auth state as home
- `/api/auth/me` returns user profile when authenticated; 401 when not
- OAuth callback uses httpOnly cookies via BFF

## Reconciliation with spec-frontend-401-login-redirect

| Concern | 401 spec (done) | This spec (STORY-69) |
|---------|-----------------|----------------------|
| Direction | Logout on 401 | Establish login state |
| Session read | Clears cookies | BFF `/api/auth/me` probe |
| Optional auth | free-tier probe 401 → null | auth/me 401 → null |
| Protected routes | `webAuthFetch` redirects | Unchanged |

## Verification

**Commands:**
- `pnpm --filter @practice-exam/api-client test`
- `pnpm --filter api test -- auth.controller.spec`
- `pnpm --filter web exec tsc --noEmit`

**Manual:**
- Sign in on web → header updates on `/` without refresh
- Navigate to `/progress` → account affordance matches
- Sign out (expire cookie) → protected page redirects to sign-in per 401 spec

## Spec Change Log

- 2026-07-10: Initial spec from Correct Course Proposal 1 (STORY-69)
