---
title: 'Catalog subjects/courses listing body UI redesign'
type: 'feature'
created: '2026-07-15'
status: 'done'
baseline_commit: 'ec2f9a45911d333c40565764787b0469dbd6d45f'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Admin Catalog listing bodies on `/subjects` and `/courses` still use a flat, dated table chrome while other admin lists (Question Bank A-30) and the new back-office mock use a clean white workspace under the existing top bar.

**Approach:** Restyle both Catalog listing pages to share one modern listing-body layout (toolbar + white table workspace + footer count), keep each page’s existing columns and row actions, and leave the sticky top bar and sidebar unchanged. No quick search.

## Boundaries & Constraints

**Always:**
- Same listing chrome for `/subjects` and `/courses` (tabs, create CTA weight, card table, header/row/footer styling).
- Keep page-specific columns and behavior:
  - Subjects: checkbox · Môn học (+ Hot/code) · Course · Giá · Go-live · Trạng thái · activate/archive/edit/delete-if-archived (+ go-live gate).
  - Courses: checkbox · Khóa học · Thứ tự · Môn học count · Trạng thái · reorder / archive-activate / edit / delete-if-empty.
- Preserve selection, bulk delete rules, confirms, loading/empty copy, and mutations.
- Keep current `admin-app-frame` top bar (page title/subtitle, notifications, user chip).

**Ask First:**
- Changing column set, adding filters/pagination API, or switching to a card-grid listing.
- Changing sidebar branding/nav chrome.

**Never:**
- Implement top-bar quick search (“Tìm kiếm nhanh…”).
- Redesign sticky top bar or global AdminSidebar for this story.
- Change APIs, go-live rules, RBAC (`super_admin`), or sidebar “New Subject” behavior.
- Port Question Bank stats cards or real filters unless the human expands scope.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Subjects happy path | List loads with rows | Shared chrome + subject columns/actions; count footer shows N môn học | N/A |
| Courses happy path | List loads with rows | Same chrome + course columns/actions (incl. reorder); count footer shows N khóa học | N/A |
| Loading | Query pending | Empty row “Đang tải...” inside restyled table | N/A |
| Empty | Zero rows | Subjects: “Chưa có môn học.” / Courses: “Chưa có khóa học.” | N/A |
| Bulk delete subjects | Archived rows selected → confirm | Existing delete flow + bulk result banner | Mutation error banner |
| Bulk delete courses | Empty courses selected → confirm | Existing delete flow + bulk result banner | Mutation error banner |
| Tab switch | Click môn học / khóa học tab | Navigates; active tab + create CTA label match route | N/A |

</frozen-after-approval>

## Code Map

- `apps/admin/src/app/subjects/page.tsx` -- A-20 subjects listing body to restyle
- `apps/admin/src/app/courses/page.tsx` -- courses listing body to restyle
- `apps/admin/src/components/catalog-section-tabs.tsx` -- shared tabs + create CTA (A-30-weight button)
- `packages/ui/src/components/admin-data-table.tsx` -- shared table card (extend chrome if needed without breaking other pages)
- `apps/admin/src/app/questions/page.tsx` -- visual reference for header/row/footer polish
- `apps/admin/src/components/admin-app-frame.tsx` -- top bar must stay untouched
- `packages/ui/src/components/admin-shell.tsx` -- sidebar out of scope

## Tasks & Acceptance

**Execution:**
- [x] `apps/admin/src/components/catalog-section-tabs.tsx` -- Align toolbar with modern list actions (primary create CTA `px-6 py-3 font-bold shadow-sm`, clear tabs↔CTA spacing) -- shared chrome for both routes
- [x] `packages/ui/src/components/admin-data-table.tsx` -- Left defaults unchanged; shared chrome via exported class constants in `catalog-section-tabs.tsx` applied on both pages -- one shared look without breaking other admin tables
- [x] `apps/admin/src/app/subjects/page.tsx` -- Apply shared listing body layout (toolbar → alerts/bulk → white table card → tinted count footer; uppercase muted headers; row hover; status badges) without changing columns/actions/logic -- subjects parity
- [x] `apps/admin/src/app/courses/page.tsx` -- Same listing body chrome with course columns/actions -- courses parity
- [x] Manual smoke of matrix scenarios on both routes -- verify no regression (tsc admin `--noEmit` pass; logic/columns unchanged)

**Acceptance Criteria:**
- Given `/subjects` or `/courses`, when the page loads, then listing body uses the same white card + toolbar treatment; top bar still shows the existing page title/subtitle (not a search field).
- Given either list with data, when inspecting columns and row actions, then subjects and courses keep their current column sets and eligibility rules (go-live activate; course reorder; delete gates).
- Given selection on either page, when bulk bar appears, then existing bulk delete confirm + result banners still work inside the new chrome.
- Given loading or empty state, when no rows are ready, then the restyled table still shows the current Vietnamese loading/empty strings.
- Given Question Bank or other admin tables, when Catalog chrome changes land, then unrelated pages are not visually broken (if `AdminDataTable` defaults change, spot-check Questions list).

## Spec Change Log

## Design Notes

Match Question Bank listing chrome (not the empty shell mock): bold create CTA (`px-6 py-3 shadow-sm`); table headers `bg-surface-container-low/50` + uppercase tracking + `px-6`; row `hover:bg-surface-subtle`; footer `bg-surface-container-low/30`. No filter card or pagination — full fetch stays. Keep Lucide `AdminIconAction` (text “Sửa” links = Ask First).

## Verification

**Commands:**
- `pnpm --filter @practice-exam/admin lint` -- expected: pass
- `pnpm --filter @practice-exam/ui build` -- expected: pass if `admin-data-table` changes

**Manual checks:**
- `/subjects` + `/courses`: shared chrome, different columns, create CTA, top bar unchanged, no search.
- Spot-check `/questions` if shared `AdminDataTable` defaults changed.

## Suggested Review Order

**Shared chrome**

- Entry: shared table class tokens + A-30-weight create CTA for both Catalog routes.
  [`catalog-section-tabs.tsx:14`](../../apps/admin/src/components/catalog-section-tabs.tsx#L14)

- Bold create link (`px-6 py-3 shadow-sm`) with `ml-auto` beside section tabs.
  [`catalog-section-tabs.tsx:30`](../../apps/admin/src/components/catalog-section-tabs.tsx#L30)

**Subjects listing**

- Applies shared header/row/footer chrome; columns and actions unchanged.
  [`subjects/page.tsx:177`](../../apps/admin/src/app/subjects/page.tsx#L177)

**Courses listing**

- Same chrome with course-specific columns (reorder, subject count).
  [`courses/page.tsx:198`](../../apps/admin/src/app/courses/page.tsx#L198)
