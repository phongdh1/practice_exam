---
id: STORY-16
story_key: 4-16-payos-checkout-initiation
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-6"]
ad_refs: ["AD-5", "AD-7"]
---

# STORY-16: PayOS payment adapter and checkout initiation

**Epic:** EPIC-4

## Tasks/Subtasks

- [x] Add Payment model and PaymentProvider port
- [x] Implement PayosAdapter with mock checkout for dev/test
- [x] Implement POST /api/v1/checkout/subscription returning checkoutUrl and paymentId
- [x] Ensure failed/cancelled payment does not create Subscription
- [x] Add checkout unit tests

## Dev Agent Record

### Completion Notes
✅ POST /checkout/subscription creates PENDING Payment only; Subscription activates via webhook.  
✅ PayOS adapter returns hosted checkout URL (mock in dev).

## File List

- apps/api/src/payments/**
- apps/api/prisma/schema.prisma

## Status

review
