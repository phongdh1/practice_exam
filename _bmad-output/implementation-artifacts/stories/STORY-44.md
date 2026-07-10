---
id: STORY-44
story_key: 10-44-user-search-profile-admin
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-31"]
---

# STORY-44: User search and profile admin view

**Epic:** EPIC-10

## Tasks/Subtasks

- [x] GET admin/users/search by email, phone, Zalo ID, User ID
- [x] GET admin/users/:id profile with identities, subscriptions, attempts, timeline
- [x] RBAC guard (support, super_admin) and audit log on PII access
- [x] Admin UI A-60 search + A-61 profile page

### Review Findings

- [x] [Review][Decision] Phone search via externalId — UI copy updated (D1=A)
- [x] [Review][Patch] Search returns PII without audit log [`users-admin.service.ts`]
- [x] [Review][Patch] Pass `AdminAuthPayload` into `searchUsers` [`users-admin.controller.ts`]

## File List

- apps/api/src/users/**
- apps/api/src/admin-auth/decorators/roles.decorator.ts
- apps/api/src/admin-auth/guards/admin-roles.guard.ts
- apps/admin/src/app/users/page.tsx
- apps/admin/src/app/users/[id]/page.tsx
- packages/types/src/index.ts
- packages/api-client/src/index.ts

## Status

done
