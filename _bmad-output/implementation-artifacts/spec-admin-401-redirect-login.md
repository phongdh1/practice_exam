---
title: 'Admin 401 redirect to login'
type: 'feature'
created: '2026-07-02'
status: 'done'
route: 'one-shot'
---

# Admin 401 redirect to login

## Intent

**Problem:** When the admin portal receives HTTP 401 from the API (expired or invalid token), pages show errors but the user stays on the current screen with no path back to login.

**Approach:** Add an optional `onUnauthorized` callback to the shared API client, invoked on any 401 response (JSON and blob download paths). Wire it in the admin app to clear `admin_access_token` and redirect to `/login`.

## Suggested Review Order

1. [`packages/api-client/src/index.ts`](../../packages/api-client/src/index.ts) — `onUnauthorized` hook, `assertOk` for blob/import fetch paths
2. [`apps/admin/src/lib/admin-api.ts`](../../apps/admin/src/lib/admin-api.ts) — session clear + redirect handler
3. [`packages/api-client/src/unauthorized.test.ts`](../../packages/api-client/src/unauthorized.test.ts) — 401 vs non-401 behavior

## Code Map

- `packages/api-client/src/index.ts` — optional `onUnauthorized` on `ApiClientConfig`; called from `request()` and blob/import helpers via `assertOk`
- `apps/admin/src/lib/admin-api.ts` — clears token and `window.location.assign("/login")` (skips if already on login)
- `packages/api-client/src/unauthorized.test.ts` — unit tests for callback invocation

## Verification

**Commands:**
- `pnpm --filter @practice-exam/api-client test` — expected: 12 passed (includes 2 new unauthorized tests)
- `pnpm --filter @practice-exam/api-client build` — expected: ok
- `pnpm --filter admin exec tsc --noEmit` — expected: ok

**Manual checks:**
- Log in to admin, expire/delete token in DevTools → navigate or refresh a protected page → should land on `/login`
- Login page itself should not redirect-loop (login uses raw `fetch`, not `adminApi`)

## Spec Change Log

- 2026-07-02: Initial one-shot implementation.
