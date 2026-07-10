---
id: STORY-5
story_key: 1-5-scaffold-client-apps
status: review
baseline_commit: NO_VCS
prd_refs: []
ad_refs: ["AD-8", "AD-9"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
  - date: "2026-06-29"
    prd_version_or_updated: "EPIC-1 implementation"
    change_summary: "Client app shells for web, admin, and Zalo mini-app"
    story_delta: "Implemented — status review"
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

## Tasks/Subtasks

- [x] Scaffold `apps/web` — Next.js App Router + TanStack Query + api-client + ui
- [x] Scaffold `apps/admin` — Next.js App Router + TanStack Query + api-client
- [x] Scaffold `apps/zalo-mini-app` — Vite 5 + zmp-vite-plugin + TanStack Router + Query
- [x] Wire `@practice-exam/api-client` health query in each app shell
- [x] Verify `pnpm build` succeeds for web, admin, and zalo-mini-app

## Dev Agent Record

### Implementation Plan
Three client shells per AD-8/AD-9 with TanStack Query on all surfaces and TanStack Router on Zalo only.

### Completion Notes
✅ Web and admin use Next.js 15 App Router with QueryClientProvider.  
✅ Zalo mini-app uses Vite 5, zmp-vite-plugin (inline app config), TanStack Router.  
✅ All three apps import `@practice-exam/api-client` and build without errors.

## File List

- apps/web/**
- apps/admin/**
- apps/zalo-mini-app/**

## Change Log

| Date | Change |
|------|--------|
| 2026-06-29 | Scaffolded client app shells (STORY-5) |

## Status

review
