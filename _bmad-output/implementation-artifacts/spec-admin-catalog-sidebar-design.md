---
title: 'Admin Catalog — mock sidebar branding for listing pages'
type: 'feature'
created: '2026-07-15'
status: 'in-review'
baseline_commit: 'c77a753186421b3c6cc51c868994d5a45e0c4df5'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Catalog listing (`/subjects`, `/courses`) still doesn’t *look* like the approved shell mock because branding is a single-line “CNVCK Back-Office” with no logo; an earlier pass only polished tables and left the sidebar unchanged.

**Approach:** Restyle the shared `AdminSidebar` brand header to match the mock (graduation-cap logo tile + split **CNVCK** / **BACK-OFFICE**), keep the current page-title top bar, and keep existing subjects/courses data tables in the listing body.

## Boundaries & Constraints

**Always:**
- Brand header: `MaterialIcon` `school` in a rounded on-primary tile beside stacked “CNVCK” (bold) + “BACK-OFFICE” (smaller / muted uppercase).
- Remove the “Certification Management” subtitle under the brand.
- Keep Catalog active highlight, white **+ New Subject** CTA, Support, Sign Out behavior and RBAC gating (`showNewSubject`).
- Keep sticky top bar as today (page title/subtitle, notifications, user chip) — no search field.
- Keep subjects/courses table columns, actions, bulk delete, and listing chrome already shipped.
- Routes for this goal: Catalog listing verification on `/subjects` and `/courses` (sidebar itself is shared).

**Ask First:**
- Hiding Dashboard / collapsing Settings (RBAC, Admin Users, System) to match the sparse mock nav.
- Implementing top-bar quick search (even visual-only).
- Changing nav labels/icons away from current Material set.

**Never:**
- Redesign top bar into the mock search + settings/help strip (user chose 2B).
- Change listing to cards; change APIs, columns, or go-live/RBAC rules.
- Scope Content (`/questions`) or other list pages for body redesign in this story (sidebar branding may appear there because it is shared — expected).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Catalog subjects | `/subjects` as super_admin | Mock-style sidebar brand; page title top bar; subjects table | N/A |
| Catalog courses | `/courses` as super_admin | Same sidebar brand; courses table | N/A |
| Non-catalog page | e.g. `/questions` | Same new sidebar brand (shared); that page’s existing body | N/A |
| Non–super_admin | role without New Subject | Brand + nav; no New Subject button | N/A |

</frozen-after-approval>

## Code Map

- `packages/ui/src/components/admin-shell.tsx` -- `AdminSidebar` brand header to restyle
- `apps/admin/src/components/admin-app-frame.tsx` -- wires sidebar; top bar must stay title-based
- `apps/admin/src/app/subjects/page.tsx` -- Catalog subjects listing (verify tables still present)
- `apps/admin/src/app/courses/page.tsx` -- Catalog courses listing (verify)
- `_bmad-output/stitch-html/Admin_Question_Editor_A-31_.html` -- brand structure reference (logo + split title)
- `_bmad-output/implementation-artifacts/spec-catalog-listing-ui-redesign.md` -- prior listing-chrome work (done; table scope)

## Tasks & Acceptance

**Execution:**
- [x] `packages/ui/src/components/admin-shell.tsx` -- Replace brand block with logo tile (`school`) + CNVCK / BACK-OFFICE split; drop Certification Management — mock sidebar branding
- [x] Spot-check active Catalog, New Subject, Support, Sign Out still work — no regression (nav/CTA/footer untouched)
- [x] Manual: `/subjects` and `/courses` show new sidebar + existing tables under title top bar — Catalog listing goal (tsc ui+admin pass; brand-only change)

**Acceptance Criteria:**
- Given any authenticated admin page, when the sidebar renders, then the brand shows a graduation-cap tile plus stacked CNVCK and BACK-OFFICE (no “Certification Management”).
- Given `/subjects` or `/courses`, when the page loads for super_admin, then Catalog is active, page title remains in the top bar (no “Tìm kiếm nhanh…”), and the data table still lists rows with prior columns/actions.
- Given a role without New Subject, when the sidebar renders, then New Subject is hidden and Sign Out still works.

## Spec Change Log

## Design Notes

Brand block target (A-31 stitch pattern):

```tsx
<div className="mb-4 flex items-center gap-3 px-2">
  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-on-primary text-primary">
    <MaterialIcon name="school" size={22} />
  </div>
  <div className="flex flex-col leading-tight">
    <span className="text-display-sm font-bold text-on-primary">CNVCK</span>
    <span className="text-[10px] font-bold uppercase tracking-wider text-on-primary/70">
      BACK-OFFICE
    </span>
  </div>
</div>
```

Keep existing `NAV_LINK_*` and New Subject button classes unless a one-line active-text tweak is needed for contrast.

## Verification

**Commands:**
- `pnpm --filter @practice-exam/ui exec tsc --noEmit` -- expected: pass
- `pnpm --filter @practice-exam/admin exec tsc --noEmit` -- expected: pass

**Manual checks:**
- Hard-refresh `localhost:3002/subjects` and `/courses`: new sidebar brand visible; tables still there; top bar still “Môn học” / “Khóa học”.
