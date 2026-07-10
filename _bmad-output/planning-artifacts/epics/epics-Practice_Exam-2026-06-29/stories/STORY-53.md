---
id: STORY-53
status: ready
prd_refs: ["FR-40"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-53: Promo code management

**Epic:** EPIC-11

As a **Finance Admin**,  
I want **to create and manage promo codes on A-74**,  
So that **marketing can offer controlled discounts at checkout**.

## Acceptance Criteria

### AC-1

**Given** promo code has expiry date, usage limit, and applicable Subject(s)  

**When** percentage or fixed discount supported  

**Then** discount applies at checkout only; one code per purchase  

**And** usage count visible; expired codes cannot be applied
