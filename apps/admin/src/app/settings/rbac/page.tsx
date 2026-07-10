"use client";

import { AdminRoleGate } from "@/components/admin-role-gate";
import { AdminPageShell } from "@/components/admin-page-shell";
import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import type { AdminRoleType } from "@practice-exam/types";
import { MaterialIcon } from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import { SettingsSectionTabs } from "@/components/settings-section-tabs";

const ROLE_LABELS: Record<AdminRoleType, string> = {
  super_admin: "Super Admin",
  editor: "Content Editor",
  reviewer: "Reviewer",
  support: "Support",
  finance: "Finance",
};

export default function RbacPermissionMatrixPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.rbac.permissionMatrix,
    queryFn: () => adminApi.adminGetPermissionMatrix(),
  });

  const matrix = data?.data;

  return (
    <AdminRoleGate allowedRoles={["super_admin"]}>
      <AdminPageShell
        title="Ma trận phân quyền (A-92)"
        subtitle="Tham chiếu read-only theo PRD — API thực thi RBAC trên mọi endpoint."
      >
        <SettingsSectionTabs />

      {isLoading && (
          <p className="text-body text-ink-muted">Đang tải ma trận phân quyền...</p>
        )}
        {error && (
          <p className="text-body text-error">Không thể tải ma trận phân quyền.</p>
        )}
        {matrix && (
          <div className="space-y-4">
            <p className="text-body-sm text-ink-muted">
              Nguồn: <code className="text-label">{matrix.source}</code>
            </p>
            <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
              <table className="w-full min-w-[720px] border-collapse text-left text-body-sm">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    <th className="px-4 py-3 font-heading text-label text-on-surface-variant">
                      Chức năng
                    </th>
                    {matrix.roles.map((role) => (
                      <th
                        key={role}
                        className="px-3 py-3 text-center font-heading text-label text-on-surface-variant"
                      >
                        {ROLE_LABELS[role]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.capabilities.map((row) => (
                    <tr
                      key={row.capability}
                      className="border-b border-outline-variant last:border-0"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-on-surface">{row.labelVi}</span>
                        <span className="mt-0.5 block text-label text-ink-muted">{row.labelEn}</span>
                      </td>
                      {matrix.roles.map((role) => (
                        <td key={role} className="px-3 py-3 text-center">
                          {row.roles[role] ? (
                            <MaterialIcon
                              name="check_circle"
                              size={22}
                              className="inline text-success"
                              filled
                            />
                          ) : (
                            <span className="text-ink-muted">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AdminPageShell>
    </AdminRoleGate>
  );
}
