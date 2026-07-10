---
id: STORY-11
status: ready
prd_refs: ["FR-4"]
ad_refs: ["AD-3"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-11: Subject catalog API for active Subjects

**Epic:** EPIC-3

As a **Candidate**,  
I want **to retrieve all active Subjects with pricing and Free Tier limits**,  
So that **I can choose which môn to practice**.

## Acceptance Criteria

### AC-1

**Given** API returns only active visible Subjects  

**When** each Subject includes name, description, monthly price VND, Free Tier limit  

**Then** archived Subjects are excluded from candidate responses  

**And** price matches admin configuration
