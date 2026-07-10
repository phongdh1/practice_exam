---
id: STORY-9
status: ready
prd_refs: ["FR-2"]
ad_refs: ["AD-4"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-9: Link AuthIdentity across web and Zalo

**Epic:** EPIC-2

As a **Candidate**,  
I want **to link Zalo or web identity to my existing account while authenticated**,  
So that **my subscriptions and history sync across channels**.

## Acceptance Criteria

### AC-1

**Given** authenticated user initiates W-51 or Z-51 link flow  

**When** secondary provider OAuth completes  

**Then** Subscription and Attempt History are identical on both channels  

**And** linking same provider to different User is rejected; audit log records link event
