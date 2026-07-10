---
id: STORY-59-EPIC13
story_key: 13-59-system-settings
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-46", "FR-15"]
ad_refs: []
---

# 13-59: System settings including disclaimer and maintenance

**Epic:** EPIC-13

As a **Super Admin**,
I want **to configure maintenance mode, disclaimer text, and email templates on A-90**,
So that **global platform behavior can be updated without deploy**.

## Acceptance Criteria

### AC-1: Maintenance mode
**Given** maintenance mode is enabled with a branded message
**When** a candidate starts or continues practice or mock exams
**Then** the API returns maintenance error and candidate surfaces show the message
**And** admin back-office access is unaffected

### AC-2: Disclaimer propagation
**Given** super admin updates disclaimer text
**When** candidates load any disclaimer surface
**Then** updated text is served within 5 minutes (version + client staleTime)

### AC-3: Email templates
**Given** super admin on A-90
**When** they edit email notification templates for key events
**Then** templates are persisted and returned via admin API

### AC-4: RBAC and audit
**Given** any system settings change
**When** saved by super admin
**Then** change is audit-logged in admin auth audit log

## Tasks/Subtasks

- [x] Extend `SettingsService` — disclaimer, maintenance, email templates, cache, audit (AC: #1, #2, #3, #4)
- [x] Admin API `GET/PATCH /admin/system-settings` — super_admin only (AC: #3, #4)
- [x] Public `GET /settings/maintenance` + `MaintenanceGuard` on practice/mock/consume (AC: #1)
- [x] Types + api-client + query keys (AC: #2, #3)
- [x] A-90 page `/settings/system` + sidebar nav (AC: #3)
- [x] Web maintenance gate + disclaimer 5min staleTime (AC: #1, #2)
- [x] Unit tests: settings service, maintenance guard (AC: #1, #4)

### Review Findings

- [x] [Review][Patch] H1 — Zalo mini-app has no `MaintenanceGate`; candidates on Z-90 never see branded maintenance message (API blocks only) [`apps/zalo-mini-app/src/main.tsx`]
- [x] [Review][Patch] M1 — Zalo disclaimer queries lack `SETTINGS_QUERY_STALE_MS`; AC-2 5-minute propagation not applied to Zalo surfaces [`apps/zalo-mini-app/src/main.tsx:133`]
- [x] [Review][Patch] M2 — Web `MaintenanceGate` renders full app while maintenance query is loading; brief flash before maintenance screen [`apps/web/src/components/maintenance-gate.tsx:10`]
- [x] [Review][Defer] M3 — No controller integration test for maintenance 503 on practice/mock paths — story scoped unit tests
- [x] [Review][Defer] M4 — Email templates persisted but not wired to notification sender — AC-3 requires storage/API only

## Senior Developer Review (AI)

- **Review outcome:** Approved (patches applied)
- **Review date:** 2026-07-02
- **Severity:** 1 High, 2 Medium, 2 Deferred

### Action Items

- [x] [Review][Patch] H1 — Add Zalo maintenance gate + public maintenance query
- [x] [Review][Patch] M1 — Apply 5min staleTime to Zalo disclaimer queries
- [x] [Review][Patch] M2 — Block web render until maintenance status resolves

## Dev Notes

- Reuse `system_settings` key-value table; JSON for maintenance and email templates.
- `platform_disclaimer` key already exists from STORY-14.
- Audit via `admin_auth_audit_logs` action `system_setting_updated`.
- Email template keys: `welcome`, `payment_confirmed`, `subscription_expiring`.
- Admin routes under `/admin/system-settings`; public reads under `/settings/*`.

## Dev Agent Record

### Implementation Plan

Extended settings module with admin CRUD, maintenance guard on candidate practice paths, A-90 UI, web maintenance gate.

### Completion Notes

- `SettingsService` handles disclaimer (5min cache), maintenance mode, email templates with defaults.
- `AdminSystemSettingsController` at `/admin/system-settings` (super_admin RBAC + audit).
- `MaintenanceGuard` blocks practice, mock-exam attempts, and free-tier consume when enabled.
- Public `GET /settings/maintenance` for candidate surfaces.
- A-90 UI at `/settings/system` with disclaimer, maintenance toggle, email template editors.
- Web `MaintenanceGate` in providers + `SETTINGS_QUERY_STALE_MS` on disclaimer queries.
- Tests: settings service (7), maintenance guard (2); full API suite 180/180.

## File List

- _bmad-output/implementation-artifacts/stories/13-59-system-settings.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- apps/api/src/settings/**
- apps/api/src/practice/practice.controller.ts
- apps/api/src/practice/practice.module.ts
- apps/api/src/practice/practice.controller.spec.ts
- apps/api/src/mock-exams/mock-exam-attempts.controller.ts
- apps/api/src/mock-exams/mock-exams.module.ts
- apps/api/src/entitlements/entitlements.controller.ts
- apps/api/src/entitlements/entitlements.module.ts
- apps/api/src/entitlements/entitlements.controller.spec.ts
- apps/admin/src/app/settings/system/page.tsx
- apps/admin/src/app/settings/rbac/page.tsx
- apps/admin/src/app/settings/admin-users/page.tsx
- apps/web/src/lib/web-api.ts
- apps/web/src/components/maintenance-gate.tsx
- apps/web/src/app/providers.tsx
- apps/zalo-mini-app/src/lib/zalo-api.ts
- apps/zalo-mini-app/src/components/maintenance-gate.tsx
- apps/zalo-mini-app/src/main.tsx
- packages/types/src/index.ts
- packages/api-client/src/index.ts
- packages/ui/src/components/admin-shell.tsx
- packages/ui/src/components/maintenance-screen.tsx
- packages/ui/src/index.ts

## Change Log

- 2026-07-02: EPIC-13 story 13-59 — system settings API, maintenance guard, A-90 UI, web gate
- 2026-07-02: Code review patches applied — Zalo maintenance gate, disclaimer staleTime, web loading fix

## Status

done
