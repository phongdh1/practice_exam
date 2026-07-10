"use client";

import { AdminRoleGate } from "@/components/admin-role-gate";
import { AdminPageShell } from "@/components/admin-page-shell";
import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import type { AdminRoleType } from "@practice-exam/types";
import {
  AdminDataTable,
  MaterialIcon,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@practice-exam/ui";
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
            <AdminDataTable className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Chức năng</TableHead>
                  {matrix.roles.map((role) => (
                    <TableHead key={role} className="text-center">
                      {ROLE_LABELS[role]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {matrix.capabilities.map((row) => (
                  <TableRow key={row.capability}>
                    <TableCell>
                      <span className="font-medium text-on-surface">{row.labelVi}</span>
                      <span className="mt-0.5 block text-label text-ink-muted">{row.labelEn}</span>
                    </TableCell>
                    {matrix.roles.map((role) => (
                      <TableCell key={role} className="text-center">
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
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </AdminDataTable>
          </div>
        )}
      </AdminPageShell>
    </AdminRoleGate>
  );
}
