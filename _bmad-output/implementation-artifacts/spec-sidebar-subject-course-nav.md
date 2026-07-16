---
title: 'Sidebar Subject + Course nav'
type: 'chore'
created: '2026-07-16'
status: 'done'
route: 'one-shot'
---

# Sidebar Subject + Course nav

## Intent

**Problem:** The admin sidebar labeled the subjects entry “Catalog” and had no direct Course nav item, so courses were only reachable via catalog chrome or deep links.

**Approach:** Rename the Catalog nav label to Subject (still `/subjects`), add a peer Course item to `/courses` with correct active-state resolution, keep New Subject → `/subjects/new`, and hide Course wherever Catalog was already role-hidden.

## Suggested Review Order

**Sidebar labels & Course item**

- Subject + Course nav entries and `courseHref` default
  [`admin-shell.tsx:45`](../../packages/ui/src/components/admin-shell.tsx#L45)

**Active state**

- `/subjects` → Subject; `/courses` → Course
  [`admin-nav.ts:32`](../../apps/admin/src/lib/admin-nav.ts#L32)

**RBAC visibility**

- Hide `course` with `catalog` for non–super_admin roles
  [`admin-nav-access.ts:5`](../../apps/admin/src/lib/admin-nav-access.ts#L5)
