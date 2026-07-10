---
id: STORY-72
story_key: 13-72-admin-table-ux-standardization
status: done
baseline_commit: NO_VCS
epic: EPIC-13
---

# STORY-72: Admin data table standardization (padding + icon actions)

**Epic:** EPIC-13

As an **Admin user**,  
I want **consistent table padding and icon-only row actions with tooltips**,  
So that **list pages feel cohesive and scannable**.

## Acceptance Criteria

- **AC-1:** shadcn `table` + `tooltip` in `@practice-exam/ui`
- **AC-2:** `AdminDataTable`, `AdminIconAction` (lucide, tooltip, aria-label)
- **AC-3:** Standard cell padding `px-4 py-3`
- **AC-4:** Major admin list pages migrated; row actions icon-only

## Tasks

- [x] Table + Tooltip primitives
- [x] AdminDataTable, AdminIconAction, AdminTableActions
- [x] TooltipProvider in admin shell
- [x] Migrate: dashboard, subjects, courses, questions, payments, users, promo-codes, reconciliation, revenue, rbac, admin-users
- [x] Spec: `spec-admin-table-icon-actions.md`

## Deferred pages

- `integrations/webhooks`, `questions/import`, `flags`, `review` (non-table or expand-row UX)

### Review Findings

- [x] [Review][Defer] Deferred pages (`webhooks`, `import`, `flags`, `review`) intentionally out of scope per story — deferred, documented in story
- [x] [Review][Defer] Disabled `AdminIconAction` buttons may not show tooltips (Radix disabled-trigger pattern) [`packages/ui/src/components/admin-icon-action.tsx:48-58`] — deferred, a11y polish
- [x] [Review][Defer] No automated tests for `AdminDataTable` / `AdminIconAction` primitives — deferred, visual component smoke coverage acceptable for MVP
