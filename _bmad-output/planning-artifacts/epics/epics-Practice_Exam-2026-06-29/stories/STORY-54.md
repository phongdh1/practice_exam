---
id: STORY-54
status: ready
prd_refs: ["FR-41"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-54: Zalo Mini App configuration

**Epic:** EPIC-12

As a **Super Admin**,  
I want **to configure Zalo Mini App credentials on A-80**,  
So that **the Mini App can authenticate and deploy correctly**.

## Acceptance Criteria

### AC-1

**Given** configure app ID and secrets with deployment status view  

**When** invalid credentials surface diagnostic error without exposing secrets to Candidates  

**Then** configuration changes require super-admin role  

**And** changes are audit-logged
