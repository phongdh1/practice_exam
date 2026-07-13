"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";

import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import type { PaymentMerchantConfigView } from "@practice-exam/types";
import { Badge, InternalLink, MaterialIcon } from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

function MerchantForm({
  config,
  provider,
}: {
  config: PaymentMerchantConfigView;
  provider: "payos" | "sepay";
}) {
  const queryClient = useQueryClient();
  const [merchantId, setMerchantId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [checksumKey, setChecksumKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [testMode, setTestMode] = useState(config.testMode);
  const [testPaymentId, setTestPaymentId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: () =>
      adminApi.adminUpdatePaymentMerchant(provider, {
        merchantId: merchantId || config.merchantId || "",
        apiKey: apiKey || undefined,
        checksumKey: checksumKey || undefined,
        webhookSecret: webhookSecret || undefined,
        testMode,
      }),
    onSuccess: () => {
      setMessage("Đã lưu cấu hình merchant.");
      setApiKey("");
      setChecksumKey("");
      setWebhookSecret("");
      void queryClient.invalidateQueries({ queryKey: queryKeys.integrations.payments });
    },
  });

  const testWebhookMutation = useMutation({
    mutationFn: () => adminApi.adminTestPaymentWebhook(provider, testPaymentId),
    onSuccess: () => setMessage("Đã gửi webhook thử nghiệm."),
  });

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-heading font-heading text-primary uppercase">{provider}</h2>
        <Badge variant={config.configured ? "default" : "secondary"}>
          {config.configured ? "Đã cấu hình" : "Chưa cấu hình"}
        </Badge>
      </div>

      {message && <p className="mb-4 text-body-sm text-ink-muted">{message}</p>}

      <dl className="mb-4 grid gap-2 text-body-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Webhook URL</dt>
          <dd className="break-all text-right font-mono text-xs">{config.webhookUrl}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Test mode</dt>
          <dd>{config.testMode ? "Bật" : "Tắt"}</dd>
        </div>
      </dl>

      <div className="space-y-3">
        <input
          className="w-full rounded-lg border border-outline px-3 py-2"
          placeholder={config.merchantId ?? "Merchant ID"}
          value={merchantId}
          onChange={(e) => setMerchantId(e.target.value)}
        />
        <input
          type="password"
          className="w-full rounded-lg border border-outline px-3 py-2"
          placeholder={config.apiKeyMasked ? `API key (${config.apiKeyMasked})` : "API key"}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <input
          type="password"
          className="w-full rounded-lg border border-outline px-3 py-2"
          placeholder="Checksum key (tuỳ chọn)"
          value={checksumKey}
          onChange={(e) => setChecksumKey(e.target.value)}
        />
        <input
          type="password"
          className="w-full rounded-lg border border-outline px-3 py-2"
          placeholder="Webhook secret (tuỳ chọn)"
          value={webhookSecret}
          onChange={(e) => setWebhookSecret(e.target.value)}
        />
        <label className="flex items-center gap-2 text-body-sm">
          <input
            type="checkbox"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
          />
          Test mode — thanh toán không kích hoạt Subscription production
        </label>
        <button
          type="button"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-on-primary"
        >
          <MaterialIcon name="save" size={18} />
          Lưu {provider}
        </button>
      </div>

      <div className="mt-6 border-t border-outline-variant pt-4">
        <p className="mb-2 text-label text-ink-muted">Thử webhook từ admin</p>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-outline px-3 py-2 font-mono text-sm"
            placeholder="Payment ID"
            value={testPaymentId}
            onChange={(e) => setTestPaymentId(e.target.value)}
          />
          <button
            type="button"
            disabled={!testPaymentId || testWebhookMutation.isPending}
            onClick={() => testWebhookMutation.mutate()}
            className="rounded-lg border border-outline px-4 py-2"
          >
            Gửi test
          </button>
        </div>
      </div>
    </section>
  );
}

export default function PaymentIntegrationsPage() {
  return (
    <AdminRoleGate allowedRoles={["super_admin"]}>
      <PaymentIntegrationsContent />
    </AdminRoleGate>
  );
}

function PaymentIntegrationsContent() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.integrations.payments,
    queryFn: () => adminApi.adminGetPaymentMerchants(),
  });

  const merchants = data?.data;

  return (
    <AdminPageShell>
      <div className="mb-4 flex gap-3 text-body-sm">
        <InternalLink href="/integrations/zalo" className="text-primary underline">
          Zalo Mini App (A-80)
        </InternalLink>
        <InternalLink href="/integrations/webhooks" className="text-primary underline">
          Webhook log (A-83)
        </InternalLink>
      </div>

      {isLoading || !merchants ? (
        <p className="text-ink-muted">Đang tải...</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <MerchantForm config={merchants.payos} provider="payos" />
          <MerchantForm config={merchants.sepay} provider="sepay" />
        </div>
      )}
    </AdminPageShell>
  );
}
