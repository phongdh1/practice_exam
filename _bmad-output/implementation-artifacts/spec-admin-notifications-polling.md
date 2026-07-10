# Spec — Admin activity notifications (polling MVP)

**Story:** STORY-71 (`13-71-admin-activity-notifications`)  
**Status:** implemented  
**Poll interval:** 60s (`ADMIN_NOTIFICATIONS_POLL_MS`)

## API

- `GET /api/v1/admin/notifications/recent?since=<iso8601>`
- RBAC: `super_admin`, `support` (registrations), `finance` (payments)
- Aggregates:
  - `User.createdAt >= since` → type `registration`, title **Người dùng mới đăng ký**, href `/users/[id]`
  - `Payment.status=paid` and `paidAt >= since` → type `payment`, title **Thanh toán mới**, href `/payments`
- Default `since`: 24h ago when omitted
- Max 50 events, sorted by `occurredAt` desc

## Admin UI

- Bell in sticky header (`AdminAppFrame`) for roles with notification access
- Badge = unread count vs `localStorage.admin_notifications_last_seen`
- Dropdown feed with links; opening dropdown marks seen
- TanStack Query `refetchInterval: 60_000`

## Deferred

- WebSocket/SSE, email, mark-read persistence server-side
