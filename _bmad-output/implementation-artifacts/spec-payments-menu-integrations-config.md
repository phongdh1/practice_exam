---
title: 'Add Payments menu link to provider config'
type: 'feature'
created: '2026-07-20'
status: 'done'
route: 'one-shot'
context: []
---

## Intent

**Problem:** Admins configuring PayOS/SePay had to know the deep URL `/integrations/payments`; the Payments section tabs only listed transactions, reconciliation, revenue, and promo codes.

**Approach:** Add a **Cấu hình cổng** tab pointing at `/integrations/payments`, show it only for `super_admin`, and keep the payments tab strip visible even when the page role gate denies access.

## Suggested Review Order

**Nav entry**

- Super-admin-only config tab appended to Payments section tabs
  [`payments-section-tabs.tsx:7`](../../apps/admin/src/components/payments-section-tabs.tsx#L7)

**Config page shell**

- Tabs outside `AdminRoleGate` so deny still allows navigation back
  [`page.tsx:185`](../../apps/admin/src/app/integrations/payments/page.tsx#L185)
