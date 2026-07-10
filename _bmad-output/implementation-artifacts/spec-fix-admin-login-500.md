---
title: 'Fix admin login 500 — apply admin_auth_audit migration'
type: 'bugfix'
created: '2026-07-02'
status: 'done'
route: 'one-shot'
---

## Intent

**Problem:** `POST /api/v1/admin/auth/login` returned 500 because `admin_auth_audit_logs` table was missing — login always writes an audit row before returning tokens.

**Approach:** Apply pending migration `20260702180000_admin_auth_audit` and point Prisma CLI at `DIRECT_URL` (port 5432) so `migrate deploy` works with Supabase.

## Suggested Review Order

1. [prisma.config.ts](../../apps/api/prisma.config.ts) — CLI datasource uses `DIRECT_URL` for migrations
2. [migration.sql](../../apps/api/prisma/migrations/20260702180000_admin_auth_audit/migration.sql) — creates `admin_auth_audit_logs`
3. [login/page.tsx](../../apps/admin/src/app/login/page.tsx) — reads `error.message` from API envelope on failure

## Spec Change Log

- Ran `pnpm prisma migrate deploy` — applied `20260702180000_admin_auth_audit`.
- Verified login returns 201 with JWT for seeded `admin` / `Admin@123`.
