---
id: STORY-55
story_key: 12-55-payment-provider-merchant-config
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-42"]
ad_refs: ["AD-5"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-07-01"
    prd_version_or_updated: "EPIC-12 code review final pass"
    change_summary: "Approved — all High + Medium items verified"
    story_delta: "done"
  - date: "2026-07-01"
    prd_version_or_updated: "EPIC-12 code review re-pass"
    change_summary: "Medium review fixes: webhook hardening, testMode default, migration rename"
    story_delta: "All Medium items resolved — review"
  - date: "2026-07-01"
    prd_version_or_updated: "EPIC-12 implementation"
    change_summary: "PayOS/SePay merchant admin config on A-81"
    story_delta: "Implemented — status review"
  - date: "2026-07-01"
    prd_version_or_updated: "EPIC-12 code review High fixes"
    change_summary: "Wire merchant credentials into adapters; harden admin test-webhook"
    story_delta: "High review items patched — remaining Medium items open"
---

# STORY-55: Payment provider merchant configuration

**Epic:** EPIC-12

As a **Super Admin**,  
I want **to configure PayOS/SePay merchant settings on A-81**,  
So that **hosted checkout works on web and Zalo channels**.

## Acceptance Criteria

### AC-1

**Given** configure merchant credentials per provider (payos|sepay)  
**When** test mode payments do not create production Subscriptions  
**Then** webhook endpoints documented and testable from admin  
**And** **Note:** Replaces PRD FR-42 ZaloPay merchant config per AD-5

## Tasks/Subtasks

- [x] Store per-provider merchant config in SystemSetting with masked secrets
- [x] GET/PUT admin endpoints for payos and sepay (super_admin)
- [x] Set Payment.isTest from merchant testMode at checkout
- [x] Skip subscription activation on paid webhook when isTest
- [x] Document webhook URLs in admin API and A-81 UI
- [x] POST test-webhook from admin for manual verification
- [x] Add unit tests for test-mode checkout and webhook behavior
- [x] [AI-Review][High] Wire merchant credentials into PayosAdapter/SepayAdapter at checkout
- [x] [AI-Review][High] Gate admin test-webhook behind audit log + pending test-mode payment guards

## Dev Agent Record

### Implementation Plan
Merchant config per AD-5; testMode flag flows to Payment.isTest; webhooks skip activateOrRenewFromPayment for test payments.

### Completion Notes
✅ PayOS and SePay merchant settings configurable on A-81.  
✅ Test mode payments mark paid without production Subscription.  
✅ Webhook URLs shown and testable from admin.  
✅ PayOS/SePay adapters load merchant config at checkout; production checkout uses credentials (mock URL when testMode).  
✅ Admin test-webhook requires pending test-mode payment, writes IntegrationAuditLog.

### Senior Developer Review (AI) — High fixes
- [x] [High] Merchant credentials wired into `ConfiguredPaymentAdapter` via `IntegrationConfigService`
- [x] [High] `sendTestPaymentWebhook` gated: pending + test-mode + provider match + audit log

### Senior Developer Review (AI) — EPIC-12 re-review (2026-07-01)

**Outcome:** Changes Requested  
**High fixes verified:** Both prior High items resolved — adapters load merchant config at checkout; admin test-webhook gated with audit log  
**Tests:** `pnpm --filter @practice-exam/api test` — 151 passed (includes `payment-adapters.spec.ts`, `webhook-log-admin.service.spec.ts`)

## File List

- apps/api/src/integrations/integration-config.service.ts
- apps/api/src/integrations/integrations-admin.controller.ts
- apps/api/src/integrations/webhook-log-admin.service.ts
- apps/api/src/integrations/webhook-log-admin.service.spec.ts
- apps/api/src/payments/adapters/payment-adapters.ts
- apps/api/src/payments/adapters/payment-adapters.spec.ts
- apps/api/src/payments/adapters/payment-adapter.utils.ts
- apps/api/src/payments/adapters/payment-adapter.utils.spec.ts
- apps/api/prisma/migrations/20260701185500_payments_admin/migration.sql
- apps/api/src/payments/payment-provider.port.ts
- apps/api/src/payments/webhooks.service.ts
- apps/api/src/payments/checkout.service.ts
- apps/api/src/payments/checkout.service.spec.ts
- apps/admin/src/app/integrations/payments/page.tsx
- packages/types/src/index.ts
- packages/api-client/src/index.ts

## Change Log

| Date | Change |
|------|--------|
| 2026-07-01 | Implemented STORY-55 payment merchant admin configuration |
| 2026-07-01 | High review fix: merchant credentials in adapters; hardened admin test-webhook |

### Review Findings

- [x] [Review][Patch] Merchant credentials stored in `SystemSetting` but adapters ignored them at checkout — **resolved** re-review: `ConfiguredPaymentAdapter` loads config via `IntegrationConfigService` [`payment-adapters.ts:33-87`]
- [x] [Review][Patch] `sendTestPaymentWebhook` lacked guards and audit trail — **resolved** re-review: pending + test-mode + provider match + `writeIntegrationAudit` [`webhook-log-admin.service.ts:90-139`]
- [x] [Review][Patch] `isProviderTestMode` falls back to `NODE_ENV !== 'production'` when merchant config absent — staging without explicit `testMode` may activate production subscriptions [`integration-config.service.ts:144-147`]
- [x] [Review][Patch] Duplicate Prisma migration timestamps (`20260701190000_payments_admin` and `20260701190000_epic12_integrations`) may cause deploy ordering ambiguity [`apps/api/prisma/migrations/`]
- [x] [Review][Patch] `parseWebhookBody` defaults missing `status` to `"paid"` — malformed provider payloads could mark payments paid [`payment-adapter.utils.ts:24-28`]
- [x] [Review][Patch] `verifyWebhook` skips signature when `config.testMode` even in production — leaving testMode enabled on live merchant config allows forged webhooks [`payment-adapters.ts:61-63`]
- [x] [Review][Defer] Full PayOS/SePay SDK adapter wiring deferred — mock adapters acceptable for current scaffold; admin config surface is in place

### Senior Developer Review (AI) — EPIC-12 final pass (2026-07-01)

**Outcome:** Approved  
**Tests:** `pnpm --filter @practice-exam/api test` — 167 passed  
**Pass 1 High verified:** Merchant credentials in `ConfiguredPaymentAdapter`; admin test-webhook gated (pending + isTest + audit log)  
**Pass 2 Medium verified:** `parseWebhookBody` requires explicit status; `verifyWebhook` no testMode bypass; `isProviderTestMode` safe default `true`; migration renamed `20260701185500_payments_admin`  
**Deferred (unchanged):** Full PayOS/SePay SDK adapter wiring

## Status

done
