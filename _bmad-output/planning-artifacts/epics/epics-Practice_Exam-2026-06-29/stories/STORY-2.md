---
id: STORY-2
status: ready
prd_refs: []
ad_refs: ["AD-3", "AD-13"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
---


# STORY-2: Configure Supabase PostgreSQL and Prisma datasource

**Epic:** EPIC-1

As a **platform engineer**,  
I want **Prisma configured against Supabase PostgreSQL with pooler URLs**,  
So that **the API can persist data in the managed Vietnam-region database**.

## Acceptance Criteria

### AC-1

**Given** `.env.example` documents `DATABASE_URL` (pooler :6543) and `DIRECT_URL` (session :5432)  

**When** developer runs `prisma migrate dev`  

**Then** migrations apply via `directUrl`  

**And** runtime NestJS uses transaction pooler connection
