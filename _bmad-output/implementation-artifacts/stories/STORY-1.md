---
id: STORY-1
story_key: 1-1-initialize-monorepo
status: review
baseline_commit: NO_VCS
prd_refs: []
ad_refs: ["AD-1"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
  - date: "2026-06-29"
    prd_version_or_updated: "EPIC-1 implementation"
    change_summary: "Monorepo scaffolded with pnpm workspaces and Turborepo"
    story_delta: "Implemented — status review"
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

## Tasks/Subtasks

- [x] Create root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`
- [x] Scaffold `apps/` (api, web, admin, zalo-mini-app) and `packages/` (config, types, utils, api-client, ui)
- [x] Verify `pnpm install` resolves all workspace packages
- [x] Verify `pnpm build` (turbo build) succeeds across apps

## Dev Agent Record

### Implementation Plan
Established pnpm + Turborepo monorepo per AD-1 with shared packages and four apps.

### Completion Notes
✅ Monorepo root configured with pnpm workspaces covering `apps/*` and `packages/*`.  
✅ `pnpm install` and `pnpm build` pass for all 9 workspace packages.

## File List

- package.json
- pnpm-workspace.yaml
- turbo.json
- tsconfig.json
- .gitignore
- packages/config/**
- packages/types/**
- packages/utils/**
- packages/api-client/**
- packages/ui/**

## Change Log

| Date | Change |
|------|--------|
| 2026-06-29 | Implemented monorepo foundation (STORY-1) |

## Status

review

### Review Findings

- [x] [Review][Defer] No git repository initialized (`baseline_commit: NO_VCS`) — deferred, known project state
