---
id: STORY-8
status: ready
prd_refs: ["FR-1"]
ad_refs: ["AD-4", "AD-9"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-8: Zalo OAuth primary sign-in on Mini App

**Epic:** EPIC-2

As a **Candidate**,  
I want **to sign in via Zalo OAuth when opening the Mini App**,  
So that **I can start practicing inside Zalo without a separate registration**.

## Acceptance Criteria

### AC-1

**Given** user opens Z-01 on Mini App launch  

**When** Zalo OAuth succeeds via `zmp-sdk` token exchange to `POST /auth/zalo`  

**Then** User and AuthIdentity(zalo) are created  

**And** OAuth failure shows Z-91 with retry and no catalog access
