---
title: 'Admin login: persist and show user info'
type: 'feature'
created: '2026-07-14'
status: 'done'
baseline_commit: 'faa31ced46d0d91e2bf45deb93ce4ee4396d6467'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Admin login stores only `admin_access_token` and ignores `admin` (`id`, `username`, `displayName`, `role`) from the login response, so the shell never shows who is signed in.

**Approach:** On successful admin login, persist the returned admin profile with the token; show display name (fallback: username) and role in the admin top bar; clear the profile whenever the session is cleared (401 or Sign Out).

## Boundaries & Constraints

**Always:**
- Persist profile from the existing login API response — no new backend `/me` for this change.
- Clear profile in the same path that clears the access token (`clearAdminSession`).
- Hydration-safe reads (same pattern as `useAdminRole` / `useSyncExternalStore`) — no `localStorage` during SSR.
- Top bar label: `displayName` if non-empty, else `username`; secondary line: `role`.

**Ask First:**
- Changing JWT payload shape (e.g. embedding `displayName` in the token).
- Adding an admin profile/avatar upload or `/admin/auth/me` endpoint.

**Never:**
- Fake or remote avatar URLs when none exist — use a Material Symbol fallback.
- Touching candidate web session / BFF cookies.
- Changing RBAC enforcement (UI display only).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | Valid login, response includes `admin` + token | Token + profile persisted; after redirect, top bar shows name + role | N/A |
| REFRESH | Token + profile already in localStorage | Top bar shows same name + role after hydration | If profile JSON corrupt, hide user block (keep token/role path intact) |
| CLEAR_401 | API returns 401 | `clearAdminSession` removes token **and** profile; redirect `/login` | N/A |
| SIGN_OUT | User clicks Sign Out | Same clear + redirect `/login` | N/A |
| MISSING_DISPLAY | `displayName` null/empty | Top bar primary text = `username` | N/A |

</frozen-after-approval>

## Code Map

- `apps/admin/src/app/login/page.tsx` — persist admin profile on successful login
- `apps/admin/src/lib/admin-api.ts` — `clearAdminSession` also removes profile key
- `apps/admin/src/lib/admin-session.ts` — new: profile storage helpers + hydration-safe `useAdminUser` hook
- `apps/admin/src/components/admin-app-frame.tsx` — top-bar user chip; pass Sign Out handler into sidebar
- `packages/ui/src/components/admin-shell.tsx` — optional `onSignOut` on `AdminSidebar` (replace dead `href="#"`)

## Tasks & Acceptance

**Execution:**
- [x] `apps/admin/src/lib/admin-session.ts` -- add profile key helpers + `useAdminUser` (hydration-safe) -- single source for read/write of cached admin
- [x] `apps/admin/src/lib/admin-api.ts` -- clear profile inside `clearAdminSession` -- 401 and Sign Out stay consistent
- [x] `apps/admin/src/app/login/page.tsx` -- on success, store `body.data.admin` with token -- profile survives navigation/refresh
- [x] `packages/ui/src/components/admin-shell.tsx` -- add optional `onSignOut`; wire Sign Out control -- enable real logout from sidebar
- [x] `apps/admin/src/components/admin-app-frame.tsx` -- render name+role chip in top bar; pass `onSignOut` that clears session and redirects `/login` -- match Stitch A-30 identity affordance
- [x] Manual verify I/O matrix scenarios (login, refresh, sign out, 401 if feasible)

**Acceptance Criteria:**
- Given a successful admin login, when the dashboard loads, then the top bar shows the admin’s display name (or username) and role
- Given a stored profile, when the page is refreshed, then the same identity still appears after hydration
- Given Sign Out or a 401 from `adminApi`, when the session clears, then both token and profile are removed and the user lands on `/login`

## Spec Change Log

## Verification

**Commands:**
- `pnpm --filter admin exec tsc --noEmit` -- expected: no type errors in changed admin files

**Manual checks:**
- Log in as an admin with `displayName` set → top bar shows displayName + role
- Refresh → identity remains
- Sign Out → `/login`, localStorage has no `admin_access_token` / profile key
- Log in as admin with null displayName → top bar shows username

## Suggested Review Order

**Session store**

- Cached snapshot keeps `useSyncExternalStore` referentially stable
  [`admin-session.ts:14`](../../apps/admin/src/lib/admin-session.ts#L14)

- Persist / clear / validate profile from login response only
  [`admin-session.ts:37`](../../apps/admin/src/lib/admin-session.ts#L37)

- Hydration-safe hook (`null` on SSR, real value after mount)
  [`admin-session.ts:87`](../../apps/admin/src/lib/admin-session.ts#L87)

**Login + clear paths**

- Store `body.data.admin` after token; clear stale profile first
  [`page.tsx:33`](../../apps/admin/src/app/login/page.tsx#L33)

- 401 and Sign Out both clear token and profile together
  [`admin-api.ts:9`](../../apps/admin/src/lib/admin-api.ts#L9)

**Top bar + Sign Out UI**

- Name + role chip with Material Symbol fallback (no fake avatar)
  [`admin-app-frame.tsx:64`](../../apps/admin/src/components/admin-app-frame.tsx#L64)

- Wire sidebar Sign Out to clear session and redirect `/login`
  [`admin-app-frame.tsx:32`](../../apps/admin/src/components/admin-app-frame.tsx#L32)

- Optional `onSignOut` button replaces dead `#` when provided
  [`admin-shell.tsx:157`](../../packages/ui/src/components/admin-shell.tsx#L157)
