---
id: STORY-14
status: ready
prd_refs: ["FR-15", "FR-16"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-14: Platform disclaimer and prohibited claims guardrails

**Epic:** EPIC-3

As a **Candidate**,  
I want **to see UBCKNN non-affiliation disclaimer and trust that marketing copy is compliant**,  
So that **I understand this is not an official exam product**.

## Acceptance Criteria

### AC-1

**Given** first visit requires Z-02/W-03 disclaimer acknowledgment  

**When** persistent footer disclaimer is always accessible  

**Then** disclaimer text is loaded from system settings CMS field  

**And** Question/Subject text is blocked or flagged for prohibited phrases
