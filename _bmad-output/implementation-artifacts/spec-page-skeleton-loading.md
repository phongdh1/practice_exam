---
title: 'Page Skeleton Loading for API Waits'
type: 'feature'
created: '2026-07-10'
status: 'draft'
context:
  - '{project-root}/packages/ui/src/components/catalog-skeleton.tsx'
  - '{project-root}/packages/ui/src/components/ui/skeleton.tsx'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-Practice_Exam-2026-06-29/DESIGN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Many pages across web, admin, and Zalo mini-app show plain text (`Đang tải...`) or no loading UI while `useQuery` / `Suspense` waits for API data. Only a handful of candidate pages use `CatalogSkeleton`, and admin has zero skeleton usage. This causes layout shift and feels unfinished.

**Approach:** Add layout-specific skeleton components in `@practice-exam/ui` (built on the existing `Skeleton` primitive), then replace API-wait loading states on every affected page with the skeleton that matches the loaded layout. Keep `CatalogSkeleton` only for card-grid catalog views.

## Boundaries & Constraints

**Always:**
- Skeletons render only during initial API fetch (`isLoading` / `Suspense` fallback), not during mutations (button `Đang xử lý...`, file upload progress).
- Each skeleton must mirror the approximate shape of the content it replaces (table rows for tables, stat cards for KPIs, etc.).
- Use `aria-busy="true"` and Vietnamese `aria-label` on skeleton containers (match `CatalogSkeleton` pattern).
- Export new skeletons from `packages/ui/src/index.ts`.
- Do not change API contracts or data-fetching logic.

**Ask First:**
- Replacing skeletons inside shared flow screens (`StudyFlowScreen`, `PracticeFlowScreen`, `MockExamFlowScreen`) if the page-level gate already covers loading.
- Adding skeletons to auth pages (`sign-in`, `login`) — currently only button-level loading.

**Never:**
- Skeleton for form-submit / OAuth / payment-in-flight button states.
- Skeleton for import upload progress (`questions/import`).
- New loading spinners or third-party skeleton libraries.
- Changing error or empty states.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Initial page load | `useQuery` `isLoading === true` | Layout-shaped skeleton visible; no `Đang tải...` text for page data | N/A |
| Suspense route segment | Child suspends on first render | `Suspense` fallback shows `TableSkeleton` (admin list pages) | N/A |
| Refetch in background | `isLoading false`, `isFetching true` | Existing content stays visible; no skeleton overlay | N/A |
| API error after load | `isError === true` | Skeleton hidden; existing error UI unchanged | Unchanged |
| Empty result | `isLoading false`, empty array | Empty-state copy shown; no skeleton | N/A |

</frozen-after-approval>

## Code Map

- `packages/ui/src/components/ui/skeleton.tsx` — base primitive; reuse, do not replace
- `packages/ui/src/components/catalog-skeleton.tsx` — card-grid skeleton; keep for catalog pages only
- `packages/ui/src/components/table-skeleton.tsx` — new: admin data tables + Suspense fallbacks
- `packages/ui/src/components/form-skeleton.tsx` — new: checkout + admin edit/detail forms
- `packages/ui/src/components/list-row-skeleton.tsx` — new: vertical lists (history, study rows, card queues)
- `packages/ui/src/components/dashboard-skeleton.tsx` — new: KPI stat cards + section blocks
- `packages/ui/src/components/detail-skeleton.tsx` — new: subject detail hero, user profile header
- `packages/ui/src/components/question-skeleton.tsx` — new: question preview / stem + options
- `packages/ui/src/index.ts` — export new skeletons
- `apps/web/src/app/(candidate)/(shell)/**` — candidate pages with text loading
- `apps/admin/src/app/**` — all admin pages using `Đang tải...`
- `apps/zalo-mini-app/src/main.tsx` — Zalo routes with text/blank loading
- `apps/zalo-mini-app/src/components/maintenance-gate.tsx` — align with web maintenance gate

## Tasks & Acceptance

