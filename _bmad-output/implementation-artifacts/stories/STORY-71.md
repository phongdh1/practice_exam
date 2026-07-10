---
id: STORY-71
story_key: 13-71-admin-activity-notifications
status: in-progress
baseline_commit: NO_VCS
prd_refs: ["FR-36"]
epic: EPIC-13
---

# STORY-71: Admin activity notifications (polling MVP)

**Epic:** EPIC-13

As an **Admin user**,  
I want **in-app notifications for new registrations and paid payments**,  
So that **I can respond to operational events within ~60 seconds**.

## Acceptance Criteria

- **AC-1:** `GET /admin/notifications/recent?since=` returns registration + paid-payment events, RBAC-gated
- **AC-2:** Bell in admin header with badge count; dropdown feed with Vietnamese copy
- **AC-3:** Links navigate to `/users/[id]` and `/payments`
- **AC-4:** TanStack Query polls every 60s

## Tasks

- [x] API `AdminNotificationsModule` + service spec
- [x] Types + api-client + query key
- [x] `AdminNotificationBell` in `AdminAppFrame`
- [x] Spec: `spec-admin-notifications-polling.md`

## File List

- apps/api/src/admin-notifications/*
- apps/admin/src/components/admin-notification-bell.tsx
- apps/admin/src/components/admin-app-frame.tsx
- packages/types/src/index.ts
- packages/api-client/src/index.ts

## Deferred

- WebSocket/SSE, email, server-side mark-read

### Review Findings

- [ ] [Review][Patch] super_admin merged event cap can drop recent payments when registration volume fills pre-merge budget [`apps/api/src/admin-notifications/admin-notifications.service.ts:29-101`]
- [x] [Review][Defer] No controller RBAC integration test for `/admin/notifications/recent` — deferred, follows 13-60 MVP test-scope pattern
- [x] [Review][Defer] Bell component has no poll error UI — stale feed on API failure is silent [`apps/admin/src/components/admin-notification-bell.tsx:51-55`] — deferred, MVP polling UX
