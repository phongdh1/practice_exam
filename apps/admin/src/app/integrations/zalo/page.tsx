"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";

import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import { Badge, MaterialIcon } from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function ZaloIntegrationPage() {
  return (
    <AdminRoleGate allowedRoles={["super_admin"]}>
      <ZaloIntegrationContent />
    </AdminRoleGate>
  );
}

function ZaloIntegrationContent() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.integrations.zalo,
    queryFn: () => adminApi.adminGetZaloConfig(),
  });

  const config = data?.data;
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [callbackUrl, setCallbackUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: () =>
      adminApi.adminUpdateZaloConfig({
        appId: appId || config?.appId || "",
        appSecret: appSecret || undefined,
        callbackUrl: callbackUrl || config?.callbackUrl || undefined,
      }),
    onSuccess: () => {
      setMessage("Đã lưu cấu hình Zalo Mini App.");
      setAppSecret("");
      void queryClient.invalidateQueries({ queryKey: queryKeys.integrations.zalo });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => adminApi.adminVerifyZaloConfig(),
    onSuccess: (res) => {
      const status = res.data.deploymentStatus;
      setMessage(
        status === "verified"
          ? "Xác thực thành công."
          : `Xác thực thất bại: ${res.data.diagnosticError ?? "Không rõ lỗi"}`,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.integrations.zalo });
    },
  });

  const statusVariant =
    config?.deploymentStatus === "verified"
      ? "default"
      : config?.deploymentStatus === "invalid"
        ? "destructive"
        : "secondary";

  return (
    <AdminPageShell
      title="A-80 — Zalo Mini App"
      subtitle="Cấu hình App ID, secret và trạng thái triển khai (Super Admin)."
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {message && (
          <p className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-body-sm">
            {message}
          </p>
        )}

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-heading font-heading text-primary">Trạng thái triển khai</h2>
            {config && (
              <Badge variant={statusVariant}>{config.deploymentStatus}</Badge>
            )}
          </div>

          {isLoading ? (
            <p className="text-ink-muted">Đang tải...</p>
          ) : (
            <dl className="grid gap-3 text-body-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">App ID</dt>
                <dd>{config?.appId ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">App Secret</dt>
                <dd>{config?.appSecretMasked ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Callback URL</dt>
                <dd>{config?.callbackUrl ?? "—"}</dd>
              </div>
              {config?.diagnosticError && (
                <div className="rounded-lg bg-error/10 p-3 text-error">
                  Chẩn đoán: {config.diagnosticError}
                </div>
              )}
            </dl>
          )}
        </section>

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <h2 className="mb-4 text-heading font-heading text-primary">Cập nhật cấu hình</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-label text-ink-muted">App ID</span>
              <input
                className="mt-1 w-full rounded-lg border border-outline px-3 py-2"
                placeholder={config?.appId ?? "Nhập App ID"}
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-label text-ink-muted">App Secret</span>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-outline px-3 py-2"
                placeholder={config?.appSecretMasked ? "Giữ nguyên hoặc nhập mới" : "Nhập App Secret"}
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-label text-ink-muted">Callback URL (tuỳ chọn)</span>
              <input
                className="mt-1 w-full rounded-lg border border-outline px-3 py-2"
                placeholder={config?.callbackUrl ?? "https://..."}
                value={callbackUrl}
                onChange={(e) => setCallbackUrl(e.target.value)}
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-on-primary"
              >
                <MaterialIcon name="save" size={18} />
                Lưu cấu hình
              </button>
              <button
                type="button"
                disabled={verifyMutation.isPending}
                onClick={() => verifyMutation.mutate()}
                className="flex items-center gap-2 rounded-lg border border-outline px-4 py-2"
              >
                <MaterialIcon name="verified" size={18} />
                Kiểm tra credentials
              </button>
            </div>
          </div>
        </section>
      </div>
    </AdminPageShell>
  );
}
