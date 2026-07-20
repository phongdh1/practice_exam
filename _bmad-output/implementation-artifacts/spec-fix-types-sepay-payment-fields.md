---
title: 'Fix stale types dist for SePay payment fields'
type: 'bugfix'
created: '2026-07-20'
status: 'done'
route: 'one-shot'
context: []
---

## Intent

**Problem:** API `tsc` watch reported TS2353 — `bankAccountNumber`, `qrImageUrl`, and `transferContent` missing from `PaymentMerchantConfigView` / `CheckoutResult` / `PaymentDetail` — because `@practice-exam/types` resolves to gitignored `dist/` that lagged behind `src`.

**Approach:** Extend the shared payment DTOs in `packages/types/src`, rebuild `@practice-exam/types` so local `dist` matches, and confirm those SePay field errors clear.

## Suggested Review Order

**Shared DTO surface**

- Entry point: VietQR + bank fields on checkout/payment DTOs
  [`index.ts:354`](../../packages/types/src/index.ts#L354)

- Merchant admin view gains bank account keys (required nullables)
  [`index.ts:787`](../../packages/types/src/index.ts#L787)

**Verify rebuild**

- After `pnpm --filter @practice-exam/types build`, confirm declarations include the new keys
  [`index.d.ts:691`](../../packages/types/dist/index.d.ts#L691)
