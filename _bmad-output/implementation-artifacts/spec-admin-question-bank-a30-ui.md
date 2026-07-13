---
title: 'Admin Question Bank A-30 UI alignment'
type: 'feature'
created: '2026-07-13'
status: 'done'
baseline_commit: '018d2760aec49938ddf46821bc7d0abe91f7e5ac'
context:
  - '_bmad-output/stitch-html/Admin_Question_Bank_A-30_.html'
  - '_bmad-output/planning-artifacts/ux-designs/ux-Practice_Exam-2026-06-29/EXPERIENCE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The admin Question Bank page (`/questions`) has the correct data and bulk workflows but its layout, filters, table columns, pagination, and summary stats do not match the approved A-30 Stitch screen the stakeholder provided.

**Approach:** Reskin `apps/admin/src/app/questions/page.tsx` to follow `Admin_Question_Bank_A-30_.html` — filter card with subject + status chips + difficulty, table row layout with ID/relative update metadata, numbered pagination, and four status summary cards — while preserving existing URL-driven search/filter state, RBAC, and bulk actions from STORY-64. Add a lightweight `GET /admin/questions/stats` endpoint for global counts.

## Boundaries & Constraints

**Always:**
- Match A-30 visual structure: page title/subtitle, single primary CTA `Tạo câu hỏi mới`, filter card, table card, numbered pagination footer, four summary stat cards.
- Keep URL query params as source of truth for `search`, `status`, `difficulty`, `subjectId`, `page`, `pageSize` (existing behavior).
- Keep checkbox selection and bulk Gửi duyệt / Duyệt tất cả / Xóa flows working for editor/reviewer/super_admin roles.
- Use existing design tokens (`primary`, `success-muted`, `warning-muted`, `surface-container-*`) and `@practice-exam/ui` table primitives.
- Vietnamese copy for labels; status chip/badge text may use English labels from Stitch (`Published`, `In Review`, `Draft`) where the reference does.

**Ask First:**
- Removing Import Excel / Hàng đợi duyệt entry points from the page header (currently not in A-30 mock).
- Changing default `pageSize` from 25 to 5 to match the mock exactly.

**Never:**
- Rebuild admin shell/top-nav global search in this spec (out of A-30 page scope).
- Remove `courseId` / `topic` URL filter support — only hide controls not shown in A-30; existing deep links must still work.
- Add new bulk API endpoints.
- Change question editorial workflow or RBAC rules.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | Editor opens `/questions` | Filter card, table, pagination, and four stat cards render per A-30; data loads from existing search API + new stats API | N/A |
| FILTER_STATUS | User clicks `Draft` chip | URL `status=draft`; table refetches; chip shows active primary style | N/A |
| FILTER_SUBJECT | User picks a subject | URL `subjectId` set; table refetches; subject label shown in filter control | Empty subjects → only "Tất cả" |
| PAGINATION | User clicks page `3` | URL `page=3`; footer shows `Hiển thị X - Y trên tổng số Z câu hỏi` with numbered buttons + chevrons | Disable prev on page 1, next on last page |
| REFRESH | User clicks `Làm mới` | Refetches list + stats; selection cleared | Show existing loading state |
| STATS_API | Any admin role with list access | `GET /admin/questions/stats` returns `{ total, published, inReview, draft }` global counts (unfiltered) | 401/403 via existing guards |
| BULK_SELECTED | Rows selected | Bulk toolbar appears above table (existing); table layout unchanged | Disabled states preserved |
| EMPTY_LIST | Filters match zero rows | Table empty state; pagination shows 0 range; stats cards still show global totals | N/A |
| STATS_FAIL | Stats endpoint errors | Table still works; stat cards show `—` or skeleton, not a blocking error | Non-blocking |

</frozen-after-approval>

## Code Map

- `apps/admin/src/app/questions/page.tsx` — main A-30 page; restructure layout, filters, table cells, pagination, stat cards; keep bulk/URL logic.
- `_bmad-output/stitch-html/Admin_Question_Bank_A-30_.html` — golden visual reference for spacing, copy, and component structure.
- `apps/api/src/questions/questions-admin.controller.ts` — add `GET stats` route before `:id` route.
- `apps/api/src/questions/questions.service.ts` — add `getStats()` with `prisma.question.groupBy({ by: ['status'], _count: true })`.
- `apps/api/src/questions/questions.service.spec.ts` — unit test stats aggregation.
- `packages/api-client/src/index.ts` — `adminGetQuestionStats()` + `queryKeys.questions.stats`.
- `packages/types/src/index.ts` — `QuestionBankStats` interface.
- `packages/ui/src/components/admin-data-table.tsx` — reuse wrapper; no breaking changes.
- `apps/admin/src/components/admin-tab-nav.tsx` — reference for pill/chip active/inactive class patterns (status chips are local buttons, not route tabs).

