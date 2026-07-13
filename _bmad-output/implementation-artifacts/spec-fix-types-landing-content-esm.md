---
title: 'Fix types package ESM landing-content import crash'
type: 'bugfix'
created: '2026-07-13'
status: 'done'
route: 'one-shot'
context: []
---

## Intent

**Problem:** API dev server crashed on startup with `ERR_MODULE_NOT_FOUND: Cannot find module '.../packages/types/dist/landing-content'` because `@practice-exam/types` compiled to ESM `export from "./landing-content"` without a `.js` extension, which Node 24 cannot resolve.

**Approach:** Align `packages/types/tsconfig.json` with `packages/utils` — emit **CommonJS** (`module: CommonJS`, `moduleResolution: Node`) so `dist/index.js` uses `require("./landing-content")`.

## Suggested Review Order

1. [packages/types/tsconfig.json](packages/types/tsconfig.json) — module emit strategy change
2. [packages/types/dist/index.js](packages/types/dist/index.js) — verify `require` output after `pnpm --filter @practice-exam/types build`
3. Terminal: restart `pnpm run dev` and confirm `@practice-exam/api:dev` starts without `ERR_MODULE_NOT_FOUND`

## Files Changed

| File | Change |
|------|--------|
| `packages/types/tsconfig.json` | Set `module: CommonJS`, `moduleResolution: Node` |

## Review Findings

| Category | Item |
|----------|------|
| patch | Applied — tsconfig aligned with utils package |
| defer | Other workspace packages still use ESNext from base; audit separately if similar crashes appear |
| reject | — |
