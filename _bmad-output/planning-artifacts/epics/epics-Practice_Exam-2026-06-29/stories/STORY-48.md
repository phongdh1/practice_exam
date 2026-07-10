---
id: STORY-48
status: ready
prd_refs: ["FR-35"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-48: Account suspension

**Epic:** EPIC-10

As a **Admin**,  
I want **to suspend a User account on A-65**,  
So that **abuse or policy violations can be blocked immediately**.

## Acceptance Criteria

### AC-1

**Given** suspended User sees generic account-disabled message on sign-in  

**When** active Subscriptions are frozen, not cancelled; no refund automation in MVP  

**Then** suspension is reversible by super admin with audit reason  

**And** suspended Users cannot start practice or Mock Exams
