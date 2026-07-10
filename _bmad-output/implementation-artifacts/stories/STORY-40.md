---
id: STORY-40
story_key: 9-40-subject-pricing-free-tier
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-26"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
---

# STORY-40: Subject pricing and Free Tier configuration

**Epic:** EPIC-9

## Acceptance Criteria

### AC-1
**Given** price is integer VND with minimum 10,000 VND floor  
**When** Free Tier limit is admin-configurable per Subject (default 20/month)  
**Then** price changes apply to new purchases only; active Subscriptions retain purchase-time price until renewal  
**And** changes propagate to candidate catalog within minutes

## Tasks/Subtasks

- [x] Enforce MIN_SUBJECT_PRICE_VND (10,000) in Create/Update DTOs and service
- [x] Preserve purchase-time price via Payment.amountVnd at checkout (existing)
- [x] Catalog reads live SubjectPricing (propagates on next request)
- [x] Add unit test for price floor validation

## Dev Agent Record

### Completion Notes
✅ 10,000 VND minimum enforced on create/update.  
✅ Checkout snapshots price in Payment; renewals use current catalog price.  
✅ Candidate catalog reflects pricing changes immediately from DB.

## File List

- apps/api/src/subjects/dto/admin-subject.dto.ts
- apps/api/src/subjects/subject.constants.ts
- apps/api/src/subjects/subjects.service.ts
- apps/api/src/subjects/subjects.service.spec.ts


## Review Approval

Approved by user on 2026-07-01 after re-review. Security fixes and M1 fixed (verdict: approve).

## Status

done
