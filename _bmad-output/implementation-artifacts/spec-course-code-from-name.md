---
title: 'Auto-generate course code from name initials'
type: 'feature'
created: '2026-07-17'
status: 'done'
route: 'one-shot'
---

# Auto-generate course code from name initials

## Intent

**Problem:** On `/courses/new`, admins had to invent a course code manually; the design expects it to come from the first letter of each word in the course name (same UX as subjects).

**Approach:** In create mode, auto-fill `code` from name initials (strip diacritics including Đ→D, uppercase) until the user edits the code; clear resets to auto-suggest from the current name.

## Suggested Review Order

**Create-mode suggest**

- Initials algorithm + Đ normalization.
  [`course-editor-form.tsx:46`](../../apps/admin/src/components/course-editor-form.tsx#L46)

- Name change drives code until manually edited; clear re-seeds.
  [`course-editor-form.tsx:126`](../../apps/admin/src/components/course-editor-form.tsx#L126)

- Helper text + create-only sidebar example.
  [`course-editor-form.tsx:235`](../../apps/admin/src/components/course-editor-form.tsx#L235)
