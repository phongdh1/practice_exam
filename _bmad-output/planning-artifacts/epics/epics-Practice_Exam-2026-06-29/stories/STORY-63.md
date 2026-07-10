---
id: STORY-63
status: ready-for-dev
prd_refs: ["FR-22", "FR-8"]
ad_refs: ["AD-10"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-07-02"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Extend import UX and template for Course/Subject picker and 3 question types with Excel dropdowns"
    story_delta: "Created"
---


# STORY-63: Import UX, multi-type questions, and Excel data-sheet dropdowns

**Epic:** EPIC-8

As a **Content Editor**,  
I want **to select Course and Subject on A-33 and import Excel with dropdown-defined question types (Single Choice, Multiple Choice, True/False)**,  
So that **I can bulk-load questions accurately without guessing UUIDs or free-typing enum values**.

## Acceptance Criteria

### AC-1

**Given** A-33 bulk import page  
**When** editor selects Course then Subject  
**Then** Subject list is filtered by Course and upload requires a selected Subject  
**And** raw UUID input is removed

### AC-2

**Given** editor downloads import template  
**When** file opens in Excel  
**Then** sheets `Câu hỏi`, `DanhMuc`, `HuongDan` exist with list validation on question type and difficulty from `DanhMuc`  
**And** three example rows cover all question types

### AC-3

**Given** uploaded workbook  
**When** import parses rows  
**Then** sheet `Câu hỏi` is read by name and labels map to `single_choice`, `multiple_choice`, `true_false`  
**And** type-specific validation matches `QuestionsService.validateOptions` rules  
**And** all created questions remain Draft
