---
title: 'RBAC: Content Editor (and Reviewer) read course/subject lists for question flows'
type: 'bugfix'
created: '2026-07-16'
status: 'done'
baseline_commit: '82bb603e26978efca9904e5848b32c91a54d3c6a'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Content Editors can create/import questions, but `GET /admin/courses` and `GET /admin/subjects` are class-locked to `super_admin`, so course/subject dropdowns 403 and those flows cannot bind a subject. Reviewers hit the same gap on the question bank subject filter.

**Approach:** Split list vs mutate roles on the courses and subjects admin controllers (same pattern as questions/content controllers): allow `editor` and `reviewer` on GET list only; keep all catalog mutations `super_admin`-only. Do not open Catalog nav or subject CRUD to editors.

## Boundaries & Constraints

**Always:**
- Editor and reviewer can successfully list courses and subjects for question create, import, edit, and bank filter UIs.
- All course/subject create, update, reorder, archive, activate, delete, blueprint, and go-live endpoints remain `super_admin` only.
- Catalog sidebar/pages stay `super_admin`-gated; no UI expansion of Subject CRUD to editor.
- Follow existing method-level `@Roles` override pattern (`AdminRolesGuard` + `getAllAndOverride`).

**Ask First:**
- Adding a new permission-matrix capability (e.g. `catalog_read`) instead of only widening `@Roles` on list endpoints.
- Allowing editor/reviewer on any non-list catalog endpoint (including `GET :id/go-live-status`).

**Never:**
- Grant `subject_crud_pricing` or Catalog CRUD UI to editor/reviewer.
- Change candidate-facing catalog APIs or public subject/course reads.
- Broaden finance/support into catalog lists.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Editor lists courses | Authenticated `editor`, `GET /api/v1/admin/courses` | 200 + admin course list | N/A |
| Editor lists subjects | Authenticated `editor`, `GET /api/v1/admin/subjects` | 200 + admin subject list | N/A |
| Reviewer lists subjects | Authenticated `reviewer`, `GET /api/v1/admin/subjects` | 200 + admin subject list | N/A |
| Editor mutates course | Authenticated `editor`, `POST/PATCH/DELETE` course admin | 403 `FORBIDDEN` | Existing ForbiddenException body |
| Editor mutates subject | Authenticated `editor`, `POST/PATCH/DELETE` subject admin | 403 `FORBIDDEN` | Existing ForbiddenException body |
| Editor go-live status | Authenticated `editor`, `GET /admin/subjects/:id/go-live-status` | 403 `FORBIDDEN` | Keep super_admin-only |
| Super admin unchanged | Authenticated `super_admin`, list + mutate | Full access as today | N/A |

</frozen-after-approval>

## Code Map

- `apps/api/src/courses/courses-admin.controller.ts` -- class `@Roles("super_admin")`; split to method-level
- `apps/api/src/subjects/subjects-admin.controller.ts` -- same class lock; split list vs mutate (+ keep go-live super_admin)
- `apps/api/src/admin-auth/guards/admin-roles.guard.ts` -- handler overrides class via `getAllAndOverride`
- `apps/api/src/questions/questions-admin.controller.ts` -- reference pattern for read vs mutate roles
- `apps/admin/src/app/questions/new/page.tsx` -- `adminListCourses` / `adminListSubjects` for create
- `apps/admin/src/app/questions/import/page.tsx` -- same lists for upload
- `apps/admin/src/app/questions/[id]/edit/page.tsx` -- same lists for edit
- `apps/admin/src/app/questions/page.tsx` -- reviewer+editor subject filter uses `adminListSubjects`
- `apps/admin/src/lib/admin-nav-access.ts` -- catalog stays hidden for non–super_admin (no change)
- `apps/api/src/admin-auth/rbac/permission-matrix.ts` -- leave matrix unchanged unless Ask First triggers

## Tasks & Acceptance

**Execution:**
- [x] `apps/api/src/courses/courses-admin.controller.ts` -- remove class `@Roles`; `@Roles("super_admin","editor","reviewer")` on `GET` list; `@Roles("super_admin")` on every mutate method -- unlock dropdown data without Catalog CRUD
- [x] `apps/api/src/subjects/subjects-admin.controller.ts` -- same split for `GET` list; keep mutate + `GET :id/go-live-status` as `@Roles("super_admin")` -- go-live is catalog ops, not question binding
- [x] `apps/api/src/courses/courses-admin.controller.spec.ts` (new) -- unit-test role matrix for list vs mutate (I/O rows) -- guard/reflector pattern matching existing admin-roles tests
- [x] `apps/api/src/subjects/subjects-admin.controller.spec.ts` (new) -- same for subjects list vs mutate vs go-live -- prevent regression to class-wide lock

**Acceptance Criteria:**
- Given an authenticated Content Editor on question create or import, when course/subject lists load, then dropdowns populate from successful list API responses (not 403/empty from forbidden).
- Given an authenticated Reviewer on the question bank list, when the subject filter loads, then `adminListSubjects` succeeds.
- Given an authenticated editor or reviewer, when they call any course/subject mutate or go-live endpoint, then API returns 403.
- Given Catalog nav/pages, when role is editor or reviewer, then Catalog remains hidden/gated to super_admin as today.

## Spec Change Log

## Design Notes

Mirror `questions-admin.controller.ts`: no class-level `@Roles`; decorate each handler. Prefer method-level roles over a new `catalog_read` capability for this bugfix — matrix already models Subject CRUD vs Question CRUD; list access is an implementation dependency of question flows, not a new product capability.

```ts
@Get()
@Roles("super_admin", "editor", "reviewer")
list() { ... }

@Post()
@Roles("super_admin")
create(@Body() dto: CreateCourseDto) { ... }
```

## Verification

**Commands:**
- `pnpm --filter api exec vitest run src/courses/courses-admin.controller.spec.ts src/subjects/subjects-admin.controller.spec.ts` -- expected: pass (or project-equivalent jest path if vitest not used)
- `pnpm --filter api exec tsc --noEmit` -- expected: clean for touched controllers

**Manual checks (if no CLI):**
- Log in as Content Editor → `/questions/new` and `/questions/import` → course + subject selects populate.
- As editor, confirm `/courses` and `/subjects` still inaccessible via nav/gate.
- As Reviewer → `/questions` subject filter populates.

## Suggested Review Order

**List read unlock**

- Entry point: course list now allows editor + reviewer without Catalog CRUD.
  [`courses-admin.controller.ts:14`](../../apps/api/src/courses/courses-admin.controller.ts#L14)

- Same list unlock for subjects used by create/import/filter dropdowns.
  [`subjects-admin.controller.ts:28`](../../apps/api/src/subjects/subjects-admin.controller.ts#L28)

**Mutate stays super_admin**

- Course create remains super_admin-only after class-level Roles removal.
  [`courses-admin.controller.ts:20`](../../apps/api/src/courses/courses-admin.controller.ts#L20)

- Subject go-live stays ops-only (not opened with list read).
  [`subjects-admin.controller.ts:70`](../../apps/api/src/subjects/subjects-admin.controller.ts#L70)

**Tests**

- Metadata matrix locks list vs mutate roles for courses.
  [`courses-admin.controller.spec.ts:26`](../../apps/api/src/courses/courses-admin.controller.spec.ts#L26)

- Subjects matrix also covers go-live + blueprint as super_admin-only.
  [`subjects-admin.controller.spec.ts:32`](../../apps/api/src/subjects/subjects-admin.controller.spec.ts#L32)

