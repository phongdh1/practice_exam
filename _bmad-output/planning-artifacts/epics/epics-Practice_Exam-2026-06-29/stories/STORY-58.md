---
id: STORY-58
status: ready
prd_refs: ["FR-45"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-58: Admin user management

**Epic:** EPIC-13

As a **Super Admin**,  
I want **to create, disable, and assign roles to admin users on A-91**,  
So that **back-office access is controlled and auditable**.

## Acceptance Criteria

### AC-1

**Given** super admin can create admin users with email + password  

**When** disabled admin cannot sign in  

**Then** role assignment changes take effect on next login  

**And** admin login events are audit-logged
