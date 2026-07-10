---
id: STORY-64
story_key: 8-41-question-bulk-actions-a30
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-17", "FR-18", "FR-23"]
ad_refs: []
prd_version: prd-Practice_Exam-2026-06-29
epic: EPIC-8
---

# Story 8.41: Bulk actions on the Question Bank (A-30)

Status: done

## Story

As a **Content Editor / Reviewer**,
I want **to select multiple questions in the A-30 list with checkboxes and run bulk "Gửi duyệt" (submit for review) and "Duyệt tất cả" (approve all)**,
so that **I can move many questions through the editorial lifecycle without opening each one individually**.

## Acceptance Criteria

### AC-1: Per-row and select-all checkboxes
**Given** an editor/reviewer on `/questions`
**When** the results table renders
**Then** each row has a selection checkbox
**And** the table header has a "select all on this page" checkbox
**And** the header checkbox reflects an indeterminate state when only some rows are selected
**And** changing filters or page clears the current selection.

### AC-2: Selection toolbar with eligible counts
**Given** at least one row is selected
**When** the selection is non-empty
**Then** a toolbar shows "Đã chọn N câu"
**And** it exposes a **Gửi duyệt** button and a **Duyệt tất cả** button
**And** **Gửi duyệt** is enabled only when ≥1 selected row has status `draft`
**And** **Duyệt tất cả** is enabled only when ≥1 selected row has status `in_review`
**And** a "Bỏ chọn" (clear selection) control is available.

### AC-3: Bulk "Gửi duyệt" (submit for review)
**Given** a selection containing `draft` questions
**When** the editor clicks **Gửi duyệt** and confirms
**Then** only rows with status `draft` are submitted via `adminSubmitQuestionForReview`
**And** rows with other statuses in the selection are skipped (not errored)
**And** each call runs independently so one failure does not abort the rest
**And** on completion a summary reports success and failure counts
**And** the questions list is refetched and selection is cleared.

### AC-4: Bulk "Duyệt tất cả" (approve all)
**Given** a selection containing `in_review` questions
**When** the reviewer clicks **Duyệt tất cả** and confirms
**Then** only rows with status `in_review` are approved
**And** each question is assigned-to-self first (via `adminAssignReview`) then approved (via `adminApproveQuestion`) to match the A-41 single-approve flow
**And** an already-assigned-to-another-reviewer question fails gracefully and is counted as a failure (not a crash)
**And** each call runs independently (partial success allowed)
**And** on completion a summary reports success and failure counts
**And** the questions list is refetched and selection is cleared.

### AC-5: RBAC alignment
**Given** the current admin role
**Then** **Gửi duyệt** is only actionable for `editor` and `super_admin`
**And** **Duyệt tất cả** is only actionable for `reviewer` and `super_admin`
**And** buttons the role cannot use are hidden or disabled (client-side gating; the API already enforces `@Roles`).

### AC-6: Confirmation and result feedback
**Given** a bulk action is triggered
**When** the user clicks the action
**Then** a confirmation prompt states how many eligible questions will be affected
**And** while running, the action buttons are disabled with an in-progress label
**And** after completion, an inline result message shows "Thành công: X · Thất bại: Y".

## Tasks/Subtasks

