---
id: STORY-19
status: ready
prd_refs: ["FR-6"]
ad_refs: ["AD-7", "AD-12"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-19: Candidate checkout and confirmation UI

**Epic:** EPIC-4

As a **Candidate**,  
I want **to complete checkout and see subscription confirmation on Z-24–26 and W-24–26**,  
So that **I know my payment succeeded and when my subscription expires**.

## Acceptance Criteria

### AC-1

**Given** checkout UI shows Subject, price, promo code field  

**When** return from provider polls `GET /payments/:id` until terminal state  

**Then** Z-26/W-26 shows 'Đang hoạt động đến {date}' after PAID  

**And** payment failure shows retry without entitlement change
