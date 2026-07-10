---
id: STORY-15
story_key: 4-15-subscription-model-entitlement-service
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-6", "FR-7"]
ad_refs: ["AD-3"]
prd_version: prd-Practice_Exam-2026-06-29
---

# STORY-15: Subscription model and entitlement service

**Epic:** EPIC-4

## Acceptance Criteria

### AC-1
**Given** Subscription record links user_id, subject_id, period_start, period_end, channel  
**When** active Subscription grants full Entitlement  
**Then** expired Subscription reverts to Free Tier only  
**And** renewal extends one month from previous period end

## Tasks/Subtasks

- [x] Add SubscriptionsService with activate/renew, expiry, and display status (active/expiring/expired)
- [x] Expose GET /api/v1/subscriptions and GET /api/v1/subscriptions/:subjectId
- [x] Integrate SubscriptionsService with EntitlementsService for authoritative subscription checks
- [x] Add unit tests for renewal and expiring status

## Dev Agent Record

### Completion Notes
✅ SubscriptionsService tracks period_start/period_end/channel and expires stale rows on read.  
✅ Renewal extends one month from previous period_end.  
✅ Entitlements delegate subscription checks to SubscriptionsService.

## File List

- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260630140000_subscriptions_payments/**
- apps/api/src/subscriptions/**
- apps/api/src/entitlements/entitlements.service.ts
- packages/types/src/index.ts
- packages/api-client/src/index.ts

## Change Log

| Date | Change |
|------|--------|
| 2026-06-30 | Implemented subscription model and entitlement service (STORY-15) |

## Status

review
