---
title: 'Fix import parseWorkbook TypeScript errors'
type: 'bugfix'
created: '2026-07-02'
status: 'done'
route: 'one-shot'
---

## Intent

**Problem:** `pnpm run dev` failed on `@practice-exam/api` with three TS errors in `parseWorkbook` — `map` returned `null` for empty rows, breaking `ImportRow[]` typing and cascading into invalid type-predicate and null-access errors.

**Approach:** Replace `map` + `filter(null)` with a `for` loop using `continue` for empty rows and template example stems, producing a clean `ImportRow[]` without nullable intermediates.

## Suggested Review Order

1. [import-questions.service.ts](../../apps/api/src/questions/import-questions.service.ts) — `parseWorkbook` loop refactor; behavior unchanged (skip empty rows + example stems)
2. [import-questions.service.spec.ts](../../apps/api/src/questions/import-questions.service.spec.ts) — 14 tests confirm parse/skip/validate behavior still passes

## Verification

**Commands:**
- `pnpm test import-questions.service.spec` — expected: 14/14 pass
- `pnpm run dev` — expected: API compiles and Nest starts without import-questions TS errors
