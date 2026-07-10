---
id: STORY-54
story_key: 12-54-zalo-mini-app-configuration
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-41"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-07-01"
    prd_version_or_updated: "EPIC-12 code review final pass"
    change_summary: "Approved — all Medium items verified"
    story_delta: "done"
  - date: "2026-07-01"
    prd_version_or_updated: "EPIC-12 code review re-pass"
    change_summary: "Medium review fixes: OAuth token-exchange Zalo probe"
    story_delta: "Medium items resolved — review"
  - date: "2026-07-01"
    prd_version_or_updated: "EPIC-12 implementation"
    change_summary: "Zalo Mini App admin config on A-80"
    story_delta: "Implemented — status review"
---

# STORY-54: Zalo Mini App configuration

**Epic:** EPIC-12

As a **Super Admin**,  
I want **to configure Zalo Mini App credentials on A-80**,  
So that **the Mini App can authenticate and deploy correctly**.

## Acceptance Criteria

### AC-1

**Given** configure app ID and secrets with deployment status view  
**When** invalid credentials surface diagnostic error without exposing secrets to Candidates  
**Then** configuration changes require super-admin role  
**And** changes are audit-logged

## Tasks/Subtasks

- [x] Store Zalo Mini App config in SystemSetting with masked secret API responses
- [x] GET/PUT/POST verify admin endpoints guarded by super_admin
- [x] Wire ZaloOAuthService to DB config with env fallback
- [x] Audit-log config changes in IntegrationAuditLog
- [x] Build A-80 admin page at `/integrations/zalo`
- [x] Add unit tests for config masking and audit logging

## Dev Agent Record

### Implementation Plan
SystemSetting JSON for Zalo credentials; admin API masks secrets; verify endpoint updates deployment status and diagnostic error for admins only.

### Completion Notes
✅ Super Admin can configure and verify Zalo Mini App credentials on A-80.  
✅ Secrets never exposed in API responses; candidates see generic auth errors only.  
✅ All config changes audit-logged.

## File List

- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260701190000_epic12_integrations/migration.sql
- apps/api/src/integrations/**
- apps/api/src/auth/zalo-oauth.service.ts
- apps/api/src/auth/auth.module.ts
- apps/admin/src/app/integrations/zalo/page.tsx
- packages/types/src/index.ts
- packages/api-client/src/index.ts

## Change Log

| Date | Change |
|------|--------|
| 2026-07-01 | Implemented STORY-54 Zalo Mini App admin configuration |

### Senior Developer Review (AI) — EPIC-12 re-review (2026-07-01)

**Outcome:** Changes Requested  
**High fixes (cross-story):** N/A for STORY-54  
**Tests:** `pnpm --filter @practice-exam/api test` — 151 passed

### Review Findings

- [x] [Review][Patch] Zalo credential probe uses hardcoded `probe-token` against Zalo Graph API — cannot reliably validate app secret; may report `verified` for invalid credentials [`integration-config.service.ts:257-278`]
- [x] [Review][Patch] Unreachable branch in `probeZaloCredentials`: error code `-216` checked at line 269 then again at 272 (second check never runs) [`integration-config.service.ts:269-273`]
- [x] [Review][Defer] `callbackUrl` persisted in config but not wired into OAuth redirect flow — deferred, future enhancement

### Senior Developer Review (AI) — EPIC-12 final pass (2026-07-01)

**Outcome:** Approved  
**Tests:** `pnpm --filter @practice-exam/api test` — 167 passed  
**Pass 2 Medium verified:** OAuth token-exchange Zalo probe; dead branch removed  
**Deferred (unchanged):** `callbackUrl` not wired into OAuth redirect flow

## Status

done
