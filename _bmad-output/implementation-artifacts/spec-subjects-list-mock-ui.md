---
title: 'Subjects list management UI (mock-aligned)'
type: 'feature'
created: '2026-07-16'
status: 'done'
baseline_commit: 'c7c55ea5906b2c31ec9c0efdb30a03c472545889'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Admin `/subjects` still uses Catalog tabs + a flat table and does not match the approved management mock (page header, KPI strip, visibility filters, richer table, pagination).

**Approach:** Rebuild the `/subjects` listing body to follow that mock using existing `adminListSubjects` data only: content-owned header + CTA, three client-derived stats, All/Active/Archived tabs, mock-aligned columns, and client-side pagination; keep the global shell but hide the page title in the top bar for this route.

## Boundaries & Constraints

**Always:**
- Scope: `/subjects` listing UI only (super_admin gate unchanged).
- Minimal top bar on `/subjects`: no title/subtitle in the sticky bar (notifications + user remain); page title, subtitle, and primary “+ Thêm môn học mới” live in content.
- Stats (client-derived from the loaded list): (1) total subjects, (2) active count + % of total, (3) go-live ready count (`goLive.canActivate`) — no registration KPI.
- Visibility tabs only: Tất cả / Hoạt động / Lưu trữ (no Bản nháp).
- Table columns map real fields: subject name+code (+ Hot, optional letter tile), học phí (`monthlyAmountVnd`), giới hạn free (`freeTierLimit`), câu hỏi (`goLive.publishedQuestionCount` with bar vs `requirements.minPublishedQuestions`), trạng thái pills, thao tác (existing activate/archive/edit/delete rules).
- Client pagination over the filtered in-memory list; preserve selection/bulk delete behavior for archived rows.
- Leave `/courses` and shared `CatalogSectionToolbar` working for courses (subjects stops using that toolbar).

**Ask First:**
- Adding Draft status, grade filter, export/download, or any new API/fields.
- Changing sidebar branding or other admin routes’ top-bar behavior.
- Replacing go-live-ready KPI with a different third card.

**Never:**
- Invent registration/enrollment numbers or fake Draft/grade data.
- Server pagination / new list endpoints for this story.
- Redesign `/courses` body or shared catalog tokens just to match this mock.
- Touch `admin-shell.tsx` sidebar WIP (leave uncommitted work alone).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy path | List loads with mixed visibility | Header + 3 stats + tabs + paged table with mapped columns | N/A |
| Filter Active | Tab Hoạt động | Only `visibility === "active"` rows; page resets to 1 | N/A |
| Filter Archived | Tab Lưu trữ | Only archived rows; bulk delete still gated | N/A |
| Empty filter | No rows for tab | Empty table copy; stats still reflect full list totals | N/A |
| Loading | Query pending | Loading state in table; stats show placeholders or hide numbers | N/A |
| Pagination | > page size | Footer “Hiển thị a–b trong số N” + page controls | N/A |
| Bulk delete | Archived selected | Existing confirm + mutation + banners | Existing error banner |

</frozen-after-approval>

## Code Map

- `apps/admin/src/app/subjects/page.tsx` -- rebuild listing body (header, stats, tabs, table, client pagination)
- `apps/admin/src/lib/admin-nav.ts` -- `resolveAdminTopHeader("/subjects")` → `null` for minimal top bar
- `apps/admin/src/components/admin-app-frame.tsx` -- already supports null header (verify only)
- `apps/admin/src/app/questions/page.tsx` -- StatCard / chip / pagination patterns to reuse
- `apps/admin/src/components/catalog-section-tabs.tsx` -- leave for `/courses`; subjects unhooks
- `packages/api-client` / admin subject types -- read-only field reference (`freeTierLimit`, `goLive`, …)

## Tasks & Acceptance

**Execution:**
- [x] `apps/admin/src/lib/admin-nav.ts` -- Return null top header for `/subjects` so content owns title/CTA -- minimal top bar
- [x] `apps/admin/src/app/subjects/page.tsx` -- Implement mock layout: content header + 3 derived stats + visibility tabs + mock-aligned columns + client pagination; keep mutations/RBAC -- subjects management UI
- [x] Manual smoke of matrix + `pnpm --filter admin exec tsc --noEmit` -- verify courses still uses Catalog toolbar; subjects top bar has no duplicate title

**Acceptance Criteria:**
- Given `/subjects`, when the page loads, then content shows title/subtitle/CTA and the sticky bar has no page title (notifications/user remain).
- Given a loaded list, when viewing stats, then total, active (+%), and go-live-ready counts match client math on that list.
- Given visibility tabs, when switching All/Active/Archived, then the table filters accordingly and pagination resets.
- Given table rows, when inspecting columns, then fee, free-tier limit, question count/bar, and status use real fields; actions keep current eligibility rules.
- Given `/courses`, when opened, then Catalog tabs/create CTA still work unchanged.

## Spec Change Log

## Design Notes

Third KPI uses **Go-live sẵn sàng** (`goLive.canActivate`), not mock “Đăng ký mới”, because no registration API exists (option 2B).

Subjects unhooks `CatalogSectionToolbar`; navigate to courses via sidebar Catalog / `/courses`. Optional small text link to courses under the page header is fine if it does not recreate the old dual-tab chrome.

## Verification

**Commands:**
- `pnpm --filter admin exec tsc --noEmit` -- expected: exit 0

**Manual checks (if no CLI):**
- `/subjects`: mock layout, minimal top bar, filters, pagination, actions.
- `/courses`: shared catalog toolbar still present.
- Confirm no Draft/grade/export/registration KPI.

## Suggested Review Order

**Minimal top bar**

- Hide sticky title on list route so content owns header/CTA
  [`admin-nav.ts:116`](../../apps/admin/src/lib/admin-nav.ts#L116)

**Page chrome & KPIs**

- Content header, breadcrumb, create CTA, courses link
  [`page.tsx:214`](../../apps/admin/src/app/subjects/page.tsx#L214)

- Client-derived total / active% / go-live-ready stats
  [`page.tsx:111`](../../apps/admin/src/app/subjects/page.tsx#L111)

**Filter & pagination**

- Visibility chips reset page + clear selection
  [`page.tsx:167`](../../apps/admin/src/app/subjects/page.tsx#L167)

- Client slice + footer pager (hidden when empty)
  [`page.tsx:124`](../../apps/admin/src/app/subjects/page.tsx#L124)

**Table & actions**

- Mock columns: fee, free tier, question bar, status, actions
  [`page.tsx:406`](../../apps/admin/src/app/subjects/page.tsx#L406)

- Row actions keep activate/archive/edit/delete gates
  [`page.tsx:455`](../../apps/admin/src/app/subjects/page.tsx#L455)
