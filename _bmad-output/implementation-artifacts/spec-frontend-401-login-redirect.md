---
title: 'Common frontend 401 → login redirect guard'
type: 'feature'
created: '2026-07-10'
status: 'done'
baseline_commit: '5312fe522f3ab635451b657f4ddf9e7b7c7ea256'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/spec-admin-401-redirect-login.md'
  - '{project-root}/packages/api-client/src/index.ts'
  - '{project-root}/apps/admin/src/lib/admin-api.ts'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** When a frontend app's session expires or token is invalid, API calls return HTTP 401. Admin already redirects to `/login`, but web and Zalo show inline errors, return `null`, or throw messages like "Vui lòng đăng nhập…" without navigating away. Users stay on broken screens with no clear recovery path.

**Approach:** Add a shared unauthorized-session guard in `@practice-exam/api-client` (session clear + redirect, skip if already on login). Wire it into every frontend API entry point: `createApiClient` `onUnauthorized` for direct API calls, and a shared `authFetch` wrapper for web BFF `/api/*` routes. Refactor admin to use the same helper for consistency.

## Boundaries & Constraints

**Always:**
- On HTTP 401 from any authenticated API call, clear the app's session tokens and redirect to that app's login route.
- Login routes per app: web → `/sign-in`, admin → `/login`, Zalo → `/auth`.
- Skip redirect when the user is already on the login page (prevent redirect loops).
- Public/unauthenticated endpoints (e.g. `listSubjects`, disclaimer, maintenance) must not trigger redirect on 401 — only calls that require auth.
- Use `window.location.assign()` for redirect (matches existing admin pattern; works outside React Router context).

**Ask First:**
- Adding Next.js middleware for server-side route protection (this spec covers client-side API 401 only).
- Redirecting on 401 from the login form itself (wrong credentials return 401/400 — must not clear session loop).

**Never:**
- Change backend auth or JWT validation.
- Redirect on non-401 errors (403, 500, network failure).
- Break admin's existing working 401 behavior.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Expired token on protected page | API returns 401 | Session cleared; redirect to app login | N/A |
| Already on login page | 401 during background call | No redirect loop; session cleared only | N/A |
| Wrong login credentials | POST `/api/auth/login` returns 401/400 | Stay on login; show form error | No redirect |
| Public catalog browse | Unauthenticated `listSubjects` | No redirect; page works as today | N/A |
| BFF route 401 | `fetch('/api/progress/...')` returns 401 | `authFetch` triggers guard → `/sign-in` | N/A |
| Zalo direct API 401 | `zaloApi` call returns 401 | Clear `localStorage` tokens; redirect `/auth` | N/A |

</frozen-after-approval>

## Code Map

- `packages/api-client/src/unauthorized-guard.ts` — new: `createUnauthorizedGuard`, `authFetch`, `UnauthorizedError`
- `packages/api-client/src/index.ts` — export guard helpers
- `packages/api-client/src/unauthorized.test.ts` — extend tests for guard + authFetch
- `apps/admin/src/lib/admin-api.ts` — refactor to use `createUnauthorizedGuard` (behavior unchanged)
- `apps/web/src/lib/session.ts` — new: web cookie clear + `redirectToSignIn`
- `apps/web/src/lib/web-api.ts` — wire `onUnauthorized` via shared guard
- `apps/web/src/lib/auth-fetch.ts` — new: web `authFetch` using guard (wraps `/api/*`)
- `apps/web/src/lib/practice-api.ts`, `study-api.ts`, `mock-exam-api.ts` — replace manual 401 checks with `authFetch`
- `apps/web/src/app/(candidate)/(shell)/page.tsx`, `subjects/[id]/page.tsx`, `progress/page.tsx`, `progress/history/page.tsx` — replace inline 401 handling with `authFetch` or redirect guard
- `apps/zalo-mini-app/src/lib/session.ts` — new: Zalo token clear + `redirectToAuth`
- `apps/zalo-mini-app/src/lib/zalo-api.ts` — wire `onUnauthorized`
- `apps/zalo-mini-app/src/main.tsx` — wire `createClient()` with same guard (inline factory today)

## Tasks & Acceptance

**Execution:**
- [x] `packages/api-client/src/unauthorized-guard.ts` -- add `createUnauthorizedGuard({ loginPath, clearSession, getCurrentPath? })` returning `() => void` for `onUnauthorized`; add `authFetch(input, init, guard)` that calls guard on 401 and throws `UnauthorizedError` -- shared logic for all frontends
- [x] `packages/api-client/src/index.ts` -- export guard helpers and `UnauthorizedError`
- [x] `packages/api-client/src/unauthorized.test.ts` -- add tests: guard clears session + assigns login path; skips when on login path; `authFetch` invokes guard on 401; no guard on 200/403
- [x] `apps/admin/src/lib/admin-api.ts` -- refactor to use `createUnauthorizedGuard` with `/login`, `clearAdminSession` -- DRY, no behavior change
- [x] `apps/web/src/lib/session.ts` -- add `clearWebSession()` (expire `access_token` + `refresh_token` cookies) and `redirectToSignIn()` (skip if pathname starts with `/sign-in` or `/register`)
- [x] `apps/web/src/lib/auth-fetch.ts` -- export `webAuthFetch` using `authFetch` + web guard
- [x] `apps/web/src/lib/web-api.ts` -- add `getAccessToken` from cookie + `onUnauthorized` guard for authenticated direct API calls
- [x] `apps/web/src/lib/practice-api.ts`, `study-api.ts`, `mock-exam-api.ts` -- replace per-call `if (res.status === 401)` with `webAuthFetch`; remove duplicate error messages for 401
- [x] `apps/web/src/app/(candidate)/(shell)/page.tsx`, `subjects/[id]/page.tsx`, `progress/page.tsx`, `progress/history/page.tsx` -- use `webAuthFetch` on protected calls; optional-auth probes on home/subject-detail keep raw `fetch` with `401 → null` (documented) so guests are not redirected
- [x] `apps/zalo-mini-app/src/lib/session.ts` -- add `clearZaloSession()` + `redirectToAuth()` (skip if on `/auth`)
- [x] `apps/zalo-mini-app/src/lib/zalo-api.ts` -- wire `onUnauthorized` via `createUnauthorizedGuard`
- [x] `apps/zalo-mini-app/src/main.tsx` -- update `createClient()` to use same `onUnauthorized` guard

