---
id: STORY-50
status: ready
prd_refs: ["FR-37"]
ad_refs: ["AD-5"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-50: Provider reconciliation summaries

**Epic:** EPIC-11

As a **Finance Admin**,  
I want **to view reconciliation summaries per provider per day on A-71**,  
So that **I can detect payment discrepancies quickly**.

## Acceptance Criteria

### AC-1

**Given** summary shows transaction count, gross revenue, failed count, and pending count  

**When** discrepancies between provider webhook and internal record are flagged  

**Then** supports payos and sepay providers per AD-5  

**And** date range filter defaults to last 7 days ICT
