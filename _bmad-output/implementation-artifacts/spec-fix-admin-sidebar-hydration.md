---
status: done
slug: fix-admin-sidebar-hydration
title: Fix React hydration mismatch on AdminSidebar nav links (admin app)
date: 2026-07-01
workflow: bmad-quick-dev
---

# Fix: AdminSidebar hydration mismatch (`/questions` and all AdminShell pages)

## Root Cause (updated 2026-07-02)

The nav-link static class strings fix was necessary but **not sufficient**. The remaining
hydration mismatch came from **`AdminPageShell` reading `localStorage` during render** via
`getAdminRoleFromToken()`:

- **Server:** `role = null` → hides most nav items, `showNewSubject = false`
- **Client (first paint):** `role = super_admin` (from JWT) → full nav, `showNewSubject = true`

That structural mismatch made React report `className` diffs on sidebar `<a>` elements (dashboard,
Support, Sign Out).

## Fix (root cause, not suppression)

`apps/admin/src/lib/admin-role.ts` — added `useAdminRole()` using `useSyncExternalStore` so SSR
and hydration both snapshot `null`; the real JWT role applies only after mount.

`apps/admin/src/components/admin-page-shell.tsx` — uses `useAdminRole()` instead of
`getAdminRoleFromToken()` during render.

Same hook applied in `admin-role-gate.tsx` and `users/[id]/page.tsx` for consistency.

`packages/ui/src/components/admin-shell.tsx` — static nav-link class strings (unchanged).

`apps/admin/src/app/layout.tsx` — `suppressHydrationWarning` on `<html>`/`<body>` for browser
extensions (unchanged).


## Verification

- `pnpm --filter @practice-exam/ui build` → exit 0 (tsc emit).
- `pnpm --filter @practice-exam/admin build` → exit 0; `/questions` prerenders as
  `○ (Static)` with no hydration warnings.
- Running dev server probe (`localhost:3002`) returns exactly one `bg-primary-container`
  (active) and the expected `text-on-primary/80` inactive classes — deterministic output.

Not committed (per request).
