---
id: STORY-33
status: ready
prd_refs: ["FR-17", "FR-21"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-33: Question CRUD with lifecycle states

**Epic:** EPIC-8

As a **Content Editor**,  
I want **to create and edit Questions in Draft with stem, options, explanation, tags**,  
So that **I can build the question bank for a Subject**.

## Acceptance Criteria

### AC-1

**Given** lifecycle: Draft → In Review → Published; rejection returns to Draft with comments  

**When** Published edits create new Draft version requiring re-review  

**Then** Questions belong to exactly one Subject  

**And** image attachments supported; duplicate stem warns editor
