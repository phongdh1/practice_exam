---
id: STORY-6
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


# STORY-6: Email registration and password sign-in on web

**Epic:** EPIC-2

As a **Candidate**,  
I want **to register and sign in with email/password on the responsive web app**,  
So that **I can access my account without a social provider**.

## Acceptance Criteria

### AC-1

**Given** unauthenticated user opens W-01/W-02  

**When** submits valid credentials  

**Then** exactly one User and AuthIdentity(email) is created or resolved  

**And** failed auth shows Vietnamese error with retry and no partial session
