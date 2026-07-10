---
id: STORY-47
story_key: 10-47-user-data-export
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-34"]
---

# STORY-47: User data export on request

**Epic:** EPIC-10

## Tasks/Subtasks

- [x] GET admin/users/:id/export?format=json|csv
- [x] Export profile, identities, subscriptions, attempt history
- [x] Audit-logged export action
- [x] A-64 download buttons in admin UI

### Review Findings

- [x] [Review][Patch] Export loads full attempt history (no `take: 20`)
- [x] [Review][Patch] Dedicated export query; single `admin.user.export` audit
- [x] [Review][Patch] CSV formula injection neutralized in `csvEscape`

## File List

- apps/api/src/users/users-admin.service.ts
- apps/api/src/users/users-admin.controller.ts
- apps/admin/src/app/users/[id]/page.tsx
- packages/api-client/src/index.ts

## Status

done
