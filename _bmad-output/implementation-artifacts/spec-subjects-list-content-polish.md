---
title: 'Subjects list content visual polish'
type: 'feature'
created: '2026-07-16'
status: 'done'
baseline_commit: 'c77a753186421b3c6cc51c868994d5a45e0c4df5'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The `/subjects` listing body already has shared Catalog chrome, but primary cells, status pills, and row emphasis still read flatter than Question Bank (A-30) under the clean white workspace.

**Approach:** Visually polish only the `/subjects` list content (toolbar spacing, table cell typography, status treatment, bulk/empty chrome) while keeping the existing shell layout, columns, actions, and APIs unchanged.

## Boundaries & Constraints

**Always:**
- Scope is listing **content inside** `AdminPageShell` on `/subjects` only.
- Keep all columns, row actions, selection/bulk delete rules, confirms, mutations, and Vietnamese copy.
- Keep sidebar + sticky top bar as they are today (including any uncommitted sidebar brand WIP — do not revert or extend it).
- Prefer page-local className / markup tweaks in `subjects/page.tsx` over shared primitives.

**Ask First:**
- Changing shared `catalog*` class constants or `CatalogSectionToolbar` in a way that restyles `/courses`.
- Editing `AdminDataTable` / base `Table*` defaults (hits all admin lists).
- Adding filters, stats cards, skeleton loading, or pagination chrome.

**Never:**
- Redesign sidebar or top bar (no “Tìm kiếm nhanh…” search strip).
- Change APIs, go-live eligibility, RBAC, or column set.
- Switch listing to cards/grid.
- Touch `admin-app-frame.tsx`, `admin-shell.tsx`, or `admin-nav.ts` for this goal.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy path | `/subjects` with rows | Polished rows; same columns/actions; count footer | N/A |
| Loading | Query pending | Still shows “Đang tải...” empty row inside table | N/A |
| Empty | Zero subjects | Still shows “Chưa có môn học.” | N/A |
| Bulk selected | Rows checked | Bulk bar + delete/clear still work; chrome only may tighten | Confirm + mutation errors unchanged |
| Archive/activate/delete | Existing eligibility | Same gates and handlers; icons unchanged | Existing error banner |

</frozen-after-approval>

## Code Map

- `apps/admin/src/app/subjects/page.tsx` -- primary polish surface (cells, badges, bulk/empty spacing)
- `apps/admin/src/components/catalog-section-tabs.tsx` -- shared toolbar + `catalog*` tokens (read-only unless Ask First)
- `apps/admin/src/app/questions/page.tsx` -- visual reference (primary stem color, status pills, row group)
- `packages/ui/src/components/admin-data-table.tsx` -- table card shell (leave defaults alone)
- `apps/admin/src/components/admin-page-shell.tsx` -- content gutter only (leave alone)
- `apps/admin/src/components/admin-app-frame.tsx` / `packages/ui/src/components/admin-shell.tsx` -- shell out of scope

## Tasks & Acceptance

**Execution:**
- [x] `apps/admin/src/app/subjects/page.tsx` -- Align subject name cell with Question Bank emphasis (`text-primary` title + muted code meta; keep Hot badge); refine status cell to a clearer active/archived pill without changing labels or column order -- primary-row polish
- [x] `apps/admin/src/app/subjects/page.tsx` -- Tighten bulk bar / result / empty-loading vertical rhythm to match the white table workspace (spacing/radius/border only) -- content chrome polish
- [x] Manual smoke of matrix scenarios on `/subjects` -- verify columns, actions, bulk delete, and shell unchanged (`pnpm --filter admin exec tsc --noEmit` or repo-equivalent)

**Acceptance Criteria:**
- Given `/subjects` with data, when the page loads, then subject names read as primary emphasis and status pills are clearer, while columns and action eligibility stay identical.
- Given loading or empty state, when no rows are ready, then the same Vietnamese strings still appear inside the table.
- Given selection and delete/activate/archive flows, when the admin acts, then behavior matches today (only visual chrome may differ).
- Given the admin shell, when viewing `/subjects`, then sidebar and top bar layout are unchanged by this work.

## Spec Change Log

## Verification

**Commands:**
- `pnpm --filter admin exec tsc --noEmit` -- expected: exit 0

**Manual checks (if no CLI):**
- Open `/subjects`: polished cells; tabs + create CTA still present; top bar still page title (not search); sidebar untouched.
- Spot-check one activate/archive and one bulk delete confirm path.

## Suggested Review Order

- Entry: visibility pill map for active/archived labels and tokens
  [`page.tsx:34`](../../apps/admin/src/app/subjects/page.tsx#L34)

- Primary subject name emphasis (Question Bank parity)
  [`page.tsx:256`](../../apps/admin/src/app/subjects/page.tsx#L256)

- Status pill with decorative `aria-hidden` dot
  [`page.tsx:278`](../../apps/admin/src/app/subjects/page.tsx#L278)

- Bulk/error chrome spacing aligned to table `px-6`
  [`page.tsx:146`](../../apps/admin/src/app/subjects/page.tsx#L146)

- Page-local empty/loading rows (same Vietnamese copy)
  [`page.tsx:214`](../../apps/admin/src/app/subjects/page.tsx#L214)
