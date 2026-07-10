---
id: STORY-44
status: ready
prd_refs: ["FR-31"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-44: User search and profile admin view

**Epic:** EPIC-10

As a **Support Admin**,  
I want **to search Users and view profile on A-60/A-61**,  
So that **I can assist Users with account and subscription issues**.

## Acceptance Criteria

### AC-1

**Given** search by email, phone, Zalo ID, or internal User ID  

**When** profile shows AuthIdentities with link dates  

**Then** profile summarizes Subscriptions and Attempt History  

**And** PII access is RBAC-gated and audit-logged