- [x] **Task 1: Selection state + checkboxes on A-30** (AC: #1, #2)
  - [x] Add `selectedIds` state (Set) to `QuestionBankContent` in `apps/admin/src/app/questions/page.tsx`
  - [x] Add a header checkbox column (select all on current page, indeterminate when partial)
  - [x] Add a per-row checkbox as the first column; keep existing "Sửa"/"Xem trước" actions
  - [x] Clear selection whenever `filters`/page changes (derive from search params)
- [x] **Task 2: Selection toolbar + eligibility** (AC: #2, #5, #6)
  - [x] Compute selected rows and derive `draftCount` and `inReviewCount`
  - [x] Render a toolbar (visible when selection non-empty) with "Đã chọn N câu", **Gửi duyệt**, **Duyệt tất cả**, **Bỏ chọn**
  - [x] Read current admin role (`useAdminRole`) to gate buttons; enable per AC-5
  - [x] Disable buttons while a bulk op is running; show progress label
- [x] **Task 3: Bulk submit-for-review handler** (AC: #3)
  - [x] Implement a client bulk runner that maps eligible `draft` ids and calls `adminSubmitQuestionForReview` with `Promise.allSettled`
  - [x] Aggregate `{ success, failed }` counts; keep failures non-fatal
  - [x] On settle: invalidate `["questions"]` queries and clear selection
- [x] **Task 4: Bulk approve handler** (AC: #4)
  - [x] For each eligible `in_review` id: `adminAssignReview` then `adminApproveQuestion` (no comment)
  - [x] Use `Promise.allSettled`; aggregate `{ success, failed }`; keep failures non-fatal
  - [x] On settle: invalidate `["questions"]` queries and clear selection
- [x] **Task 5: Confirmation + result message** (AC: #6)
  - [x] Add a lightweight confirm (window.confirm, message states eligible count)
  - [x] Render inline result "Thành công: X · Thất bại: Y" after completion
- [x] **Task 6: Extract bulk helpers + unit tests** (AC: #3, #4)
  - [x] Add pure helpers to `packages/api-client/src/question-bulk.ts`: `partitionByStatus(rows)` → `{ draftIds, inReviewIds }`, and `summarizeSettled(results)` → `{ success, failed }`
  - [x] Re-export both from `packages/api-client/src/index.ts`
  - [x] Add Vitest unit tests `packages/api-client/src/question-bulk.test.ts` (7 tests)
  - [x] Run `pnpm --filter @practice-exam/api-client test` (10 passed) and `build` (ok)

### Review Findings

- [x] [Review][Patch] Disable row/header checkboxes while bulk action is running [`apps/admin/src/app/questions/page.tsx`:352-357,308-317] — added `disabled={bulkRunning}` on header and row checkboxes.
- [x] [Review][Patch] Invalidate editorial review-queue cache after bulk approve [`apps/admin/src/app/questions/page.tsx`:121-127] — `afterBulk(summary, true)` invalidates `["editorial", "queue"]` after bulk approve.
- [x] [Review][Defer] Unbounded parallel bulk API requests [`apps/admin/src/app/questions/page.tsx`:132-147] — deferred, MVP per story Dev Notes (client-side `Promise.allSettled` over single-item endpoints); add server-side bulk or client concurrency cap when question bank scale grows.

## Dev Notes

### Existing API (no backend changes required)
- Submit for review (single): `POST /api/v1/admin/questions/:id/submit-for-review` → client `adminSubmitQuestionForReview(id)`; guard `@Roles("super_admin","editor")`; server rejects non-`draft` with `INVALID_STATUS_TRANSITION`.
- Assign to self: `POST /api/v1/admin/content/review-queue/:id/assign` → client `adminAssignReview(id)`; guard `@Roles("super_admin","reviewer")`; rejects `ALREADY_ASSIGNED` if assigned to another reviewer.
- Approve (atomic publish): `POST /api/v1/admin/content/review-queue/:id/approve` → client `adminApproveQuestion(id, comment?)`; guard `@Roles("super_admin","reviewer")`.
- Approve requires the question to be `in_review` and assigned; the A-41 detail flow assigns-to-self first, then approves. Mirror that ordering in the bulk approve runner.

**Decision (MVP):** Do the bulk fan-out client-side with `Promise.allSettled` over the existing single-item endpoints. Do NOT add new bulk API endpoints in this story (keeps scope to A-30 UI). This matches the UX contract note "bulk select" for admin tables and avoids new server surface.

### Files to touch
- `apps/admin/src/app/questions/page.tsx` — checkboxes, toolbar, handlers (primary)
- `packages/api-client/src/question-bulk.ts` — NEW pure helpers (partition + summarize)
- `packages/api-client/src/question-bulk.test.ts` — NEW unit tests
- `packages/api-client/src/index.ts` — re-export helpers

**Note:** the admin app has no test runner; `packages/api-client` already has Vitest (`test: vitest run`). Put the testable pure helpers there and import them into the admin page. Role gating uses `useAdminRole()` from `apps/admin/src/lib/admin-role.ts` (client-side hint only).

### Patterns to reuse
- Query invalidation: existing pages invalidate `["questions"]` (see `apps/admin/src/app/questions/[id]/edit/page.tsx`).
- Role gate: `AdminRoleGate` already wraps the page with `["editor","reviewer","super_admin"]`. For per-button gating, read the same role the gate uses (inspect `apps/admin/src/components/admin-role-gate.tsx` for the role source; reuse it rather than inventing a new one).
- Status labels/`STATUS_LABELS` already defined at top of `page.tsx`.
- `useMutation` from `@tanstack/react-query` for the bulk runners.

### Constraints
- Selection is **current page only** (server-side pagination); document this in the toolbar copy if space allows. Do NOT attempt cross-page "select all matching filter" in this story.
- Keep failures non-fatal: a single `INVALID_STATUS_TRANSITION` or `ALREADY_ASSIGNED` must not abort the batch.
- Vietnamese UI copy consistent with the rest of admin (e.g. "Gửi duyệt", "Duyệt tất cả", "Đã chọn N câu", "Bỏ chọn").

### Testing
- Unit test the pure helpers only (partition + summarize) in `packages/api-client`. No new e2e required.
- Run: `pnpm --filter @practice-exam/api-client test`, `pnpm --filter @practice-exam/api-client build`, and `pnpm --filter admin exec tsc --noEmit`.

## Dev Agent Record

### Debug Log
- `pnpm --filter @practice-exam/api-client test` → 10 passed (7 new in `question-bulk.test.ts`).
- `pnpm --filter @practice-exam/api-client build` → ok (helpers emitted to dist for admin import).
- `pnpm --filter admin exec tsc --noEmit` → passed.
- `pnpm --filter @practice-exam/api-client lint` → fails with pre-existing "ESLint couldn't find eslint.config.js" (package-level config gap, not introduced by this story; affects all files in the package).

### Completion Notes
- Bulk fan-out is client-side over existing single-item endpoints via `Promise.allSettled` (no new API surface), per the MVP decision in Dev Notes.
- Eligibility split by status using `partitionByStatus`: **Gửi duyệt** acts on `draft` only; **Duyệt tất cả** acts on `in_review` only. Other statuses in the selection are silently skipped.
- Bulk approve mirrors the A-41 flow: `adminAssignReview(id)` then `adminApproveQuestion(id)` per item; `ALREADY_ASSIGNED`/`INVALID_STATUS_TRANSITION` are counted as failures without aborting the batch.
- RBAC gating on buttons via `useAdminRole()` (client hint; API `@Roles` still authoritative): submit → editor/super_admin, approve → reviewer/super_admin.
- Selection is current-page only; toolbar copy states "(trang này)". Selection + result clear on any filter/page change.
- Header checkbox supports indeterminate state; selected rows get a subtle `bg-primary/5` highlight.

### File List
- `apps/admin/src/app/questions/page.tsx` (modified) — checkboxes, selection toolbar, bulk submit/approve handlers, result message.
- `packages/api-client/src/question-bulk.ts` (new) — `partitionByStatus`, `summarizeSettled` pure helpers + types.
- `packages/api-client/src/question-bulk.test.ts` (new) — 7 unit tests.
- `packages/api-client/src/index.ts` (modified) — re-export bulk helpers/types.

### Change Log
- 2026-07-02: Implemented A-30 bulk actions (checkbox select, select-all, Gửi duyệt, Duyệt tất cả) with partial-success reporting; added tested pure helpers in api-client.

- 2026-07-02: Code review — 2 patches applied (disable checkboxes during bulk run; invalidate editorial queue after bulk approve).

## Status

done
