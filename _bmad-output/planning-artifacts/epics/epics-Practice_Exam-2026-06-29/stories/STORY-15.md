---
id: STORY-15
status: ready
prd_refs: ["FR-6", "FR-7"]
ad_refs: ["AD-3"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-15: Subscription model and entitlement service

**Epic:** EPIC-4

As a **Candidate**,  
I want **my Subscription status and expiry to be tracked server-authoritatively**,  
So that **entitlement is consistent across all linked channels within 1 minute (SM-3)**.

## Acceptance Criteria

### AC-1

**Given** Subscription record links user_id, subject_id, period_start, period_end, channel  

**When** active Subscription grants full Entitlement  

**Then** expired Subscription reverts to Free Tier only  

**And** renewal extends one month from previous period end
