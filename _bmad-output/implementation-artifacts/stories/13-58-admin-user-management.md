---
id: STORY-58-EPIC13
story_key: 13-58-admin-user-management
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-45"]
ad_refs: []
---

# 13-58: Admin user management

**Epic:** EPIC-13

As a **Super Admin**,
I want **to create, disable, and assign roles to admin users on A-91**,
So that **back-office access is controlled and auditable**.

## Acceptance Criteria

### AC-1: Create admin users
**Given** a super admin on A-91
**When** they create an admin with email (username) + password + role
**Then** the user is persisted and can sign in

### AC-2: Disable blocks login
**Given** an admin user is disabled
**When** they attempt login
**Then** login fails with invalid credentials (same as wrong password)

### AC-3: Role changes on next login
**Given** an admin's role is updated
**When** they log in again
**Then** JWT contains the new role

### AC-4: Login audit log
**Given** any admin login attempt
**When** success or failure occurs
**Then** event is written to admin auth audit log viewable by super admin

## Tasks/Subtasks

- [x] Add `AdminAuthAuditLog` model + migration (AC: #4)
- [x] `AdminUsersService` + `AdminUsersController` at `/admin/admin-users` — super_admin only (AC: #1, #2, #3)
- [x] Log login success/failure in `AdminAuthService.login` (AC: #2, #4)
- [x] Types + api-client methods (AC: #1)
- [x] A-91 page `/settings/admin-users` — list, create, disable, role assign (AC: #1, #4)
- [x] Unit tests: admin-users service + login audit (AC: #2, #4)

### Review Findings

- [x] [Review][Patch] H1 — `updateStaff` audit logs raw `dto` including plaintext `password` if password reset used [`apps/api/src/admin-users/admin-users.service.ts:119`]
- [x] [Review][Patch] H2 — Disabled login audit records `adminId: null` instead of the disabled user's id [`apps/api/src/admin-auth/admin-auth.service.ts:42-45`]
- [x] [Review][Patch] M1 — `createStaff` audit uses `adminId: null`; should use `created.id` [`apps/api/src/admin-users/admin-users.service.ts:63`]
- [x] [Review][Patch] M2 — A-91 audit table only renders `details.reason`; management events (`admin_user_created/updated`) show "—" [`apps/admin/src/app/settings/admin-users/page.tsx:277`]
- [x] [Review][Patch] M3 — Sidebar settings link points only to RBAC (A-92); no nav entry for Admin Users (A-91) [`packages/ui/src/components/admin-shell.tsx:85-92`]
- [x] [Review][Defer] M4 — `logLoginEvent` on `AdminUsersService` is unused dead code — deferred
- [x] [Review][Defer] M5 — No controller-level integration test for disabled-login 403 path — story scoped unit tests

## Senior Developer Review (AI)

- **Review outcome:** Approved (patches applied)
- **Review date:** 2026-07-02
- **Severity:** 2 High, 3 Medium, 2 Deferred

### Action Items

- [x] [Review][Patch] H1 — Redact password from audit `changes` payload
- [x] [Review][Patch] H2 — Set `adminId` on disabled-login audit entries
- [x] [Review][Patch] M1 — Use `created.id` for `admin_user_created` audit row
- [x] [Review][Patch] M2 — Render management-event details in audit table
- [x] [Review][Patch] M3 — Add A-91 nav link in settings sidebar

## Dev Notes

- `AdminUser.username` stores normalized email; seeded admin uses username `admin`.
- Role changes take effect on next login (JWT embeds role at sign-in).
- Candidate user admin API lives at `/admin/users` — use `/admin/admin-users` for back-office staff.

## Dev Agent Record

### Implementation Plan

`AdminAuthAuditLog` table; `AdminUsersModule` with CRUD + audit list; login events in `AdminAuthService`; A-91 UI with staff table and login log.

### Completion Notes

- Created admin staff at `/admin/admin-users` (super_admin RBAC).
- Disabled login returns generic invalid credentials + audit `reason: disabled`.
- Role updates apply on next JWT issuance.
- Tests: `admin-users.service.spec.ts` (4), `admin-auth.service.spec.ts` (+2 audit cases); full suite 172/172.

## File List

- _bmad-output/implementation-artifacts/stories/13-58-admin-user-management.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- apps/api/prisma/schema.prisma
- apps/api/prisma/migrations/20260702180000_admin_auth_audit/migration.sql
- apps/api/src/admin-users/**
- apps/api/src/admin-auth/admin-auth.service.ts
- apps/api/src/admin-auth/admin-auth.service.spec.ts
- apps/api/src/app.module.ts
- apps/admin/src/app/settings/admin-users/page.tsx
- apps/admin/src/app/settings/rbac/page.tsx
- packages/types/src/index.ts
- packages/api-client/src/index.ts

## Change Log

- 2026-07-02: EPIC-13 story 13-58 — admin user management API + A-91 UI + login audit
- 2026-07-02: Code review patches applied — audit fixes, sidebar nav, UI audit details

## Status

done
