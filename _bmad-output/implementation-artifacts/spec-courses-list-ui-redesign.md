---
title: 'Admin courses list UI redesign'
type: 'feature'
created: '2026-07-17'
status: 'done'
baseline_commit: '98385ebac6fa2eb3455a693a766079e11b1eba01'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/courses` still uses the older CatalogSectionToolbar + flat table, while `/subjects` already has the mock-aligned list chrome (stats, visibility tabs, pagination). The courses list feels inconsistent and harder to scan.

**Approach:** Restyle the admin courses list to match the provided mock and the subjects-list pattern, using only real `AdminCourseView` data — no fake price, enrollment, category, or draft status.

## Boundaries & Constraints

**Always:**
- Keep `AdminRoleGate` `super_admin`, bulk/single delete only when `subjectCount === 0`, and ↑↓ reorder (API needs full ordered ID list).
- Align visual/interaction patterns with `apps/admin/src/app/subjects/page.tsx` (StatCard, filter pills, client pagination PAGE_SIZE=10).
- Status model stays `active` | `archived` only. Map mock “Công khai” → `active`.
- Derive stats client-side from the loaded list. Vietnamese copy.

**Ask First:**
- Any new API fields, endpoints, or DB columns.
- Extracting shared StatCard/pagination into a package (prefer local copy like subjects unless duplication becomes painful).

**Never:**
- Fake or placeholder price, enrollment counts, %-growth badges, category dropdown, or “Nháp” draft tab/status.
- Server-side pagination or changing course create/edit flows.
- Removing reorder, bulk select/delete, or visibility activate/archive actions.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Filter active | Tab “Công khai” | Only `visibility === "active"` rows; page resets to 1 | N/A |
| Filter archived | Tab “Lưu trữ” | Only archived rows; page resets to 1 | N/A |
| Empty filter | Filter yields 0 rows | Empty table + pagination shows 0 results | N/A |
| Paginate | >10 courses in filter | Footer “Hiển thị a–b của N kết quả”; page controls work | N/A |
| Reorder on page 2+ | ↑↓ on a row | Swap within full unfiltered ordered list by id; refetch; stay on valid page | Show mutation error banner |
| Delete with subjects | `subjectCount > 0` | No delete action; excluded from bulk deletable set | API error surfaced if attempted |
| Loading | Query pending | Stat values “—”; table loading row | N/A |

</frozen-after-approval>

## Code Map

- `apps/admin/src/app/courses/page.tsx` -- primary rewrite target
- `apps/admin/src/app/subjects/page.tsx` -- pattern source (StatCard, FILTER_TABS, pagination, CTA-only toolbar)
- `apps/admin/src/components/catalog-section-tabs.tsx` -- drop CatalogSectionToolbar from courses; keep shared tokens only if still useful
- `packages/types/src/index.ts` -- `AdminCourseView` (read-only; no schema change)

## Tasks & Acceptance

**Execution:**
- [x] `apps/admin/src/app/courses/page.tsx` -- Replace CatalogSectionToolbar with CTA-only “+ Thêm khóa học mới”; add 3 derived StatCards (total, active/Công khai, sum of subjectCount); add visibility filter pills (Tất cả / Công khai / Lưu trữ); client-side pagination; redesign table (Khóa học & Mã, Môn học as count, Thứ tự as displayOrder, status badge with dot, actions); keep checkbox bulk delete + reorder + archive/activate + edit; add tip banner below table about public vs archived — mirror subjects layout while preserving courses-only behaviors
- [x] Manual verify edge cases in I/O matrix (filter, empty, pagination, reorder across pages, delete guard)

**Acceptance Criteria:**
- Given the courses list loads, when the page renders, then three truthful stat cards and status filter pills appear (no price/enrollment/category/draft chrome).
- Given more than 10 courses (or fewer after filter), when the admin pages, then client pagination matches subjects (“Hiển thị a–b của N kết quả”).
- Given an active course, when the admin archives (and reverse), then visibility updates and list/stats refresh.
- Given courses with and without subjects, when selecting for bulk delete, then only `subjectCount === 0` are deletable.
- Given reorder via ↑↓ on any page/filter, when confirmed, then full catalog order updates correctly without inventing new API.

## Spec Change Log

## Design Notes

**Stats (data-truthful vs mock):**
1. Tổng số khóa học → `courses.length`
2. Đang mở đăng ký / Công khai → count `visibility === "active"` (+ optional “X% trên tổng số”)
3. Tổng số môn học → sum of `subjectCount` (replaces mock enrollment card)

**Labels:** Prefer mock “Công khai” for active on this page (subjects still say “Hoạt động”). Tip banner: public changes apply immediately; use Lưu trữ to temporarily close registration.

**Reorder + pagination:** Always resolve indices against the full unfiltered `courses` array by id before calling `adminReorderCourses`.

## Verification

**Commands:**
- `pnpm --filter admin lint` -- expected: pass (or no new errors in touched file)
- `pnpm --filter admin typecheck` -- expected: pass if script exists; else skip

**Manual checks:**
- Open `/courses`: stats, tabs, table, pagination, tip banner match subjects-quality layout.
- Filter + paginate + reorder + archive/activate + delete empty course; confirm no fake fields.

## Suggested Review Order

**Layout chrome**

- CTA-only create button replaces CatalogSectionToolbar (subjects parity).
  [`page.tsx:243`](../../apps/admin/src/app/courses/page.tsx#L243)

- Three client-derived StatCards — total, active, subjectCount sum.
  [`page.tsx:253`](../../apps/admin/src/app/courses/page.tsx#L253)

- Visibility filter pills map mock “Công khai” → `active`.
  [`page.tsx:154`](../../apps/admin/src/app/courses/page.tsx#L154)

**List behavior**

- Filter + client pagination slice drives the table body.
  [`page.tsx:106`](../../apps/admin/src/app/courses/page.tsx#L106)

- Footer always shows result range, including empty filter (0 kết quả).
  [`page.tsx:344`](../../apps/admin/src/app/courses/page.tsx#L344)

- Reorder disabled unless filter is “Tất cả”; indices use full catalog by id.
  [`page.tsx:215`](../../apps/admin/src/app/courses/page.tsx#L215)

**Row actions**

- CourseRow: badge, subject count, ↑↓ / archive / edit / delete guards.
  [`page.tsx:483`](../../apps/admin/src/app/courses/page.tsx#L483)

- Admin tip banner for public vs archived registration.
  [`page.tsx:469`](../../apps/admin/src/app/courses/page.tsx#L469)
