---
id: STORY-46
status: ready
prd_refs: ["FR-33"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-46: Account merge override for support

**Epic:** EPIC-10

As a **Support Admin**,  
I want **to force-merge two User accounts on A-63**,  
So that **I can resolve duplicate accounts per FR-3 rules**.

## Acceptance Criteria

### AC-1

**Given** force-merge applies same rules as FR-3 (merge-all-progress, dedupe Subscriptions)  

**When** mandatory support ticket reference required  

**Then** audit log records both User IDs and resulting survivor  

**And** merge summary shown to admin before confirmation
