---
id: STORY-57-EPIC13
story_key: 13-57-rbac-enforcement
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-44"]
ad_refs: []
---

# 13-57: Role-based access control enforcement

**Epic:** EPIC-13

As a **Super Admin**,
I want **to enforce RBAC across admin modules**,
So that **each role sees only permitted actions**.

## Acceptance Criteria

### AC-1: Role boundaries enforced on API
**Given** roles: super admin, content editor (`editor`), reviewer, support, finance
**When** a content editor calls payment or Zalo integration endpoints
**Then** API returns 403 Forbidden
**And** finance role cannot approve/publish questions (content review approve endpoints return 403)

### AC-2: Permission matrix API
**Given** a super admin is authenticated
**When** GET `/admin/rbac/permission-matrix`
**Then** response matches PRD addendum matrix (capabilities × roles)
**And** non–super-admin roles receive 403

### AC-3: A-92 permission matrix UI
**Given** super admin opens A-92 (`/settings/rbac`)
**When** page loads
**Then** read-only table shows all capabilities and role checkmarks
**And** nav/sidebar hides modules the current role cannot access

## Tasks/Subtasks

- [x] Define canonical permission matrix in API (`admin-auth/rbac/permission-matrix.ts`) aligned with `addendum.md` (AC: #1, #2)
- [x] Add `RbacAdminController` GET `/admin/rbac/permission-matrix` — super_admin only (AC: #2)
- [x] Apply `AdminRolesGuard` + `@Roles` on all admin controllers missing RBAC:
  - [x] `subjects-admin` — super_admin only
  - [x] `questions-admin` + `import-questions` — editor + super_admin (read: reviewer)
  - [x] `content-admin` — approve/reject: reviewer + super_admin; draft edits: editor + super_admin
  - [x] `mock-exams-admin` — super_admin only
- [x] Add types + api-client method for permission matrix (AC: #2)
- [x] Build A-92 page `/settings/rbac` with read-only matrix table (AC: #3)
- [x] Role-based nav hiding in `AdminSidebar` + page-level `AdminRoleGate` on sensitive routes (AC: #3)
- [x] Unit tests: permission matrix + `AdminRolesGuard` (AC: #1)

### Review Findings

- [x] [Review][Patch] H1 — Admin app missing `@practice-exam/types` dependency; direct imports fail typecheck [`apps/admin/package.json`]
- [x] [Review][Patch] H2 — Workspace package dist stale; `hiddenNavItems` / `settings` nav / `adminGetPermissionMatrix` not in built `ui`/`api-client` dist — run package builds before admin typecheck [`packages/ui`, `packages/api-client`]
- [x] [Review][Patch] H3 — Broken empty UI imports from AdminShell migration [`apps/admin/src/app/payments/reconciliation/page.tsx:7`, `revenue/page.tsx:7`]
- [x] [Review][Patch] M1 — `AdminRoleGate` only on 5 routes; payment sub-pages, integration pages, questions/flags/import lack gates (AC-3 partial) [`apps/admin/src/app/payments/reconciliation`, `revenue`, `promo-codes`, `integrations/*`, `questions/*`, `flags`]
- [x] [Review][Patch] M2 — "New Subject" sidebar button visible to all roles; should be `super_admin` only [`packages/ui/src/components/admin-shell.tsx:93-100`]
- [x] [Review][Defer] M3 — `AdminRolesGuard` fail-open when `@Roles` omitted (pre-existing footgun) [`apps/api/src/admin-auth/guards/admin-roles.guard.ts:16`] — deferred, pre-existing
- [x] [Review][Defer] M4 — No controller-level integration tests for 403 role boundaries; story scoped unit tests only — deferred

## Senior Developer Review (AI)

- **Review outcome:** Changes Requested
- **Review date:** 2026-07-01
- **Severity:** 3 High, 2 Medium, 2 Deferred

### Action Items

- [x] [Review][Patch] H1 — Add `@practice-exam/types` to admin `package.json`
- [x] [Review][Patch] H2 — Rebuild `packages/types`, `packages/ui`, `packages/api-client` (or wire TS project refs)
- [x] [Review][Patch] H3 — Remove broken `import { } from "@practice-exam/ui"` lines
- [x] [Review][Patch] M1 — Extend `AdminRoleGate` to all role-sensitive admin routes
- [x] [Review][Patch] M2 — Hide "New Subject" for non–super-admin roles

## Dev Notes

(See planning artifacts — matrix sourced from PRD addendum.)

## Dev Agent Record

### Implementation Plan

Centralized `ADMIN_PERMISSION_MATRIX` in API; applied `AdminRolesGuard` to subjects, questions, content, mock-exams controllers; A-92 UI + role-based nav via `AdminPageShell` / `hiddenNavItems`.

### Completion Notes

- API enforces finance 403 on editorial approve and editor 403 on Zalo/payment config (existing integrations/payments controllers).
- New tests: `permission-matrix.spec.ts`, `admin-roles.guard.spec.ts` — pass.

**Code review patches (2026-07-01):**
- ✅ H1 — Added `@practice-exam/types` to `apps/admin/package.json`; ran `pnpm install`.
- ✅ H2 — Rebuilt `packages/types`, `packages/api-client`, `packages/ui` so dist exposes `hiddenNavItems`, `showNewSubject`, `settings` nav, `adminGetPermissionMatrix`, `queryKeys.rbac`.
- ✅ H3 — Removed broken `import { } from "@practice-exam/ui"` in payments `revenue`/`reconciliation` pages.
- ✅ M1 — Extended `AdminRoleGate` to all role-sensitive admin routes: payments (revenue, reconciliation, promo-codes), integrations (payments, webhooks), content (questions list + preview, review detail, flags, import), users detail.
- ✅ M2 — Added `showNewSubject` prop to `AdminSidebar`; `AdminPageShell` sets it to `role === "super_admin"`.
- Verification: `admin typecheck` passes; API tests 167/167 pass (previous EPIC-12 spec failures also resolved by the package rebuild).

## File List

- _bmad-output/implementation-artifacts/stories/13-57-rbac-enforcement.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- apps/admin/package.json
- apps/admin/src/components/admin-page-shell.tsx
- apps/admin/src/app/payments/{revenue,reconciliation,promo-codes}/page.tsx
- apps/admin/src/app/integrations/{payments,webhooks}/page.tsx
- apps/admin/src/app/questions/page.tsx
- apps/admin/src/app/questions/[id]/preview/page.tsx
- apps/admin/src/app/questions/import/page.tsx
- apps/admin/src/app/review/[id]/page.tsx
- apps/admin/src/app/flags/page.tsx
- apps/admin/src/app/users/[id]/page.tsx
- apps/api/src/admin-auth/admin-auth.module.ts
- apps/api/src/admin-auth/guards/admin-roles.guard.spec.ts
- apps/api/src/admin-auth/rbac/permission-matrix.ts
- apps/api/src/admin-auth/rbac/permission-matrix.spec.ts
- apps/api/src/admin-auth/rbac/rbac-admin.controller.ts
- apps/api/src/content/content-admin.controller.ts
- apps/api/src/mock-exams/mock-exams-admin.controller.ts
- apps/api/src/questions/import-questions.controller.ts
- apps/api/src/questions/questions-admin.controller.ts
- apps/api/src/subjects/subjects-admin.controller.ts
- apps/admin/src/app/settings/rbac/page.tsx
- apps/admin/src/app/** (AdminPageShell + role gates)
- apps/admin/src/components/admin-page-shell.tsx
- apps/admin/src/components/admin-role-gate.tsx
- apps/admin/src/lib/admin-nav-access.ts
- packages/types/src/index.ts
- packages/api-client/src/index.ts
- packages/ui/src/components/admin-shell.tsx

## Change Log

- 2026-07-01: EPIC-13 story 13-57 — RBAC matrix API, controller guards, A-92 UI, nav role gating

- 2026-07-01: Code review — changes requested (3 High, 2 Medium)
- 2026-07-01: Addressed code review findings — 5 patches applied (H1–H3, M1, M2); typecheck + tests green
- 2026-07-01: Code review re-pass — all patches verified; approved → done

## Status

done
