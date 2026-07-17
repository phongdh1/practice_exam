---
title: 'Move Course field to subject identity section'
type: 'feature'
created: '2026-07-17'
status: 'done'
route: 'one-shot'
baseline_commit: '3ef4ea58fb2b96249a951c79a8cac5952d0a1df5'
---

# Move Course field to subject identity section

## Intent

**Problem:** On `subjects/new` (and edit), the required Course selector lived in the "Cấu hình nâng cao" card, far from the primary identity fields (Tên môn học, Mã môn học), making catalog grouping easy to miss when creating a subject.

**Approach:** Relocate the Course `<select>` into the top identity card, between the name/code row and the description field, and disable it when no active courses exist.

## Suggested Review Order

- Course select now sits in the identity card above description.
  [`subject-editor-form.tsx:372`](../../apps/admin/src/components/subject-editor-form.tsx#L372)

- Disabled state and styling align with sibling inputs when no courses exist.
  [`subject-editor-form.tsx:376`](../../apps/admin/src/components/subject-editor-form.tsx#L376)

- Advanced section no longer duplicates Course; grid starts at Study Tier limit.
  [`subject-editor-form.tsx:485`](../../apps/admin/src/components/subject-editor-form.tsx#L485)
