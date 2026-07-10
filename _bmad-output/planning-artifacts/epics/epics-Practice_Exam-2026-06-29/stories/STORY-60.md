---
id: STORY-60
status: ready
prd_refs: []
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-60: Admin dashboard KPIs

**Epic:** EPIC-13

As a **Platform Admin**,  
I want **to view operational KPIs on A-10 dashboard**,  
So that **I can monitor subscriptions, revenue, and content pipeline health**.

## Acceptance Criteria

### AC-1

**Given** dashboard shows active subscription count per Subject  

**When** revenue snapshot for current month (confirmed payments only)  

**Then** content queue depth: editorial pending and flagged questions  

**And** KPIs refresh within 5 minutes; role-gated per RBAC
