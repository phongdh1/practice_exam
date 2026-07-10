"use client";

import { AdminRoleGate } from "@/components/admin-role-gate";
import { AdminPageShell } from "@/components/admin-page-shell";
import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import type { EmailNotificationTemplateKey } from "@practice-exam/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SettingsSectionTabs } from "@/components/settings-section-tabs";
import { useEffect, useState } from "react";

const EMAIL_TEMPLATE_LABELS: Record<EmailNotificationTemplateKey, string> = {
  welcome: "Chào mừng đăng ký",
  payment_confirmed: "Xác nhận thanh toán",
  subscription_expiring: "Gói sắp hết hạn",
};

export default function SystemSettingsPage() {
  return (
    <AdminRoleGate allowedRoles={["super_admin"]}>
      <SystemSettingsContent />
    </AdminRoleGate>
  );
}

function SystemSettingsContent() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [disclaimerText, setDisclaimerText] = useState("");
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [emailTemplates, setEmailTemplates] = useState<
    Record<EmailNotificationTemplateKey, { subject: string; body: string }>
  >({
    welcome: { subject: "", body: "" },
    payment_confirmed: { subject: "", body: "" },
    subscription_expiring: { subject: "", body: "" },
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminSystemSettings.all,
    queryFn: () => adminApi.adminGetSystemSettings(),
  });

  const settings = data?.data;

  useEffect(() => {
    if (!settings) return;
    setDisclaimerText(settings.disclaimer.text);
    setMaintenanceEnabled(settings.maintenance.enabled);
    setMaintenanceMessage(settings.maintenance.message);
    setEmailTemplates(settings.emailTemplates);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () =>
      adminApi.adminUpdateSystemSettings({
        disclaimerText,
        maintenance: { enabled: maintenanceEnabled, message: maintenanceMessage },
        emailTemplates,
      }),
    onSuccess: () => {
      setMessage("Đã lưu cài đặt hệ thống.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminSystemSettings.all });
    },
    onError: (err: Error) => setMessage(err.message),
  });

  return (
    <AdminPageShell
      title="Cài đặt hệ thống (A-90)"
      subtitle="Disclaimer, chế độ bảo trì và mẫu email thông báo."
    >
      <SettingsSectionTabs />

      {message && (
        <p className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-body-sm">
          {message}
        </p>
      )}

      {isLoading && <p className="text-ink-muted">Đang tải...</p>}

      {!isLoading && (
        <form
          className="flex flex-col gap-8"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
        >
          <section className="rounded-xl border border-outline-variant p-6">
            <h2 className="mb-4 text-heading font-heading text-primary">Disclaimer nền tảng</h2>
            <textarea
              value={disclaimerText}
              onChange={(e) => setDisclaimerText(e.target.value)}
              rows={4}
              required
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
            <p className="mt-2 text-label text-ink-muted">
              Phiên bản: {settings?.disclaimer.version ?? "default"} — client refetch tối đa 5 phút.
            </p>
          </section>

          <section className="rounded-xl border border-outline-variant p-6">
            <h2 className="mb-4 text-heading font-heading text-primary">Chế độ bảo trì</h2>
            <label className="mb-4 flex items-center gap-2 text-body-sm">
              <input
                type="checkbox"
                checked={maintenanceEnabled}
                onChange={(e) => setMaintenanceEnabled(e.target.checked)}
              />
              Bật bảo trì (chặn luyện thi & thi thử; admin vẫn truy cập)
            </label>
            <textarea
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              rows={3}
              required
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
            />
          </section>

          <section className="rounded-xl border border-outline-variant p-6">
            <h2 className="mb-4 text-heading font-heading text-primary">Mẫu email thông báo</h2>
            <div className="flex flex-col gap-6">
              {(Object.keys(EMAIL_TEMPLATE_LABELS) as EmailNotificationTemplateKey[]).map((key) => (
                <div key={key} className="rounded-lg border border-outline-variant p-4">
                  <h3 className="mb-3 text-label font-bold text-primary">{EMAIL_TEMPLATE_LABELS[key]}</h3>
                  <label className="mb-3 flex flex-col gap-1 text-body-sm">
                    Tiêu đề
                    <input
                      type="text"
                      required
                      value={emailTemplates[key].subject}
                      onChange={(e) =>
                        setEmailTemplates((prev) => ({
                          ...prev,
                          [key]: { ...prev[key], subject: e.target.value },
                        }))
                      }
                      className="rounded-lg border border-outline-variant px-3 py-2"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-body-sm">
                    Nội dung
                    <textarea
                      required
                      rows={3}
                      value={emailTemplates[key].body}
                      onChange={(e) =>
                        setEmailTemplates((prev) => ({
                          ...prev,
                          [key]: { ...prev[key], body: e.target.value },
                        }))
                      }
                      className="rounded-lg border border-outline-variant px-3 py-2"
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>

          <div>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-on-primary disabled:opacity-50"
            >
              Lưu cài đặt
            </button>
          </div>
        </form>
      )}
    </AdminPageShell>
  );
}
