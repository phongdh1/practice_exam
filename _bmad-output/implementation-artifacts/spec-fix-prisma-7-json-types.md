---
title: 'Fix Prisma 7 JSON type build errors'
type: 'bugfix'
created: '2026-07-02'
status: 'done'
route: 'one-shot'
---

## Intent

**Problem:** `pnpm run build` failed on `@practice-exam/api` after the Prisma 7 upgrade — seven TS2322 errors where `Record<string, unknown>` was no longer assignable to Prisma JSON fields, plus nullable dashboard cache types.

**Approach:** Add a small `toInputJsonValue` helper and tighten dashboard cache generics to `NonNullable<>` so production `nest build` compiles cleanly.

## Suggested Review Order

1. [input-json.ts](../../apps/api/src/prisma/input-json.ts) — shared Prisma 7 JSON cast helper
2. [admin-dashboard.service.ts](../../apps/api/src/admin-dashboard/admin-dashboard.service.ts) — cache types exclude null from stored values
3. [admin-auth.service.ts](../../apps/api/src/admin-auth/admin-auth.service.ts) — audit `details` cast
4. [admin-users.service.ts](../../apps/api/src/admin-users/admin-users.service.ts) — audit `details` cast
5. [integration-config.service.ts](../../apps/api/src/integrations/integration-config.service.ts) — audit `details` cast
6. [zalo-oauth-events.service.ts](../../apps/api/src/integrations/zalo-oauth-events.service.ts) — event `payload` cast
7. [settings.service.ts](../../apps/api/src/settings/settings.service.ts) — settings audit `details` cast

## Spec Change Log

- Follow-up to Prisma 7 migration. `pnpm run build` at repo root now succeeds for API.
