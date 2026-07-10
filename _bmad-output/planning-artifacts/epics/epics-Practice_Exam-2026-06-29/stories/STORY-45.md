---
id: STORY-45
status: ready
prd_refs: ["FR-32"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-45: Manual Subscription grant and revoke

**Epic:** EPIC-10

As a **Support Admin**,  
I want **to manually grant or revoke a Subscription on A-62**,  
So that **I can resolve billing exceptions with audit trail**.

## Acceptance Criteria

### AC-1

**Given** manual grant creates Entitlement immediately on all channels  

**When** revoke removes Entitlement immediately  

**Then** action requires mandatory audit reason  

**And** grant/revoke events appear in user profile timeline
