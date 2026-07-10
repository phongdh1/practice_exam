---
id: STORY-48
story_key: 10-48-account-suspension
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-35"]
---

# STORY-48: Account suspension

**Epic:** EPIC-10

## Tasks/Subtasks

- [x] POST suspend/unsuspend with audit reason
- [x] Frozen entitlements via isUserSuspended check (subs not cancelled)
- [x] Block practice and mock exam start for suspended users
- [x] A-65 suspend/unsuspend UI (unsuspend super_admin only)

### Review Findings

- [x] [Review][Patch] JWT strategy re-checks `isSuspended` on every request
- [x] [Review][Patch] Suspension guards on practice session mutations
- [x] [Review][Patch] Suspension guards on mock exam mutations
- [x] [Review][Patch] A-65 unsuspend hidden unless `super_admin` role
- [x] [Review][Patch] Checkout blocked for suspended users
- [x] [Review][Defer] `manualRevoke` on non-active rows — low impact

## File List

- apps/api/src/subscriptions/subscriptions.service.ts
- apps/api/src/practice/practice.service.ts
- apps/api/src/mock-exams/mock-exam-attempts.service.ts
- apps/api/src/auth/strategies/jwt.strategy.ts
- apps/api/src/payments/checkout.service.ts
- apps/api/src/users/users-admin.service.ts
- apps/admin/src/app/users/[id]/page.tsx
- apps/admin/src/lib/admin-role.ts

## Status

done
