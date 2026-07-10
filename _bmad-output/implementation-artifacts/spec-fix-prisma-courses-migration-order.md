---
title: 'Fix Prisma courses migration order'
type: 'bugfix'
created: '2026-07-09'
status: 'done'
route: 'one-shot'
---

# Fix Prisma courses migration order

## Intent

Problem: Prisma shadow database replay failed with P3006/P3018 because migration `20260702075001` altered `courses` before the table was created by `20260702193000_courses_catalog_grouping`.

Approach: Convert `20260702075001` into a documented no-op because the current Prisma schema still expects `Course.id` to keep its UUID default.

## Suggested Review Order

1. `../../apps/api/prisma/migrations/20260702075001/migration.sql` - confirm the early migration no longer references `courses`.
2. `../../apps/api/prisma/migrations/20260702193000_courses_catalog_grouping/migration.sql` - confirm `courses` remains created and backfilled in the later catalog grouping migration.

## Verification

- `pnpm --filter @practice-exam/api exec prisma validate` passed.
- `pnpm --filter @practice-exam/api exec prisma migrate dev` no longer reports the original missing `courses` table shadow replay error, but stops because the connected Supabase database already applied the old checksum for `20260702075001` and has drift on `courses.id`.
- `pnpm --filter @practice-exam/api exec prisma migrate status` reports `20260702194000_subject_go_live_config` is not yet applied.
