---
id: STORY-56
story_key: 12-56-webhook-event-log-manual-retry
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-43"]
ad_refs: ["AD-6"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-07-01"
    prd_version_or_updated: "EPIC-12 code review final pass"
    change_summary: "Approved — all Medium items verified"
    story_delta: "done"
  - date: "2026-07-01"
    prd_version_or_updated: "EPIC-12 code review re-pass"
    change_summary: "Medium review fixes: unified query, async purge, payload UI"
    story_delta: "All Medium items resolved — review"
  - date: "2026-07-01"
    prd_version_or_updated: "EPIC-12 implementation"
    change_summary: "Webhook log and manual retry on A-83"
    story_delta: "Implemented — status review"
---

# STORY-56: Webhook event log and manual retry

**Epic:** EPIC-12

As a **Super Admin**,  
I want **to view webhook events on A-83**,  
So that **I can diagnose OAuth and payment integration failures**.

## Acceptance Criteria

### AC-1

**Given** log shows Zalo OAuth and payment webhook events with payload status and errors  
**When** retains 90 days of events  
**Then** failed webhooks are manually retryable from admin  
**And** retry is idempotent per AD-6 PaymentWebhookEvent rules

## Tasks/Subtasks

- [x] Add ZaloOAuthEvent model and log sign-in/link outcomes from AuthService
- [x] Admin list endpoint merging payment and Zalo OAuth events
- [x] Purge events older than 90 days on list
- [x] Move payment webhook retry behind super_admin admin endpoint
- [x] Build A-83 admin page at `/integrations/webhooks`
- [x] Add unit tests for merged log view and retry guards

## Dev Agent Record

### Implementation Plan
Unified admin log from PaymentWebhookEvent + ZaloOAuthEvent; retention purge on read; retry delegates to existing idempotent WebhooksService.

### Completion Notes
✅ A-83 shows payment and Zalo OAuth events with status and errors.  
✅ 90-day retention enforced on list.  
✅ Failed payment webhooks retryable from admin with idempotent processing.  
✅ Shared `WebhookLogAdminService` hardened for admin test-webhook (see STORY-55 High fix).

### Senior Developer Review (AI) — cross-story High fix
- [x] [High] Admin test-webhook guards + audit logging implemented in `webhook-log-admin.service.ts` (STORY-55)

### Senior Developer Review (AI) — EPIC-12 re-review (2026-07-01)

**Outcome:** Changes Requested  
**High fixes verified:** Admin test-webhook guards confirmed via `webhook-log-admin.service.spec.ts`  
**Tests:** `pnpm --filter @practice-exam/api test` — 151 passed

## File List

- apps/api/prisma/schema.prisma
- apps/api/src/integrations/webhook-log-admin.service.ts
- apps/api/src/integrations/webhook-log-admin.service.spec.ts
- apps/api/src/integrations/zalo-oauth-events.service.ts
- apps/api/src/integrations/integrations-admin.controller.ts
- apps/api/src/auth/auth.service.ts
- apps/api/src/payments/payments.controller.ts
- apps/admin/src/app/integrations/webhooks/page.tsx
- packages/types/src/index.ts

## Change Log

| Date | Change |
|------|--------|
| 2026-07-01 | Implemented STORY-56 webhook event log and manual retry |
| 2026-07-01 | Updated webhook-log-admin tests for admin test-webhook guards (STORY-55 High fix) |

### Review Findings

- [x] [Review][Patch] `listEvents` fetches `limit` rows per table independently then merges — biased sampling when one event category dominates recent history [`webhook-log-admin.service.ts:22-68`]
- [x] [Review][Patch] `purgeExpired` runs synchronously on every list request — read path triggers destructive deletes; contention risk under concurrent admin use [`webhook-log-admin.service.ts:142-154`]
- [x] [Review][Patch] A-83 webhook log table shows status/errors only; AC-1 requires payload visibility — `WebhookEventLogItem` has no payload field and UI omits it [`webhooks/page.tsx:45-99`, `packages/types/src/index.ts:622-634`]
- [x] [Review][Defer] Zalo OAuth events not manually retryable — AC only mandates payment webhook retry; current `canRetry: false` is acceptable

### Senior Developer Review (AI) — EPIC-12 final pass (2026-07-01)

**Outcome:** Approved  
**Tests:** `pnpm --filter @practice-exam/api test` — 167 passed  
**Pass 1 High verified:** Admin test-webhook guards + audit logging (`webhook-log-admin.service.spec.ts`)  
**Pass 2 Medium verified:** `listEvents` UNION query; throttled async `purgeExpired`; `payload` on `WebhookEventLogItem` + A-83 expandable UI  
**Deferred (unchanged):** Zalo OAuth events not manually retryable (AC allows payment-only retry)

## Status

done
