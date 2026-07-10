---
id: STORY-36
status: ready
prd_refs: ["FR-23", "FR-24"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-36: Question search, filter, and candidate preview

**Epic:** EPIC-8

As a **Admin**,  
I want **to search and filter Questions and preview them as Candidates will see them**,  
So that **I can find and validate content efficiently**.

## Acceptance Criteria

### AC-1

**Given** A-30 search/filter by Subject, status, difficulty, topic, author  

**When** results return within 2 seconds for banks up to 10,000 Questions per Subject  

**Then** preview on A-32 matches Practice Mode rendering including explanation reveal  

**And** filters persist in admin session URL query params