**Acceptance Criteria:**
- Given an authenticated web user whose `access_token` cookie is expired, when any protected `/api/*` call returns 401, then cookies are cleared and the browser navigates to `/sign-in`.
- Given an authenticated Zalo user with an invalid `localStorage` token, when `zaloApi` receives 401, then tokens are cleared and the browser navigates to `/auth`.
- Given an admin user with expired token (existing behavior), when any `adminApi` call returns 401, then session is cleared and browser navigates to `/login`.
- Given a user on `/sign-in` entering wrong credentials, when login fails, then the user stays on the sign-in page with an error message (no redirect loop).
- Given an unauthenticated user browsing the public subject catalog, when `listSubjects` succeeds without auth, then no redirect occurs.
- Given a 403 or 500 API response, when the error is handled, then no login redirect occurs.

## Design Notes

Admin already implements the target pattern in `admin-api.ts`. Extract it into `createUnauthorizedGuard` so all three apps share one implementation.

Web has two API paths — both must be covered:
1. **Direct API** (`createApiClient` with cookie token) — `onUnauthorized` on `webApi`
2. **BFF routes** (`fetch('/api/...')`) — `webAuthFetch` wrapper

Golden example (web BFF):

```ts
const guard = createUnauthorizedGuard({
  loginPath: "/sign-in",
  clearSession: clearWebSession,
  getCurrentPath: () => window.location.pathname,
});

export async function webAuthFetch(input: RequestInfo, init?: RequestInit) {
  return authFetch(input, init, guard);
}
```

Remove page-level `if (res.status === 401) return null` on **protected** routes — redirect is the recovery action. **Exception:** optional-auth probes on public pages (home free-tier, subject-detail entitlement/subscription/tier) intentionally keep raw `fetch` + `401 → null` so unauthenticated guests are not redirected.

## Verification

**Commands:**
- `pnpm --filter @practice-exam/api-client test` -- expected: all pass including new guard tests
- `pnpm --filter @practice-exam/api-client build` -- expected: ok
- `pnpm --filter web exec tsc --noEmit` -- expected: ok
- `pnpm --filter admin exec tsc --noEmit` -- expected: ok
- `pnpm --filter zalo-mini-app build` -- expected: ok

**Manual checks:**
- Web: log in → delete `access_token` cookie in DevTools → visit `/progress` → lands on `/sign-in`
- Zalo: log in → delete `access_token` from localStorage → open progress tab → lands on `/auth`
- Admin: expire token → refresh dashboard → lands on `/login` (unchanged)
- Web sign-in with wrong password → stays on `/sign-in` with error

## Spec Change Log

- 2026-07-10: Implemented shared `createUnauthorizedGuard` / `authFetch`; wired web BFF + direct API paths, admin refactor, Zalo session guard.

- 2026-07-10: Code review patches applied — attempt detail, checkout, Zalo mock results wired to guard; removed unused redirect helpers; added `getMockExamAttemptResults` to api-client.

### Review Findings

- [x] [Review][Decision] Optional-auth BFF probes vs expired-token redirect on subject detail — **Resolved (option 1):** keep raw `fetch` + `401 → null` with explicit comments on subscription, entitlement, and study-tier probes (mirrors home `fetchFreeTierUsage`). Protected action handlers on the same page use `webAuthFetch`.
- [x] [Review][Patch] Attempt detail page still uses unguarded `fetch` [`apps/web/src/app/(candidate)/(shell)/progress/history/[type]/[id]/page.tsx:18-29`]
- [x] [Review][Patch] Checkout flow pages bypass auth guard [`apps/web/src/app/(candidate)/subjects/[id]/checkout/page.tsx`, `apps/web/src/app/checkout/pending/page.tsx`]
- [x] [Review][Patch] Zalo mock-exam results uses raw `fetch` bypassing `onUnauthorized` [`apps/zalo-mini-app/src/main.tsx:966-968`]
- [x] [Review][Patch] Unused redirect helpers left after guard refactor [`apps/web/src/lib/session.ts:15-19`, `apps/admin/src/lib/admin-api.ts:13-17`, `apps/zalo-mini-app/src/lib/session.ts:9-13`]
- [x] [Review][Defer] `tsconfig.tsbuildinfo` files in working tree — deferred, pre-existing build-artifact noise unrelated to feature logic
