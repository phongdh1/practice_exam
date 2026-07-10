---
id: STORY-41
status: ready
prd_refs: ["FR-27"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-41: Exam blueprint metadata and topic weighting

**Epic:** EPIC-9

As a **Platform Admin**,  
I want **to map Subject metadata to CNVCK exam weighting on A-22**,  
So that **Mock Exams and analytics reflect official section mix**.

## Acceptance Criteria

### AC-1

**Given** admin configures topic tags and section weight percentages per Subject  

**When** weight percentages per Mock Exam Template sum to 100%  

**Then** metadata drives Mock Exam section breakdown and Progress Analytics  

**And** invalid weight totals block save with clear validation error
