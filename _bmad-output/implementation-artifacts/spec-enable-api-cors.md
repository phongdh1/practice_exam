---
title: 'Enable API CORS for web and admin clients'
type: 'bugfix'
created: '2026-07-02'
status: 'done'
route: 'one-shot'
---

## Intent

**Problem:** Browser requests from `http://localhost:3000` to `http://localhost:3001/api/v1/settings/maintenance` failed CORS preflight because the Nest API never enabled cross-origin headers.

**Approach:** Add configurable CORS in `main.ts` with sensible local dev defaults (ports 3000/3002/3003) and optional `CORS_ORIGINS` override for production.

## Suggested Review Order

1. [cors.ts](../../apps/api/src/config/cors.ts) — origin resolution and CORS options
2. [main.ts](../../apps/api/src/main.ts) — `app.enableCors(...)` bootstrap hook
3. [cors.spec.ts](../../apps/api/src/config/cors.spec.ts) — origin parsing tests
4. [.env.example](../../.env.example) — `ADMIN_APP_URL` and `CORS_ORIGINS` docs

## Spec Change Log

- Initial fix. Restart API dev server after pulling changes.
