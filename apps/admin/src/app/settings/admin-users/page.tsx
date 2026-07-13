"use client";

import { AdminRoleGate } from "@/components/admin-role-gate";
import { AdminPageShell } from "@/components/admin-page-shell";
import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import type { AdminAuthAuditEntry, AdminRoleType } from "@practice-exam/types";
import {
  AdminDataTable,
  AdminIconAction,
  AdminTableActions,
  Badge,
  MaterialIcon,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SettingsSectionTabs } from "@/components/settings-section-tabs";
import { Power } from "lucide-react";
import { useState } from "react";

const ROLES: { value: AdminRoleType; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "editor", label: "Content Editor" },
  { value: "reviewer", label: "Reviewer" },
  { value: "support", label: "Support" },
  { value: "finance", label: "Finance" },
];

function formatAuditDetails(entry: AdminAuthAuditEntry): string {
  if (!entry.details) return "—";
  if (entry.details.reason) return String(entry.details.reason);
  if (entry.action === "admin_user_created") {
    const role = entry.details.role ? String(entry.details.role) : "?";
    const actor = entry.details.actorUsername ? String(entry.details.actorUsername) : "?";
    return `role: ${role} · by ${actor}`;
  }
  if (entry.action === "admin_user_updated") {
    const changes = entry.details.changes as Record<string, unknown> | undefined;
    const actor = entry.details.actorUsername ? String(entry.details.actorUsername) : "?";
    if (!changes || Object.keys(changes).length === 0) return `by ${actor}`;
    const parts = Object.entries(changes).map(([key, value]) => `${key}: ${String(value)}`);
    return `${parts.join(", ")} · by ${actor}`;
  }
  if (entry.action === "system_setting_updated") {
    const changes = entry.details.changes as Record<string, unknown> | undefined;
    const actor = entry.details.actorUsername ? String(entry.details.actorUsername) : "?";
    const keys = changes ? Object.keys(changes).join(", ") : "?";
    return `settings: ${keys} · by ${actor}`;
  }
  return JSON.stringify(entry.details);
}

export default function AdminUsersManagementPage() {
  return (
    <AdminRoleGate allowedRoles={["super_admin"]}>
      <AdminUsersManagementContent />
    </AdminRoleGate>
  );
}

function AdminUsersManagementContent() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
    displayName: "",
    role: "editor" as AdminRoleType,
  });
  const [message, setMessage] = useState<string | null>(null);

  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: queryKeys.adminStaff.list,
    queryFn: () => adminApi.adminListStaffUsers(),
  });

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: queryKeys.adminStaff.authAudit(50),
    queryFn: () => adminApi.adminListAdminAuthAudit(50),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.adminCreateStaffUser({
        username: form.username,
        password: form.password,
        role: form.role,
        displayName: form.displayName || undefined,
      }),
    onSuccess: () => {
      setShowForm(false);
      setForm({ username: "", password: "", displayName: "", role: "editor" });
      setMessage("Đã tạo tài khoản admin.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminStaff.list });
      void queryClient.invalidateQueries({ queryKey: ["adminStaff", "authAudit"] });
    },
    onError: (err: Error) => setMessage(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: { role?: AdminRoleType; isDisabled?: boolean };
    }) => adminApi.adminUpdateStaffUser(id, input),
    onSuccess: () => {
      setMessage("Đã cập nhật tài khoản.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminStaff.list });
    },
    onError: (err: Error) => setMessage(err.message),
  });

  const staff = staffData?.data ?? [];
  const audit = auditData?.data ?? [];

  return (
    <AdminPageShell>
      <SettingsSectionTabs />

      {message && (
        <p className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-body-sm">
          {message}
        </p>
      )}

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-primary px-4 py-2 text-on-primary"
        >
          {showForm ? "Đóng form" : "Tạo admin mới"}
        </button>
      </div>

      {showForm && (
        <form
          className="mb-8 grid gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <label className="flex flex-col gap-1 text-body-sm">
            Email (username)
            <input
              type="email"
              required
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              className="rounded-lg border border-outline-variant px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-body-sm">
            Mật khẩu (tối thiểu 8 ký tự)
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="rounded-lg border border-outline-variant px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-body-sm">
            Tên hiển thị
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              className="rounded-lg border border-outline-variant px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-body-sm">
            Vai trò
            <select
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({ ...f, role: e.target.value as AdminRoleType }))
              }
              className="rounded-lg border border-outline-variant px-3 py-2"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-on-primary disabled:opacity-50"
            >
              Tạo tài khoản
            </button>
          </div>
        </form>
      )}

      <section className="mb-10">
        <h2 className="mb-4 text-heading font-heading text-primary">Danh sách admin</h2>
        {staffLoading && <p className="text-ink-muted">Đang tải...</p>}
        {!staffLoading && (
          <AdminDataTable className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[60px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-label">{user.username}</TableCell>
                  <TableCell>{user.displayName ?? "—"}</TableCell>
                  <TableCell>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        updateMutation.mutate({
                          id: user.id,
                          input: { role: e.target.value as AdminRoleType },
                        })
                      }
                      className="rounded border border-outline-variant px-2 py-1"
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isDisabled ? "destructive" : "secondary"}>
                      {user.isDisabled ? "Vô hiệu" : "Hoạt động"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AdminTableActions>
                      <AdminIconAction
                        icon={Power}
                        label={user.isDisabled ? "Kích hoạt" : "Vô hiệu hóa"}
                        onClick={() =>
                          updateMutation.mutate({
                            id: user.id,
                            input: { isDisabled: !user.isDisabled },
                          })
                        }
                      />
                    </AdminTableActions>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </AdminDataTable>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-heading font-heading text-primary">Nhật ký xác thực & quản trị</h2>
        {auditLoading && <p className="text-ink-muted">Đang tải...</p>}
        {!auditLoading && (
          <AdminDataTable className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Sự kiện</TableHead>
                <TableHead>Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-label text-ink-muted">
                    {new Date(entry.createdAt).toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell className="font-mono">{entry.username ?? "—"}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      {entry.action === "admin_login_success" ? (
                        <MaterialIcon name="check_circle" size={16} className="text-success" />
                      ) : (
                        <MaterialIcon name="cancel" size={16} className="text-error" />
                      )}
                      {entry.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-label text-ink-muted">
                    {formatAuditDetails(entry)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </AdminDataTable>
        )}
      </section>
    </AdminPageShell>
  );
}
