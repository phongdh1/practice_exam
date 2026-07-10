---
id: STORY-38
status: ready
prd_refs: ["FR-9"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-38: Flagged questions admin queue

**Epic:** EPIC-8

As a **Reviewer**,  
I want **to triage candidate-flagged Questions on A-42**,  
So that **I can investigate reported content quality issues**.

## Acceptance Criteria

### AC-1

**Given** queue lists flags with User, Question, optional comment, and timestamp  

**When** reviewer can assign, resolve, or escalate to editorial workflow  

**Then** flagging does not remove Question from candidate circulation in MVP  

**And** resolved flags are audit-logged with actor and resolution note
