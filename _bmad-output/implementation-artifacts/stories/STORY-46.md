---
id: STORY-46
story_key: 10-46-account-merge-override
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-33"]
---

# STORY-46: Account merge override for support

**Epic:** EPIC-10

## Tasks/Subtasks

- [x] Extend UserMergeService for mock exams, payments, flags
- [x] GET merge/preview + POST merge with ticket reference
- [x] Audit log with both user IDs and survivor
- [x] A-63 merge UI with preview before confirm

### Review Findings

- [x] [Review][Patch] `freeTierUsage` merge collision handled via sum/delete [`user-merge.service.ts`]
- [x] [Review][Patch] Non-active subscriptions reassigned before delete
- [x] [Review][Patch] `authAuditLog` rows reassigned to survivor
- [x] [Review][Patch] Merge + audit in single transaction
- [x] [Review][Patch] Suspended duplicate propagates `isSuspended` to survivor
- [x] [Review][Patch] `previewMerge` audit logged
- [x] [Review][Patch] A-63 preview UI shows mock exam count
- [x] [Review][Defer] Support role can force-delete via merge — by design for MVP

## File List

- apps/api/src/auth/user-merge.service.ts
- apps/api/src/users/users-admin.service.ts
- apps/admin/src/app/users/[id]/page.tsx

## Status

done
