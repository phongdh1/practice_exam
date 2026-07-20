"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";

import { adminApi } from "@/lib/admin-api";
import { toastApiError, toastApiSuccess } from "@/lib/admin-toast";
import { queryKeys } from "@practice-exam/api-client";
import { Badge, InternalLink, MaterialIcon } from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, Fragment } from "react";

function formatPayload(payload: unknown): string {
  if (payload == null) return "—";
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

export default function WebhookLogPage() {
  return (
    <AdminRoleGate allowedRoles={["super_admin"]}>
      <WebhookLogContent />
    </AdminRoleGate>
  );
}

function WebhookLogContent() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.integrations.webhooks(50),
    queryFn: () => adminApi.adminListWebhookEvents(50),
  });

  const events = data?.data ?? [];

  const retryMutation = useMutation({
    mutationFn: (eventId: string) => adminApi.adminRetryPaymentWebhook(eventId),
    onSuccess: () => {
      toastApiSuccess("Đã thử lại webhook");
      void queryClient.invalidateQueries({ queryKey: queryKeys.integrations.webhooks(50) });
    },
    onError: (error) => toastApiError(error, "Thử lại webhook thất bại"),
  });

  return (
    <AdminPageShell>
      <div className="mb-4 flex gap-3 text-body-sm">
        <InternalLink href="/integrations/zalo" className="text-primary underline">
          Zalo Mini App (A-80)
        </InternalLink>
        <InternalLink href="/integrations/payments" className="text-primary underline">
          Payment config (A-81)
        </InternalLink>
      </div>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        {isLoading ? (
          <p className="p-6 text-ink-muted">Đang tải...</p>
        ) : events.length === 0 ? (
          <p className="p-6 text-ink-muted">Chưa có sự kiện webhook.</p>
        ) : (
          <table className="w-full text-left text-body-sm">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 w-8" />
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Lỗi</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const isExpanded = expandedId === event.id;
                return (
                  <Fragment key={event.id}>
                    <tr className="border-b border-outline-variant/50">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => setExpandedId(isExpanded ? null : event.id)}
                          className="text-ink-muted hover:text-primary"
                        >
                          <MaterialIcon
                            name={isExpanded ? "expand_less" : "expand_more"}
                            size={18}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(event.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={event.category === "payment" ? "default" : "secondary"}>
                          {event.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{event.provider ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            event.status === "processed"
                              ? "default"
                              : event.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {event.status}
                        </Badge>
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-error">
                        {event.errorMessage ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {event.canRetry && (
                          <button
                            type="button"
                            disabled={retryMutation.isPending}
                            onClick={() => retryMutation.mutate(event.id)}
                            className="flex items-center gap-1 text-primary"
                          >
                            <MaterialIcon name="replay" size={16} />
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-outline-variant/50 bg-surface-container-low/40">
                        <td colSpan={7} className="px-4 py-3">
                          <p className="mb-2 font-medium text-ink-muted">Payload</p>
                          <pre className="max-h-64 overflow-auto rounded-lg border border-outline-variant bg-surface-container-lowest p-3 text-xs whitespace-pre-wrap break-all">
                            {formatPayload(event.payload)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </AdminPageShell>
  );
}
