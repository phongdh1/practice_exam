---
title: 'Question Bank header in admin top bar'
type: 'feature'
created: '2026-07-13'
status: 'done'
route: 'one-shot'
---

# Question Bank header in admin top bar

## Intent

**Problem:** The Question Bank list page rendered its title and subtitle inside `AdminPageShell`, separate from the sticky admin web header where notifications live.

**Approach:** Resolve page header copy from the `/questions` route in `admin-nav.ts` and render it in `admin-app-frame.tsx` top bar; remove duplicate title from the questions list page shell.

## Suggested Review Order

- Route-based title/subtitle for Question Bank list
  [`admin-nav.ts:43`](../../apps/admin/src/lib/admin-nav.ts#L43)

- Sticky top bar shows page header left, notifications right
  [`admin-app-frame.tsx:37`](../../apps/admin/src/components/admin-app-frame.tsx#L37)

- List page no longer duplicates header in page shell
  [`page.tsx:307`](../../apps/admin/src/app/questions/page.tsx#L307)
