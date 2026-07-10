---
id: STORY-26
status: ready
prd_refs: ["FR-11"]
ad_refs: ["AD-11"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-26: Timed mock exam execution with section rules

**Epic:** EPIC-6

As a **Candidate**,  
I want **to complete a Mock Exam within time limits section by section**,  
So that **the experience mirrors official exam pacing**.

## Acceptance Criteria

### AC-1

**Given** timer counts down; auto-submit on expiry  

**When** forward-only within section; no back to prior section during timed attempt  

**Then** answers saved incrementally on connection loss  

**And** bottom tabs hidden during active exam [UX-A8]