**Execution:**
- [ ] `packages/ui/src/components/table-skeleton.tsx` -- add `TableSkeleton` with configurable `rows` and `columns` props -- covers admin list tables
- [ ] `packages/ui/src/components/list-row-skeleton.tsx` -- add `ListRowSkeleton` with `count` prop -- covers history, study lists, review/flags queues
- [ ] `packages/ui/src/components/dashboard-skeleton.tsx` -- add `DashboardSkeleton` with stat-card row + content block -- covers admin KPI dashboard and progress pages
- [ ] `packages/ui/src/components/form-skeleton.tsx` -- add `FormSkeleton` with field rows + CTA slot -- covers checkout and admin edit forms
- [ ] `packages/ui/src/components/detail-skeleton.tsx` -- add `DetailSkeleton` for hero/header sections -- covers subject detail and user profile
- [ ] `packages/ui/src/components/question-skeleton.tsx` -- add `QuestionSkeleton` for stem + option rows -- covers question preview
- [ ] `packages/ui/src/index.ts` -- export all new skeleton components and their prop types
- [ ] `apps/admin/src/app/page.tsx` -- replace KPI text loading with `DashboardSkeleton`
- [ ] `apps/admin/src/app/subjects/page.tsx`, `courses/page.tsx`, `questions/page.tsx`, `payments/page.tsx`, `payments/reconciliation/page.tsx`, `payments/revenue/page.tsx`, `payments/promo-codes/page.tsx`, `integrations/webhooks/page.tsx`, `settings/admin-users/page.tsx`, `users/page.tsx` -- replace in-table / block `Đang tải...` and `Suspense` fallbacks with `TableSkeleton`
- [ ] `apps/admin/src/app/subjects/[id]/page.tsx`, `courses/[id]/page.tsx`, `questions/[id]/edit/page.tsx`, `settings/system/page.tsx`, `integrations/zalo/page.tsx`, `integrations/payments/page.tsx` -- replace text loading with `FormSkeleton` or `DetailSkeleton` as layout fits
- [ ] `apps/admin/src/app/users/[id]/page.tsx` -- replace full-page text with `DetailSkeleton` + `TableSkeleton` for subscription section
- [ ] `apps/admin/src/app/questions/[id]/preview/page.tsx` -- replace text with `QuestionSkeleton`
- [ ] `apps/admin/src/app/settings/rbac/page.tsx` -- replace text with wide `TableSkeleton` (matrix layout)
- [ ] `apps/admin/src/app/flags/page.tsx`, `review/page.tsx` -- replace text with `ListRowSkeleton`
- [ ] `apps/web/src/app/(candidate)/(shell)/subjects/[id]/study/page.tsx`, `study/[questionId]/page.tsx`, `practice/page.tsx`, `mock-exams/page.tsx`, `subjects/[id]/checkout/page.tsx` -- replace `Đang tải...` with layout-appropriate skeleton (`ListRowSkeleton`, `FormSkeleton`, or `DetailSkeleton`)
- [ ] `apps/web/src/app/(candidate)/(shell)/progress/page.tsx`, `progress/history/page.tsx`, `progress/history/[type]/[id]/page.tsx` -- swap misused `CatalogSkeleton` for `DashboardSkeleton` / `ListRowSkeleton` / `DetailSkeleton`
- [ ] `apps/zalo-mini-app/src/main.tsx` -- replace text/blank API-wait states on study, checkout, practice gate routes with matching skeletons; align progress/history/detail with web
- [ ] `apps/zalo-mini-app/src/components/maintenance-gate.tsx` -- use `CatalogSkeleton` like web `maintenance-gate.tsx`
- [ ] `packages/ui/src/components/study-flow-screen.tsx`, `study-question-list.tsx` -- replace `CatalogSkeleton` with `ListRowSkeleton` / `QuestionSkeleton` where list/detail layout applies

**Acceptance Criteria:**
- Given any admin list page fetching data on first load, when the API has not responded, then a `TableSkeleton` (not `Đang tải...` text) is shown inside the table or page shell.
- Given the admin dashboard on first load, when KPI query is pending, then `DashboardSkeleton` stat cards appear instead of `Đang tải KPI...`.
- Given a candidate web or Zalo page that previously showed `Đang tải...` during subject/checkout fetch, when loading, then a skeleton matching the final layout is visible.
- Given progress and history pages on web and Zalo, when loading, then list/dashboard skeletons are used instead of card-grid `CatalogSkeleton`.
- Given a background refetch (`isFetching` only), when data is already displayed, then skeletons do not reappear.
- Given an API error or empty result after load completes, when rendered, then existing error/empty UI is unchanged.

## Design Notes

Reuse the `CatalogSkeleton` pattern: wrap in a container with `data-component`, `aria-busy`, and Vietnamese `aria-label`. Build all variants from `Skeleton` blocks using existing design tokens (`bg-primary/10`, `border-outline-variant`, `rounded-xl`).

`CatalogSkeleton` stays on: web home (`page.tsx`), Zalo catalog, and maintenance gates. Do **not** use it for tables, vertical lists, or KPI dashboards.

Golden example for table loading (admin subjects page):

```tsx
{isLoading ? (
  <TableSkeleton rows={5} columns={6} />
) : (
  /* existing tbody rows */
)}
```

## Verification

**Commands:**
- `pnpm --filter @practice-exam/ui build` -- expected: compiles with new exports
- `pnpm --filter web build` -- expected: no type errors in updated pages
- `pnpm --filter admin build` -- expected: no type errors in updated pages
- `pnpm --filter zalo-mini-app build` -- expected: no type errors in updated routes

**Manual checks (if no CLI):**
- Open admin `/subjects`, `/`, `/questions` — skeleton shapes appear briefly on hard refresh, then real data.
- Open web `/progress/history` and Zalo progress tab — vertical row skeletons, not card grid.
- Open web subject study page — list skeleton before `StudyFlowScreen` renders.

## Spec Change Log
