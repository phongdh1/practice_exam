import type { AdminRole } from "@prisma/client";

export type PermissionCapability =
  | "subject_crud_pricing"
  | "question_crud_draft"
  | "editorial_approve_reject"
  | "mock_exam_template"
  | "user_search_profile"
  | "manual_subscription_grant"
  | "account_merge_override"
  | "payment_log_reconciliation"
  | "refunds"
  | "promo_codes"
  | "zalo_payment_config"
  | "system_settings"
  | "rbac_admin_users";

export interface PermissionMatrixRow {
  capability: PermissionCapability;
  labelVi: string;
  labelEn: string;
  roles: Record<AdminRole, boolean>;
}

const ALL_ROLES: AdminRole[] = [
  "super_admin",
  "editor",
  "reviewer",
  "support",
  "finance",
];

function row(
  capability: PermissionCapability,
  labelVi: string,
  labelEn: string,
  allowed: AdminRole[],
): PermissionMatrixRow {
  const allowedSet = new Set(allowed);
  const roles = Object.fromEntries(
    ALL_ROLES.map((role) => [role, allowedSet.has(role)]),
  ) as Record<AdminRole, boolean>;
  return { capability, labelVi, labelEn, roles };
}

/** Canonical MVP permission matrix — mirrors PRD addendum § RBAC Permission Matrix. */
export const ADMIN_PERMISSION_MATRIX: PermissionMatrixRow[] = [
  row("subject_crud_pricing", "Quản lý môn & giá", "Subject CRUD & pricing", ["super_admin"]),
  row("question_crud_draft", "Soạn câu hỏi (nháp)", "Question CRUD (Draft)", [
    "super_admin",
    "editor",
  ]),
  row("editorial_approve_reject", "Duyệt / từ chối biên tập", "Editorial approve/reject", [
    "super_admin",
    "reviewer",
  ]),
  row("mock_exam_template", "Mẫu đề thi thử", "Mock Exam Template", ["super_admin"]),
  row("user_search_profile", "Tra cứu hồ sơ người dùng", "User search / profile", [
    "super_admin",
    "support",
  ]),
  row(
    "manual_subscription_grant",
    "Cấp gói đăng ký thủ công",
    "Manual Subscription grant",
    ["super_admin", "support"],
  ),
  row("account_merge_override", "Gộp tài khoản (override)", "Account merge override", [
    "super_admin",
    "support",
  ]),
  row(
    "payment_log_reconciliation",
    "Nhật ký & đối soát thanh toán",
    "Payment log & reconciliation",
    ["super_admin", "finance"],
  ),
  row("refunds", "Hoàn tiền", "Refunds", ["super_admin", "finance"]),
  row("promo_codes", "Mã khuyến mãi", "Promo codes", ["super_admin", "finance"]),
  row("zalo_payment_config", "Cấu hình Zalo / cổng thanh toán", "Zalo / payment config", [
    "super_admin",
  ]),
  row("system_settings", "Cài đặt hệ thống", "System settings", ["super_admin"]),
  row("rbac_admin_users", "Quản lý admin & RBAC", "RBAC admin users", ["super_admin"]),
];

export function roleHasCapability(role: AdminRole, capability: PermissionCapability): boolean {
  const matrixRow = ADMIN_PERMISSION_MATRIX.find((r) => r.capability === capability);
  return matrixRow?.roles[role] ?? false;
}

export function getPermissionMatrixView() {
  return {
    roles: ALL_ROLES,
    capabilities: ADMIN_PERMISSION_MATRIX,
    source: "prd-Practice_Exam-2026-06-29/addendum.md#rbac-permission-matrix-mvp",
  };
}
