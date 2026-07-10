---
id: STORY-25
status: ready
prd_refs: ["FR-10", "FR-30"]
ad_refs: ["AD-11"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-25: Mock exam listing and attempt limit enforcement

**Epic:** EPIC-6

As a **Candidate**,  
I want **to see available Mock Exams and remaining attempts**,  
So that **I know if I can start an exam before committing time**.

## Acceptance Criteria

### AC-1

**Given** Free Tier users cannot start Mock Exams  

**When** list shows duration, question count, Subjects covered  

**Then** default 3 attempts per User per template per calendar month  

**And** exhausted attempts show disabled card with message
