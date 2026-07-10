---
id: STORY-34
status: ready
prd_refs: ["FR-18"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-34: Editorial review queue and approve/reject

**Epic:** EPIC-8

As a **Reviewer**,  
I want **to review pending Questions on A-40/A-41**,  
So that **only quality content reaches Candidates**.

## Acceptance Criteria

### AC-1

**Given** queue filterable by Subject, author, age  

**When** assign-to-self supported  

**Then** rejection requires non-empty comment  

**And** approval atomically sets Published status
