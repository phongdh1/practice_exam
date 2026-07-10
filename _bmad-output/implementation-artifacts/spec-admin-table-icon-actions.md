# Spec — Admin table UX (padding + icon actions)

**Story:** STORY-72 (`13-72-admin-table-ux-standardization`)  
**Status:** implemented

## packages/ui

- shadcn `Table` primitives — standard cell padding `px-4 py-3`, header `bg-surface-container-low text-label`
- shadcn `Tooltip` + `@radix-ui/react-tooltip`
- `AdminDataTable` — bordered wrapper around table
- `AdminIconAction` — lucide icon-only row action + tooltip + `aria-label`
- `AdminTableActions` — flex container for action column

## Icon map (row actions)

| Action | Icon |
|--------|------|
| Sửa | `Pencil` |
| Xem trước | `Eye` |
| Kích hoạt | `Check` |
| Lưu trữ | `Archive` |
| Hoàn tiền | `Undo2` |
| Hồ sơ | `UserRound` |
| Bật/Tắt promo | `Power` |
| Lên/Xuống reorder | `ArrowUp` / `ArrowDown` |

Toolbar buttons may keep MaterialIcon + text.

## Migrated pages

- Dashboard KPI table, subjects, courses, questions, payments, users, promo-codes, reconciliation, revenue, rbac, admin-users (staff + audit)

## Deferred

- `integrations/webhooks` (expand row + retry — kept MaterialIcon expand)
- `questions/import` error table
- `flags`, `review` (card layouts, not data tables)
