---
id: STORY-59
status: ready
prd_refs: ["FR-46", "FR-15"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-59: System settings including disclaimer and maintenance

**Epic:** EPIC-13

As a **Super Admin**,  
I want **to configure maintenance mode, disclaimer text, and email templates on A-90**,  
So that **global platform behavior can be updated without deploy**.

## Acceptance Criteria

### AC-1

**Given** maintenance mode shows branded message to Candidates and blocks practice; admin access remains  

**When** disclaimer text changes propagate to all surfaces within 5 minutes  

**Then** email notification templates editable for key events  

**And** settings changes require super-admin role and are audit-logged
