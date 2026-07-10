---
id: STORY-21
status: ready
prd_refs: ["FR-8"]
ad_refs: ["AD-11"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-21: Practice session API with server-side question selection

**Epic:** EPIC-5

As a **Candidate**,  
I want **to start a Practice Mode session for a Subject**,  
So that **I practice only entitled Published questions**.

## Acceptance Criteria

### AC-1

**Given** PracticeService serves only Published Questions for Subject  

**When** supports single choice, multiple choice, true/false  

**Then** Free Tier counter increments atomically when applicable  

**And** in-progress session persisted with 24h resume TTL
