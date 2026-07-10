---
id: STORY-1
status: ready
prd_refs: []
ad_refs: ["AD-1"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-1: Initialize monorepo with pnpm workspaces and Turborepo

**Epic:** EPIC-1

As a **platform engineer**,  
I want **a pnpm + Turborepo monorepo with apps and packages folders**,  
So that **the team can build all clients and the API from one repository**.

## Acceptance Criteria

### AC-1

**Given** Monorepo root contains `pnpm-workspace.yaml`, `turbo.json`, and folders `apps/` and `packages/`  

**When** developer runs `pnpm install` at root  

**Then** all workspace packages resolve without errors  

**And** CI can run `turbo build` across apps
