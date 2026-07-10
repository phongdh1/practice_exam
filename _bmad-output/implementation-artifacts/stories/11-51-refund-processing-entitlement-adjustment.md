---
id: STORY-51-EPIC11
story_key: 11-51-refund-processing-entitlement-adjustment
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-38"]
---

# 11-51: Refund processing with entitlement adjustment

**Epic:** EPIC-11

## Tasks/Subtasks

- [x] PaymentRefund model and migration
- [x] POST admin/payments/:id/refund with mandatory audit reason
- [x] Proportional subscription shorten/revoke on refund
- [x] Refund status tracked with mock provider confirmation
- [x] Audit log via AuthAuditLog
- [x] Refund UI modal on A-70 (A-72)

### Review Follow-ups (AI)

- [x] [AI-Review][Patch] H2 - Refund skips entitlement after renewal
- [x] [AI-Review][Patch] D1 - Mock vs real provider refund decision

## Senior Developer Review (AI)

- **Review outcome:** Changes Requested
- **Review date:** 2026-07-01
- **Severity:** 2 High, 6 Medium, 3 Low

### Review Findings

- [x] [Review][Patch] H2 - Refund skips entitlement after renewal
- [x] [Review][Patch] D1 - Mock vs real provider refund decision

### Action Items

- [x] [Review][Patch] H2 - Refund skips entitlement after renewal
- [x] [Review][Patch] D1 - Mock vs real provider refund decision

## Dev Agent Record

### Completion Notes

Refund flow marks payment refunded, adjusts subscription period proportionally, confirms with mock provider ref, logs `admin.payment_refund`.

✅ Resolved review finding [High]: Refund now resolves active subscription by userId+subjectId when payment.subscription is null (post-renewal).
✅ Resolved review finding [Decision]: MVP keeps mock provider refund — documented in code comment; real PayOS/SePay refund API deferred post-MVP.

## File List

- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260701190000_payments_admin/migration.sql
- apps/api/src/payments-admin/**
- apps/api/src/payments-admin/payments-admin.service.spec.ts
- apps/admin/src/app/payments/page.tsx

## Change Log

- 2026-07-01: EPIC-11 story 11-51 — refund processing + entitlement adjustment
- 2026-07-01: Addressed code review findings - 2 items resolved (renewal entitlement, mock refund decision)

## Status

done

## Senior Developer Review (AI) — Re-review Pass 2

- **Review outcome:** Approve
- **Review date:** 2026-07-01
- **Prior findings:** All 11 items verified resolved (H1, H2, M1–M5, L1–L3, D1)
- **New findings:** 0 High, 2 Medium (M7, M8 — non-blocking), 3 Low (L4–L6)
- **Status:** done
