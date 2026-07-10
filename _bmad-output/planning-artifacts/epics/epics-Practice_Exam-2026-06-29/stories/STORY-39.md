---
id: STORY-39
status: ready
prd_refs: ["FR-25"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-39: Subject CRUD with go-live gate

**Epic:** EPIC-9

As a **Platform Admin**,  
I want **to create, update, archive, and reorder Subjects on A-20/A-21**,  
So that **the catalog reflects accurate CNVCK offerings**.

## Acceptance Criteria

### AC-1

**Given** each Subject has name, code, description, display order, visibility status  

**When** archived Subjects hidden from Candidates; existing Subscriptions remain valid until expiry  

**Then** Subject cannot activate until >= 200 Published Questions and one approved Mock Exam Template  

**And** reorder updates display order without breaking existing Subscriptions
