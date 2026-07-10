---
id: STORY-55
status: ready
prd_refs: ["FR-42"]
ad_refs: ["AD-5"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
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
