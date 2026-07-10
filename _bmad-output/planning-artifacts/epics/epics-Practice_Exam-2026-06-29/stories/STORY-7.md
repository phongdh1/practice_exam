---
id: STORY-7
status: ready
prd_refs: ["FR-1"]
ad_refs: ["AD-4"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-7: Google OAuth sign-in on web

**Epic:** EPIC-2

As a **Candidate**,  
I want **to sign in with Google on the responsive web app**,  
So that **I can access my account quickly on web**.

## Acceptance Criteria

### AC-1

**Given** user selects Google on W-01  

**When** OAuth completes successfully  

**Then** User and AuthIdentity(google) are created or resolved  

**And** JWT access (15m) and refresh (7d) tokens are issued
