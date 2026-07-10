---
id: STORY-53-EPIC11
story_key: 11-53-promo-code-management
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-40"]
---

# 11-53: Promo code management

**Epic:** EPIC-11

## Tasks/Subtasks

- [x] PromoCode model with expiry, usage limit, subject scope
- [x] CRUD admin/promo-codes endpoints
- [x] Percentage and fixed discount validation at checkout
- [x] Usage count increment on paid webhook
- [x] Expired/exhausted codes rejected at checkout
- [x] Admin UI A-74

### Review Follow-ups (AI)

- [x] [AI-Review][Patch] H1 - Promo usage-limit race at checkout
- [x] [AI-Review][Patch] M3 - Subject scope not in promo create UI
- [x] [AI-Review][Patch] L1 - usageCount not decremented on refund

## Senior Developer Review (AI)

- **Review outcome:** Changes Requested
- **Review date:** 2026-07-01
- **Severity:** 2 High, 6 Medium, 3 Low

### Review Findings

- [x] [Review][Patch] H1 - Promo usage-limit race at checkout
- [x] [Review][Patch] M3 - Subject scope not in promo create UI
- [x] [Review][Patch] L1 - usageCount not decremented on refund

### Action Items

- [x] [Review][Patch] H1 - Promo usage-limit race at checkout
- [x] [Review][Patch] M3 - Subject scope not in promo create UI
- [x] [Review][Patch] L1 - usageCount not decremented on refund

## Dev Agent Record

### Completion Notes

Promo codes integrated into checkout discount flow; A-74 at `/payments/promo-codes` with create/toggle.

✅ Resolved review finding [High]: Atomic promo usage reservation at checkout via optimistic locking (updateMany where usageCount matches).
✅ Resolved review finding [Medium]: Subject multi-select added to promo create form on A-74.
✅ Resolved review finding [Low]: usageCount decremented on refund and on failed/cancelled webhook rollback.

## File List

- apps/api/prisma/schema.prisma
- apps/api/src/payments-admin/**
- apps/api/src/payments/checkout.service.ts
- apps/api/src/payments/checkout.service.spec.ts
- apps/api/src/payments/webhooks.service.ts
- apps/admin/src/app/payments/promo-codes/page.tsx

## Change Log

- 2026-07-01: EPIC-11 story 11-53 — promo code management + checkout integration
- 2026-07-01: Addressed code review findings - 3 items resolved (atomic reservation, subject UI, refund decrement)

## Status

done

## Senior Developer Review (AI) — Re-review Pass 2

- **Review outcome:** Approve
- **Review date:** 2026-07-01
- **Prior findings:** All 11 items verified resolved (H1, H2, M1–M5, L1–L3, D1)
- **New findings:** 0 High, 2 Medium (M7, M8 — non-blocking), 3 Low (L4–L6)
- **Status:** done
