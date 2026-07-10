---
id: STORY-31
status: ready
prd_refs: ["FR-14"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-31: Subject performance summary aggregates

**Epic:** EPIC-7

As a **Candidate**,  
I want **per-Subject stats for questions attempted, correctness rate, and mock scores**,  
So that **I see strengths and gaps over 30/90 days**.

## Acceptance Criteria

### AC-1

**Given** summary updates within 5 minutes of session completion  

**When** 30/90 day toggles on Z-40/W-40  

**Then** Subjects with no attempts show empty card with practice CTA  

**And** aggregates computed server-side
