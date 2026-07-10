---
id: STORY-13
status: ready
prd_refs: ["FR-5"]
ad_refs: ["AD-11"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-13: Free Tier entitlement enforcement

**Epic:** EPIC-3

As a **Candidate**,  
I want **to practice up to the monthly Free Tier limit per Subject without subscribing**,  
So that **I can try the product before paying**.

## Acceptance Criteria

### AC-1

**Given** Free Tier counter resets ICT midnight on 1st of month per User per Subject  

**When** default limit is 20 questions (admin-overridable)  

**Then** at limit Practice Mode shows subscribe prompt Z-23/W-23  

**And** Free Tier does not grant Mock Exam access
