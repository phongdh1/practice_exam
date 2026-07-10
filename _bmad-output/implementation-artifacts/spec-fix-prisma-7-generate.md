---
title: 'Fix Prisma 7 generate datasource config'
type: 'bugfix'
created: '2026-07-02'
status: 'done'
route: 'one-shot'
---

## Intent

**Problem:** `prisma generate` failed on Prisma 7.8.0 because `url` and `directUrl` are no longer allowed in `schema.prisma` (P1012).

**Approach:** Move datasource URLs to `prisma.config.ts`, remove them from the schema, and wire `PrismaClient` through `@prisma/adapter-pg` as required by Prisma 7.

## Suggested Review Order

1. [prisma.config.ts](../../apps/api/prisma.config.ts) — CLI datasource + env loading for monorepo `.env`
2. [schema.prisma](../../apps/api/prisma/schema.prisma) — datasource block without URLs
3. [create-prisma-adapter.ts](../../apps/api/src/prisma/create-prisma-adapter.ts) — runtime adapter factory
4. [prisma.service.ts](../../apps/api/src/prisma/prisma.service.ts) — Nest service passes adapter to `PrismaClient`
5. [seed.ts](../../apps/api/prisma/seed.ts) — seed script uses same adapter pattern
6. [package.json](../../apps/api/package.json) — `@prisma/adapter-pg` and `pg` dependencies

## Spec Change Log

- Initial one-shot implementation. `pnpm prisma:generate` succeeds after migration.

## Design Notes

- `DATABASE_URL` (pooler) is used at runtime via `PrismaPg`; `DIRECT_URL` stays in `prisma.config.ts` for migrations.
- Env loading mirrors existing `load-env.ts` / monorepo root `.env` convention.