## Tasks & Acceptance

**Execution:**
- [x] `packages/types/src/index.ts` — add `QuestionBankStats` type `{ total: number; published: number; inReview: number; draft: number }`.
- [x] `apps/api/src/questions/questions.service.ts` — implement `getStats()` counting questions by status.
- [x] `apps/api/src/questions/questions-admin.controller.ts` — expose `GET /admin/questions/stats` with same roles as list.
- [x] `apps/api/src/questions/questions.service.spec.ts` — test stats counts and zero-data case.
- [x] `packages/api-client/src/index.ts` — add client method + query key for stats.
- [x] `apps/admin/src/app/questions/page.tsx` — A-30 layout: header CTA, filter card (subject select, status chips, difficulty select, Làm mới), table columns (Nội dung câu hỏi with stem + `ID: Q-{suffix}` + relative `updatedAt`, Môn học, Trạng thái dot-badge, Độ khó VN label, Thao tác `Sửa` text link), numbered pagination footer, four stat cards; preserve bulk toolbar + hidden URL filters.
- [x] `apps/admin/src/lib/format-relative-time.ts` (new, if no shared util exists) — Vietnamese relative time helper for `updatedAt`.

**Acceptance Criteria:**
- Given an editor on `/questions`, when the page loads, then the layout visually matches A-30: filter card above table, primary `+ Tạo câu hỏi mới` button, no inline search box in the filter row, and four summary cards below the table.
- Given questions exist, when viewing a table row, then the question stem is primary-colored truncated text, metadata line shows `ID: Q-{5-char suffix}` and Vietnamese relative update time, and the action is a `Sửa` text link to edit (not icon-only).
- Given status chips, when clicking `Published` / `In Review` / `Draft` / `Tất cả`, then the URL updates, the active chip uses primary fill, and the table refetches accordingly.
- Given paginated results, when on page 2 of 24, then the footer reads `Hiển thị {start} - {end} trên tổng số {total} câu hỏi` and shows numbered page buttons with ellipsis pattern from the mock.
- Given bulk selection, when one or more rows are checked, then the existing bulk action bar still appears and functions without regression.
- Given the stats API, when the page loads, then stat cards show global totals for all questions, published, in review, and draft regardless of active filters.

## Spec Change Log

## Design Notes

Status badge mapping from Stitch:
- `published` → `bg-success-muted text-success` + green dot
- `in_review` → `bg-warning-muted text-warning` + amber dot
- `draft` → `bg-surface-container-highest text-on-surface-variant` + gray dot

Difficulty labels: `easy` → Dễ, `medium` → Trung bình, `hard` → Khó.

Display ID: `Q-${id.replace(/-/g, '').slice(-5).toUpperCase()}` — no backend change.

Secondary actions (Import Excel, Hàng đợi duyệt): keep as subtle text/icon links beside or below the primary CTA unless user approves removal at checkpoint.

## Verification

**Commands:**
- `pnpm --filter api test -- questions.service.spec` — expected: stats tests pass
- `pnpm --filter admin exec tsc --noEmit` — expected: no type errors

**Manual checks:**
- Open `/questions` — compare against attached A-30 screenshot and stitch HTML.
- Toggle each status chip and subject filter — URL and table update.
- Select rows — bulk bar appears; submit/approve/delete still work.
- Stat card numbers match DB counts for each status.

## Suggested Review Order

**A-30 page layout and filters**

- Entry point: filter card, table, pagination, and stat cards per Stitch A-30
  [`page.tsx:244`](../../apps/admin/src/app/questions/page.tsx#L244)

- Vietnamese relative timestamps for row metadata
  [`format-relative-time.ts:1`](../../apps/admin/src/lib/format-relative-time.ts#L1)

**Stats API**

- Global question counts by status for summary cards
  [`questions.service.ts:208`](../../apps/api/src/questions/questions.service.ts#L208)

- Route registered before `:id` to avoid collision
  [`questions-admin.controller.ts:41`](../../apps/api/src/questions/questions-admin.controller.ts#L41)

**Client and types**

- API client method and query key for stats fetch
  [`index.ts:390`](../../packages/api-client/src/index.ts#L390)

- Shared `QuestionBankStats` response shape
  [`index.ts:497`](../../packages/types/src/index.ts#L497)

**Tests**

- Stats aggregation unit coverage
  [`questions.service.spec.ts:166`](../../apps/api/src/questions/questions.service.spec.ts#L166)

