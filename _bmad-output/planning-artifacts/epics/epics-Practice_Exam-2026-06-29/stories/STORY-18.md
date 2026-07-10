---
id: STORY-18
status: ready
prd_refs: ["FR-6", "FR-36"]
ad_refs: ["AD-6"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-18: Payment webhooks with idempotent entitlement activation

**Epic:** EPIC-4

As a **platform**,  
I want **payment webhooks to activate subscriptions exactly once**,  
So that **successful payments never double-grant or lose entitlements**.

## Acceptance Criteria

### AC-1

**Given** `POST /webhooks/payos` and `POST /webhooks/sepay` verify signatures  

**When** PaymentWebhookEvent stored with unique (provider, external_event_id)  

**Then** PAID status idempotently activates Subscription  

**And** failed webhooks enqueue BullMQ retry; admin can manual retry (FR-43 pattern)
