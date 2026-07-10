---
id: STORY-3
status: ready
prd_refs: []
ad_refs: ["AD-2", "AD-3"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-3: Scaffold NestJS API with health check and PrismaService

**Epic:** EPIC-1

As a **platform engineer**,  
I want **a NestJS API skeleton with modular structure and health endpoint**,  
So that **client apps have a REST API to integrate against**.

## Acceptance Criteria

### AC-1

**Given** API exposes `GET /api/v1/health` returning 200  

**When** PrismaService is injectable in modules  

**Then** API envelope follows `{ data, error? }` convention  

**And** no domain logic in Next.js route handlers
