---
id: STORY-10
status: ready
prd_refs: ["FR-3"]
ad_refs: ["AD-4"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-10: Merge Users on account link with FR-3 rules

**Epic:** EPIC-2

As a **Candidate**,  
I want **the system to merge two existing accounts when I link providers**,  
So that **I keep all progress and avoid duplicate subscriptions**.

## Acceptance Criteria

### AC-1

**Given** linking would merge two User records  

**When** merge executes server-side  

**Then** all Attempt History from both Users is retained under survivor  

**And** duplicate active Subscription for same Subject retains longer period; W-52/Z merge summary shown
