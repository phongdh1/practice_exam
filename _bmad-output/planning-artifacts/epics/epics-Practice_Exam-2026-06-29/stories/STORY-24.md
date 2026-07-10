---
id: STORY-24
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


# STORY-24: Flag potentially incorrect questions

**Epic:** EPIC-5

As a **Candidate**,  
I want **to flag a Question from practice or mock review**,  
So that **editors can investigate content quality issues**.

## Acceptance Criteria

### AC-1

**Given** 'Báo cáo câu hỏi' action available post-reveal  

**When** flag creates admin queue entry with User, Question, optional comment  

**Then** flagging does not remove Question from circulation in MVP  

**And** toast confirms 'Đã gửi báo cáo'
