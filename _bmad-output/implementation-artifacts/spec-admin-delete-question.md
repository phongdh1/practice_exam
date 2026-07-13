---
title: 'Admin delete question on Question Bank rows'
type: 'feature'
created: '2026-07-13'
status: 'done'
route: 'one-shot'
---

# Admin delete question on Question Bank rows

## Intent

**Problem:** The Question Bank list page lost per-row delete during the A-30 reskin; only bulk delete (via checkbox selection) remained. Editors and super admins could not delete a single question without selecting it first.

**Approach:** Restore a row-level "Xóa" text action alongside "Sửa" for non-published questions. Reuse existing `adminDeleteQuestion` API, `handleDelete` confirm flow, and `canDelete` RBAC gate. Published questions remain undeletable per API rule.

## What already existed

- `DELETE /admin/questions/:id` — `super_admin`, `editor` roles
- `QuestionsService.delete` — blocks `published` status
- `adminApi.adminDeleteQuestion` in api-client
- Bulk delete bar with `partitionByStatus` deletable bucket

## What was added

- Per-row "Xóa" button in Question Bank table actions column
- `isDeletableStatus` helper (`status !== "published"`)
- Gated by `canDelete` (editor, super_admin)

## Acceptance criteria

- **Given** an editor or super_admin on Question Bank
- **When** a question is draft, in_review, or archived
- **Then** "Xóa" appears next to "Sửa" and deletes after confirm

- **Given** a published question
- **When** viewing row actions
- **Then** only "Sửa" is shown (no delete)

- **Given** a reviewer role
- **When** viewing row actions
- **Then** no "Xóa" is shown

## Suggested Review Order

- Row delete action and RBAC gate
  [`page.tsx:646`](../../apps/admin/src/app/questions/page.tsx#L646)
