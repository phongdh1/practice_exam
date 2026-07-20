"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";

import { adminApi } from "@/lib/admin-api";
import { toastApiError, toastApiSuccess } from "@/lib/admin-toast";
import { queryKeys } from "@practice-exam/api-client";
import {
  AdminDataTable,
  AdminIconAction,
  AdminTableActions,
  Badge,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Undo2 } from "lucide-react";
import { PaymentsSectionTabs } from "@/components/payments-section-tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thất bại",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
};

export default function PaymentsPage() {
  return (
    <AdminRoleGate allowedRoles={["finance", "super_admin"]}>
      <Suspense fallback={<p className="p-8 text-ink-muted">Đang tải...</p>}>
        <PaymentsContent />
      </Suspense>
    </AdminRoleGate>
  );
}

function PaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const provider = searchParams.get("provider") ?? "";
  const status = searchParams.get("status") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const [refundId, setRefundId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState("");

  const setFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      if (!updates.page) params.set("page", "1");
      router.push(`/payments?${params.toString()}`);
    },
    [router, searchParams],
  );

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.paymentsAdmin.transactions({ provider, status, from, to, page }),
    queryFn: () =>
      adminApi.adminListPaymentTransactions({
        provider: provider || undefined,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        limit: 20,
      }),
  });

  const refundMutation = useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      adminApi.adminInitiateRefund(paymentId, reason),
    onSuccess: () => {
      setRefundId(null);
      setRefundReason("");
      toastApiSuccess("Đã khởi tạo hoàn tiền");
      void queryClient.invalidateQueries({ queryKey: ["paymentsAdmin"] });
    },
    onError: (error) => toastApiError(error, "Hoàn tiền thất bại"),
  });

  const result = data?.data;
  const items = result?.items ?? [];

  return (
    <AdminPageShell>
      <PaymentsSectionTabs />

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={provider}
          onChange={(e) => setFilters({ provider: e.target.value, page: "1" })}
          className="rounded-lg border border-outline-variant px-3 py-2"
        >
          <option value="">Tất cả provider</option>
          <option value="payos">PayOS</option>
          <option value="sepay">SePay</option>
        </select>
        <select
          value={status}
          onChange={(e) => setFilters({ status: e.target.value, page: "1" })}
          className="rounded-lg border border-outline-variant px-3 py-2"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFilters({ from: e.target.value, page: "1" })}
          className="rounded-lg border border-outline-variant px-3 py-2"
          aria-label="Từ ngày"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setFilters({ to: e.target.value, page: "1" })}
          className="rounded-lg border border-outline-variant px-3 py-2"
          aria-label="Đến ngày"
        />
      </div>

      {isLoading && <p className="text-ink-muted">Đang tải...</p>}

      {!isLoading && items.length === 0 && (
        <p className="text-ink-muted">Không có giao dịch phù hợp.</p>
      )}

      {items.length > 0 && (
        <AdminDataTable>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng / Môn</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Mã ngoài</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  <div className="font-medium">{tx.userDisplayName ?? tx.userId}</div>
                  <div className="text-ink-muted">
                    {tx.subjectName} ({tx.subjectCode})
                  </div>
                </TableCell>
                <TableCell>{tx.amountVnd.toLocaleString("vi-VN")} ₫</TableCell>
                <TableCell>
                  {tx.provider} / {tx.channel}
                </TableCell>
                <TableCell>
                  <Badge variant={tx.status === "paid" ? "secondary" : "outline"}>
                    {STATUS_LABELS[tx.status] ?? tx.status}
                  </Badge>
                  {tx.subscriptionId && (
                    <div className="mt-1 text-label text-ink-muted">Sub: {tx.subscriptionStatus}</div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-label">{tx.externalRef ?? "—"}</TableCell>
                <TableCell>
                  {tx.status === "paid" && (
                    <AdminTableActions>
                      <AdminIconAction
                        icon={Undo2}
                        label="Hoàn tiền"
                        onClick={() => setRefundId(tx.id)}
                      />
                    </AdminTableActions>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </AdminDataTable>
      )}

      {result && result.totalPages > 1 && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setFilters({ page: String(page - 1) })}
            className="rounded border px-3 py-1 disabled:opacity-50"
          >
            Trước
          </button>
          <span className="py-1 text-ink-muted">
            Trang {page} / {result.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= result.totalPages}
            onClick={() => setFilters({ page: String(page + 1) })}
            className="rounded border px-3 py-1 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {refundId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest p-6 shadow-lg">
            <h2 className="text-title-md">Hoàn tiền (A-72)</h2>
            <p className="mt-2 text-body-sm text-ink-muted">Lý do bắt buộc — được ghi audit log.</p>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              className="mt-4 w-full rounded-lg border px-3 py-2"
              rows={3}
              placeholder="Lý do hoàn tiền..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded border px-4 py-2" onClick={() => setRefundId(null)}>
                Hủy
              </button>
              <button
                type="button"
                disabled={!refundReason.trim() || refundMutation.isPending}
                className="rounded bg-primary px-4 py-2 text-on-primary disabled:opacity-50"
                onClick={() =>
                  refundMutation.mutate({ paymentId: refundId, reason: refundReason.trim() })
                }
              >
                Xác nhận hoàn tiền
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}
