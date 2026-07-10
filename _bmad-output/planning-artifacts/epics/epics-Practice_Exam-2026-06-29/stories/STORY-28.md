---
id: STORY-28
status: ready
prd_refs: ["FR-12"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-28: Mock exam scoring, results, and question review

**Epic:** EPIC-6

As a **Candidate**,  
I want **to see score, pass/fail, section breakdown, and per-question explanations**,  
So that **I understand my performance and weak areas**.

## Acceptance Criteria

### AC-1

**Given** score calculated against configured passing threshold  

**When** section breakdown matches template Subject weights  

**Then** results persist permanently in Attempt History  

**And** Z-35/W-35 shows explanations for all questions
