"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";

import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import { AdminDataTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import { PaymentsSectionTabs } from "@/components/payments-section-tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";

export default function ReconciliationPage() {
  return (
    <AdminRoleGate allowedRoles={["finance", "super_admin"]}>
      <Suspense fallback={<p className="p-8 text-ink-muted">Đang tải...</p>}>
        <ReconciliationContent />
      </Suspense>
    </AdminRoleGate>
  );
}

function ReconciliationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const provider = searchParams.get("provider") ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  const setFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      router.push(`/payments/reconciliation?${params.toString()}`);
    },
    [router, searchParams],
  );

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.paymentsAdmin.reconciliation({ provider, from, to }),
    queryFn: () =>
      adminApi.adminGetReconciliation({
        provider: provider || undefined,
        from: from || undefined,
        to: to || undefined,
      }),
  });

  const rows = data?.data ?? [];

  return (
    <AdminPageShell>
      <PaymentsSectionTabs />

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={provider}
          onChange={(e) => setFilters({ provider: e.target.value })}
          className="rounded-lg border border-outline-variant px-3 py-2"
        >
          <option value="">Tất cả provider</option>
          <option value="payos">PayOS</option>
          <option value="sepay">SePay</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFilters({ from: e.target.value })}
          className="rounded-lg border border-outline-variant px-3 py-2"
          aria-label="Từ ngày"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setFilters({ to: e.target.value })}
          className="rounded-lg border border-outline-variant px-3 py-2"
          aria-label="Đến ngày"
        />
      </div>

      {isLoading && <p className="text-ink-muted">Đang tải...</p>}

      {!isLoading && rows.length === 0 && (
        <p className="text-ink-muted">Không có dữ liệu đối soát.</p>
      )}

      {rows.length > 0 && (
        <AdminDataTable>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày (ICT)</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Giao dịch</TableHead>
              <TableHead>Doanh thu</TableHead>
              <TableHead>Thất bại</TableHead>
              <TableHead>Chờ</TableHead>
              <TableHead>Sai lệch</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${row.provider}-${row.date}`}>
                <TableCell>{row.date}</TableCell>
                <TableCell className="uppercase">{row.provider}</TableCell>
                <TableCell>{row.transactionCount}</TableCell>
                <TableCell>{row.grossRevenueVnd.toLocaleString("vi-VN")} ₫</TableCell>
                <TableCell>{row.failedCount}</TableCell>
                <TableCell>{row.pendingCount}</TableCell>
                <TableCell>
                  {row.discrepancyCount > 0 ? (
                    <span className="font-medium text-error">{row.discrepancyCount}</span>
                  ) : (
                    row.discrepancyCount
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </AdminDataTable>
      )}
    </AdminPageShell>
  );
}
