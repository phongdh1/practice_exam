---
title: 'Question Bank subject column ellipsis tooltip'
type: 'feature'
created: '2026-07-13'
status: 'done'
route: 'one-shot'
---

# Question Bank subject column ellipsis tooltip

## Intent

**Problem:** The Môn học column on the admin Question Bank table can overflow when subject names are long, breaking the A-30 table layout.

**Approach:** Truncate subject names to a single line with ellipsis and show the full name in a hover tooltip using existing `@practice-exam/ui` Tooltip primitives.

## Suggested Review Order

- Subject cell truncates long names and reveals full text on hover
  [`page.tsx:591`](../../apps/admin/src/app/questions/page.tsx#L591)
