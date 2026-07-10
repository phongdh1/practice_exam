---
id: STORY-42
status: ready
prd_refs: ["FR-28"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-42: Mock Exam Template CRUD

**Epic:** EPIC-9

As a **Platform Admin**,  
I want **to create and edit Mock Exam Templates on A-50/A-51**,  
So that **Candidates can take structured exams mirroring CNVCK format**.

## Acceptance Criteria

### AC-1

**Given** template specifies sections with Subject, question count, and time limit  

**When** total duration and passing score threshold are configurable  

**Then** fixed vs randomized Question selection per section is supported  

**And** randomized selection draws only from Published Questions matching Subject and difficulty rules
