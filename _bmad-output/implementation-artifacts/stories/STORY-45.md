---
id: STORY-45
story_key: 10-45-manual-subscription-grant-revoke
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-32"]
---

# STORY-45: Manual Subscription grant and revoke

**Epic:** EPIC-10

## Tasks/Subtasks

- [x] SubscriptionsService.manualGrant / manualRevoke
- [x] POST grant/revoke endpoints with mandatory audit reason
- [x] Timeline events via AuthAuditLog
- [x] A-62 UI on user profile

### Review Findings

- [x] [Review][Decision] Block grant when user suspended (D2=A) [`subscriptions.service.ts`]
- [x] [Review][Patch] `manualGrant` calls `expireStaleSubscriptions` before check
- [x] [Review][Patch] `manualGrant` wrapped in transaction for concurrent safety

## File List

- apps/api/src/subscriptions/subscriptions.service.ts
- apps/api/src/users/users-admin.service.ts
- apps/api/src/users/users-admin.controller.ts
- apps/admin/src/app/users/[id]/page.tsx

## Status

done
