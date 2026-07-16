---
title: 'Subjects list title in shell header'
type: 'chore'
created: '2026-07-16'
status: 'done'
route: 'one-shot'
---

# Subjects list title in shell header

## Intent

**Problem:** After the mock rebuild, `/subjects` showed title and subtitle in the page body while the sticky shell header was empty, and the body also carried a redundant “Quản lý khóa học” link.

**Approach:** Restore title/subtitle on the sticky shell header via `resolveAdminTopHeader("/subjects")`, remove the in-page title block and courses link, and keep only the create CTA in the listing body.

## Suggested Review Order

**Shell header**

- Restore list-route title and subtitle in the sticky bar
  [`admin-nav.ts:116`](../../apps/admin/src/lib/admin-nav.ts#L116)

**Page body**

- Drop duplicate title/breadcrumb/courses link; keep create CTA toolbar
  [`page.tsx:216`](../../apps/admin/src/app/subjects/page.tsx#L216)
