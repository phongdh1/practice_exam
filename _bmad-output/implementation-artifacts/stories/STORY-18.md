---
id: STORY-18
story_key: 4-18-payment-webhooks-idempotency
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-6", "FR-36"]
ad_refs: ["AD-6"]
---

# STORY-18: Payment webhooks with idempotent entitlement activation

**Epic:** EPIC-4

## Tasks/Subtasks

- [x] Add PaymentWebhookEvent with unique (provider, external_event_id)
- [x] Implement POST /webhooks/payos and POST /webhooks/sepay
- [x] Idempotent PAID processing activates Subscription exactly once
- [x] Failed webhook events stored with retry endpoint POST /webhooks/events/:id/retry
- [x] Add webhook idempotency tests

## Status

review
