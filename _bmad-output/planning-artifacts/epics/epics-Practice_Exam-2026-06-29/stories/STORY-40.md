---
id: STORY-40
status: ready
prd_refs: ["FR-26"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-40: Subject pricing and Free Tier configuration

**Epic:** EPIC-9

As a **Platform Admin**,  
I want **to set monthly Subscription price and Free Tier limit per Subject**,  
So that **monetization matches business strategy per môn**.

## Acceptance Criteria

### AC-1

**Given** price is integer VND with minimum 10,000 VND floor  

**When** Free Tier limit is admin-configurable per Subject (default 20/month)  

**Then** price changes apply to new purchases only; active Subscriptions retain purchase-time price until renewal  

**And** changes propagate to candidate catalog within minutes
