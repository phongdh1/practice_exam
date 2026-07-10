---
id: STORY-37
status: ready
prd_refs: ["FR-22"]
ad_refs: ["AD-10"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-37: Excel bulk import with async job pipeline

**Epic:** EPIC-8

As a **Content Editor**,  
I want **to bulk-import Questions via Excel on A-33**,  
So that **I can onboard large question banks without manual entry**.

## Acceptance Criteria

### AC-1

**Given** admin uploads .xlsx up to 500 rows per batch  

**When** API enqueues ImportQuestionsJob; success rows create Questions in Draft only  

**Then** ImportBatch report lists row-level errors without silent partial failure  

**And** no synchronous import; Published status cannot be set via import
