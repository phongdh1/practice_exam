---
id: STORY-9
story_key: 2-9-link-auth-identity
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-2"]
ad_refs: ["AD-4"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "EPIC-2 implementation"
    change_summary: "Link AuthIdentity across web and Zalo"
    story_delta: "Implemented — status review"
---

# STORY-9: Link AuthIdentity across web and Zalo

**Epic:** EPIC-2

As a **Candidate**,  
I want **to link Zalo or web identity to my existing account while authenticated**,  
So that **my subscriptions and history sync across channels**.

## Acceptance Criteria

### AC-1

**Given** authenticated user initiates W-51 or Z-51 link flow  
**When** secondary provider OAuth completes  
**Then** Subscription and Attempt History are identical on both channels  
**And** linking same provider to different User is rejected; audit log records link event

## Tasks/Subtasks

- [x] Implement `POST /auth/link/zalo` (JWT-protected) and `GET /auth/link/google`
- [x] Reject linking provider already owned by different User
- [x] Record link events in `AuthAuditLog`
- [x] Build W-51 at `/account/link/zalo`
- [x] Build Z-51 link flow at `/link` in zalo-mini-app
- [x] Add api-client `linkZalo` method

## Dev Agent Record

### Implementation Plan
`AuthService.linkProvider` attaches new identity or triggers merge; audit log on every link; JWT guard on link endpoints.

### Completion Notes
✅ Link endpoints require authentication.  
✅ `AuthAuditLog` records `link` and `link_merge` actions.  
✅ W-51 and Z-51 screens implemented.

## File List

- apps/api/src/auth/auth.service.ts
- apps/api/src/auth/auth.controller.ts
- apps/api/prisma/schema.prisma
- apps/web/src/app/account/link/zalo/page.tsx
- apps/zalo-mini-app/src/main.tsx
- packages/api-client/src/index.ts

## Change Log

| Date | Change |
|------|--------|
| 2026-06-29 | Implemented AuthIdentity linking (STORY-9) |

## Status

review

### Review Findings

- [ ] [Review][Patch] `linkProvider` does not reject suspended users — suspended accounts can link providers and receive fresh tokens [`apps/api/src/auth/auth.service.ts:203`]
- [ ] [Review][Patch] Concurrent register/link/OAuth calls can hit `@@unique` constraint with unhandled P2002 (500 instead of conflict) [`apps/api/src/auth/auth.service.ts`]
- [x] [Review][Defer] Cross-channel Subscription/Attempt History sync not covered by integration tests — deferred, no test infra yet
- [x] [Review][Defer] Link/merge audit log not covered by unit tests — deferred, test gap
