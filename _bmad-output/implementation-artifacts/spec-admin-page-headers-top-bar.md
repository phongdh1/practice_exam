---
title: 'Admin page headers in top bar'
type: 'feature'
created: '2026-07-13'
status: 'done'
route: 'one-shot'
---

# Admin page headers in top bar

## Intent

**Problem:** Admin pages rendered title/subtitle inside `AdminPageShell`, duplicating layout and separating page identity from the sticky top bar (notifications).

**Approach:** Extend `resolveAdminTopHeader(pathname)` to cover all authenticated admin routes; render headers in `admin-app-frame.tsx`; simplify `AdminPageShell` to a padded content wrapper only.

## Routes covered

| Path pattern | Title |
|---|---|
| `/` | Tổng quan hệ thống (A-10) |
| `/questions` | Ngân hàng câu hỏi |
| `/questions/new` | Tạo câu hỏi |
| `/questions/import` | Import hàng loạt |
| `/questions/[id]/edit` | Sửa câu hỏi |
| `/questions/[id]/preview` | Xem trước câu hỏi |
| `/review` | Hàng đợi biên tập |
| `/review/[id]` | Chi tiết duyệt |
| `/flags` | Báo cáo từ thí sinh |
| `/subjects` | Môn học |
| `/subjects/new` | Tạo môn học |
| `/subjects/[id]` | Sửa môn học |
| `/courses` | Khóa học |
| `/courses/new` | Tạo khóa học |
| `/courses/[id]` | Sửa khóa học |
| `/users` | Tìm kiếm người dùng |
| `/users/[id]` | Hồ sơ người dùng (static fallback) |
| `/payments` | Nhật ký giao dịch |
| `/payments/reconciliation` | Đối soát provider |
| `/payments/revenue` | Báo cáo doanh thu |
| `/payments/promo-codes` | Mã khuyến mãi |
| `/integrations/webhooks` | A-83 — Webhook event log |
| `/integrations/payments` | A-81 — Payment providers |
| `/integrations/zalo` | A-80 — Zalo Mini App |
| `/settings`, `/settings/rbac` | Ma trận phân quyền (A-92) |
| `/settings/admin-users` | Quản lý admin (A-91) |
| `/settings/system` | Cài đặt hệ thống (A-90) |

## Partial migration note

`/users/[id]` previously showed dynamic title (`displayName`) and subtitle (`Hồ sơ hỗ trợ (A-61) · {userId}`) after profile load. Pathname resolver uses static loading-state copy; dynamic override would need a future context hook if required.

## Suggested Review Order

- Pathname → header resolver
  [`admin-nav.ts:44`](../../apps/admin/src/lib/admin-nav.ts#L44)

- Sticky top bar rendering
  [`admin-app-frame.tsx:39`](../../apps/admin/src/components/admin-app-frame.tsx#L39)

- Simplified page shell
  [`admin-page-shell.tsx:1`](../../apps/admin/src/components/admin-page-shell.tsx#L1)
