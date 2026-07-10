---
id: STORY-57
status: ready
prd_refs: ["FR-44"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-57: Role-based access control enforcement

**Epic:** EPIC-13

As a **Super Admin**,  
I want **to enforce RBAC across admin modules**,  
So that **each role sees only permitted actions**.

## Acceptance Criteria

### AC-1

**Given** roles: super admin, content editor, reviewer, support, finance  

**When** content editors cannot access payment or Zalo configuration  

**Then** finance role cannot publish Questions  

**And** permission matrix documented and viewable on A-92
