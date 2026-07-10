---
id: STORY-52-EPIC11
story_key: 11-52-revenue-reports-subject-channel
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-39"]
---

# 11-52: Revenue reports by Subject and channel

**Epic:** EPIC-11

## Tasks/Subtasks

- [x] GET admin/payments/revenue with date range (paid only)
- [x] Breakdown by subject and channel (web/zalo)
- [x] Revenue at payment confirmation (paidAt)
- [x] CSV export endpoint
- [x] Admin UI A-73

### Review Follow-ups (AI)

- [x] [AI-Review][Patch] M2 - No date filters in revenue UI
- [x] [AI-Review][Patch] M5 - Refunds not netted from revenue
- [x] [AI-Review][Patch] L3 - createdAt vs paidAt alignment

## Senior Developer Review (AI)

- **Review outcome:** Changes Requested
- **Review date:** 2026-07-01
- **Severity:** 2 High, 6 Medium, 3 Low

### Review Findings

- [x] [Review][Patch] M2 - No date filters in revenue UI
- [x] [Review][Patch] M5 - Refunds not netted from revenue
- [x] [Review][Patch] L3 - createdAt vs paidAt alignment

### Action Items

- [x] [Review][Patch] M2 - No date filters in revenue UI
- [x] [Review][Patch] M5 - Refunds not netted from revenue
- [x] [Review][Patch] L3 - createdAt vs paidAt alignment

## Dev Agent Record

### Completion Notes

Revenue report excludes pending/failed; CSV export via `/payments/revenue/export`; A-73 at `/payments/revenue`.

✅ Resolved review finding [Medium]: Added from/to date filters to A-73 revenue UI and CSV export.
✅ Resolved review finding [Medium]: Revenue report now nets confirmed refunds in date range from totals and breakdowns.
✅ Resolved review finding [Low]: Reconciliation buckets paid payments by paidAt (aligned with revenue report).

## File List

- apps/api/src/payments-admin/payments-admin.service.ts
- apps/api/src/payments-admin/payments-admin.service.spec.ts
- apps/api/src/payments-admin/payments-admin.controller.ts
- packages/api-client/src/index.ts
- apps/admin/src/app/payments/revenue/page.tsx

## Change Log

- 2026-07-01: EPIC-11 story 11-52 — revenue reports + CSV export + A-73 UI
- 2026-07-01: Addressed code review findings - 3 items resolved (date UI, net refunds, paidAt alignment)

## Status

done

## Senior Developer Review (AI) — Re-review Pass 2

- **Review outcome:** Approve
- **Review date:** 2026-07-01
- **Prior findings:** All 11 items verified resolved (H1, H2, M1–M5, L1–L3, D1)
- **New findings:** 0 High, 2 Medium (M7, M8 — non-blocking), 3 Low (L4–L6)
- **Status:** done
