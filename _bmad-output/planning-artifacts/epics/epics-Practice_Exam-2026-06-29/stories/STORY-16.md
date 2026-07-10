---
id: STORY-16
status: ready
prd_refs: ["FR-6"]
ad_refs: ["AD-5", "AD-7"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-16: PayOS payment adapter and checkout initiation

**Epic:** EPIC-4

As a **Candidate**,  
I want **to pay via PayOS hosted checkout**,  
So that **I can subscribe on web or Zalo without in-app card handling**.

## Acceptance Criteria

### AC-1

**Given** `POST /checkout/subscription` with provider payos returns checkoutUrl and paymentId  

**When** Payment.provider=payos and Payment.channel=web|zalo  

**Then** failed/cancelled payment does not create Subscription  

**And** **Note:** Implements FR-6 via architecture AD-5, not PRD ZaloPay/VNPay/MoMo
