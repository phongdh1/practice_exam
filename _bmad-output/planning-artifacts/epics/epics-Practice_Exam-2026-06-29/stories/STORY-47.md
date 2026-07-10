---
id: STORY-47
status: ready
prd_refs: ["FR-34"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-47: User data export on request

**Epic:** EPIC-10

As a **Support Admin**,  
I want **to export a User's personal data and Attempt History on A-64**,  
So that **we meet basic GDPR-style compliance requests**.

## Acceptance Criteria

### AC-1

**Given** export available as JSON or CSV download in admin UI  

**When** export includes profile, AuthIdentities, Subscriptions, and Attempt History  

**Then** export action is audit-logged with actor and timestamp  

**And** export excludes other Users' data and admin-only fields
