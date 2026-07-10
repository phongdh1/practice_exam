---
id: STORY-5
status: ready
prd_refs: []
ad_refs: ["AD-8", "AD-9"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-5: Scaffold client app shells (web, admin, Zalo Mini App)

**Epic:** EPIC-1

As a **frontend developer**,  
I want **Next.js web and admin apps plus Vite Zalo mini-app with TanStack Query**,  
So that **each surface can call the API and render branded UI**.

## Acceptance Criteria

### AC-1

**Given** web and admin use Next.js App Router with TanStack Query configured  

**When** zalo-mini-app uses Vite 5, zmp-vite-plugin, and TanStack Router  

**Then** each app imports `@practice-exam/api-client`  

**And** local dev starts without build errors
