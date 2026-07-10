---
id: STORY-4
status: ready
prd_refs: []
ad_refs: ["AD-12"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-4: Create shared UI package with DESIGN.md brand tokens

**Epic:** EPIC-1

As a **frontend developer**,  
I want **`@practice-exam/ui` exporting shadcn components and Tailwind preset**,  
So that **web, admin, and Zalo apps share consistent brand styling**.

## Acceptance Criteria

### AC-1

**Given** Package exports primary `#1B4F72`, success `#0E7C4A`, and typography tokens from DESIGN.md  

**When** web app extends tailwind config from package preset  

**Then** Subject card and answer-option component tokens are available  

**And** Be Vietnam Pro font is configured
