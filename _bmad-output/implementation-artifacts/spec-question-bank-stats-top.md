---
title: 'Question Bank summary stats at top'
type: 'feature'
created: '2026-07-13'
status: 'done'
route: 'one-shot'
---

# Question Bank summary stats at top

## Intent

**Problem:** The Question Bank list page showed four summary stat cards (total, published, in review, draft) below the data table, forcing users to scroll past filters and the table to see the overview.

**Approach:** Move the stat cards grid to the top of `AdminPageShell` content on `/questions`, before CTA buttons and filters; use `mb-6` spacing below the grid.

## Suggested Review Order

- Stat cards grid moved to top of page content
  [`page.tsx:309`](../../apps/admin/src/app/questions/page.tsx#L309)
