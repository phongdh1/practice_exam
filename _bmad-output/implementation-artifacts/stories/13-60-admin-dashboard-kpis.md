---
id: STORY-60-EPIC13
story_key: 13-60-admin-dashboard-kpis
status: done
baseline_commit: NO_VCS
prd_refs: []
ad_refs: []
---

# 13-60: Admin dashboard KPIs

**Epic:** EPIC-13

As a **Platform Admin**,
I want **to view operational KPIs on A-10 dashboard**,
So that **I can monitor subscriptions, revenue, and content pipeline health**.

## Acceptance Criteria

### AC-1: Active subscriptions per subject
**Given** an admin with subscription visibility (super_admin, support)
**When** they open A-10 dashboard
**Then** active subscription counts are shown grouped by Subject

### AC-2: Monthly revenue snapshot
**Given** an admin with finance visibility (super_admin, finance)
**When** they open A-10 dashboard
**Then** current-month confirmed payment revenue total is shown

### AC-3: Content queue depth
**Given** an admin with editorial visibility (super_admin, reviewer)
**When** they open A-10 dashboard
**Then** counts for editorial pending (`in_review`) and open flagged questions are shown

### AC-4: Refresh and RBAC
**Given** any dashboard KPI request
**When** data is served
**Then** aggregates refresh within 5 minutes (server cache) and sections are omitted per role RBAC

## Tasks/Subtasks

- [x] `AdminDashboardService` + `GET /admin/dashboard/kpis` with role-filtered sections (AC: #1–#4)
- [x] Types + api-client + query keys with 5min staleTime (AC: #4)
- [x] Wire A-10 `/` dashboard page to live KPIs; hide cards by role (AC: #1–#3)
- [x] Unit tests: dashboard service aggregation + RBAC filtering (AC: #4)

### Review Findings

- [x] [Review][Patch] M1 — `generatedAt` is always `new Date()` even when serving cached aggregates; UI timestamp misrepresents data freshness [`admin-dashboard.service.ts:56`]
- [x] [Review][Patch] M2 — Dashboard shows "Không có KPI cho vai trò" on API errors (401/403/network), masking auth failures [`apps/admin/src/app/page.tsx:46`]
- [x] [Review][Defer] M3 — No controller integration test for `/admin/dashboard/kpis` RBAC boundaries — story scoped unit tests
- [x] [Review][Defer] M4 — In-memory KPI cache not shared across API instances — acceptable for MVP single-instance deploy

## Senior Developer Review (AI)

- **Review outcome:** Approved
- **Review date:** 2026-07-02
- **Severity:** 0 High, 2 Medium (patched), 2 Deferred

### Action Items

- [x] [Review][Patch] M1 — Return `generatedAt` from cache timestamp, not request time
- [x] [Review][Patch] M2 — Distinguish query error vs empty role KPIs in A-10 UI

## Dev Notes

- Reuse `PaymentsAdminService.getRevenueReport` for current ICT month revenue (paid only).
- Active subscription = `status: active` AND `periodEnd > now`.
- Editorial pending = `Question.status === in_review`; flagged = `QuestionFlag` not `resolved`.
- RBAC mapping: subscriptions → `manual_subscription_grant`; revenue → `payment_log_reconciliation`; content → `editorial_approve_reject`.
- Scaffold dashboard at `apps/admin/src/app/page.tsx` already exists — replace placeholder KPIs.

## Dev Agent Record

### Implementation Plan

New `admin-dashboard` module; aggregate KPIs with 5min cache; role-filter response; wire admin home page.

### Completion Notes

- `GET /admin/dashboard/kpis` returns role-filtered KPI sections with 5min server cache.
- Subscriptions grouped by subject; monthly revenue via paid payments ICT month; content queue counts.
- A-10 dashboard wired with live cards, per-subject table, links to revenue/review/flags.
- Tests: `admin-dashboard.service.spec.ts` (5 cases); full API suite 184/184.
- Code review patches: M1 `generatedAt` from oldest cache timestamp; M2 error vs empty-role UI states.

## File List

- _bmad-output/implementation-artifacts/stories/13-60-admin-dashboard-kpis.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- apps/api/src/admin-dashboard/**
- apps/api/src/app.module.ts
- apps/admin/src/app/page.tsx
- packages/types/src/index.ts
- packages/api-client/src/index.ts

## Change Log

- 2026-07-02: EPIC-13 story 13-60 — admin dashboard KPI API + A-10 UI
- 2026-07-02: Code review — changes requested (2 Medium)
- 2026-07-02: Code review patches applied (M1, M2) — approved

## Status

done
