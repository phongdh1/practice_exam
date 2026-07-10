---
id: STORY-52
status: ready
prd_refs: ["FR-39"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-52: Revenue reports by Subject and channel

**Epic:** EPIC-11

As a **Finance Admin**,  
I want **to view revenue reports on A-73**,  
So that **I can analyze business performance over time**.

## Acceptance Criteria

### AC-1

**Given** report supports date range filter and CSV export  

**When** revenue attributed at payment confirmation timestamp  

**Then** breakdown by Subject and by channel (web vs Zalo)  

**And** excludes pending and failed payments from revenue totals
