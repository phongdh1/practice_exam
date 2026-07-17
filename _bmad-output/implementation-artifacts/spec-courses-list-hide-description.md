---
title: 'Hide course description on courses list'
type: 'chore'
created: '2026-07-17'
status: 'done'
route: 'one-shot'
---

# Hide course description on courses list

## Intent

**Problem:** The `/courses` list showed each course’s description under name/code, cluttering the table.

**Approach:** Remove the description line from the course identity cell so the list shows name and code only; description remains available on create/edit.

## Suggested Review Order

- Remove description from `CourseRow` identity cell; keep name + code.
  [`page.tsx:528`](../../apps/admin/src/app/courses/page.tsx#L528)
