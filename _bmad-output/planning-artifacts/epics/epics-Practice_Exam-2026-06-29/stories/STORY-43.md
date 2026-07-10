---
id: STORY-43
status: ready
prd_refs: ["FR-29", "FR-30"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-43: Exam pool rules and attempt limits

**Epic:** EPIC-9

As a **Platform Admin**,  
I want **to configure difficulty/topic distribution and attempt limits**,  
So that **auto-generated exams are fair and bounded**.

## Acceptance Criteria

### AC-1

**Given** auto-generation fails with clear admin error if pool lacks sufficient Published Questions  

**When** generated exams are previewable on A-52 before release to Candidates  

**Then** default 3 attempts per User per template per calendar month  

**And** Candidates see remaining attempts before starting Mock Exam
