---
id: STORY-20
status: ready
prd_refs: ["FR-7"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-20: Subscription expiry notice and manual renewal

**Epic:** EPIC-4

As a **Candidate**,  
I want **in-app notice when my subscription expires within 3 days**,  
So that **I can manually renew before losing access**.

## Acceptance Criteria

### AC-1

**Given** expiring ≤3 days shows amber subscription badge and renewal CTA  

**When** at expiry full Entitlement revoked; Free Tier restored  

**Then** no auto-renew in MVP  

**And** renewal payment extends from previous period end
