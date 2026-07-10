---
id: STORY-35
status: ready
prd_refs: ["FR-19", "FR-20"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-35: Emergency unpublish and source attribution

**Epic:** EPIC-8

As a **Reviewer**,  
I want **to unpublish a Question immediately and record source references**,  
So that **we can respond to copyright or accuracy issues quickly**.

## Acceptance Criteria

### AC-1

**Given** unpublish removes Question from candidate pools; status Archived  

**When** unpublish audit-logged with actor and reason  

**Then** source_ref stored and visible to admins only  

**And** candidate surfaces exclude unpublished Questions
