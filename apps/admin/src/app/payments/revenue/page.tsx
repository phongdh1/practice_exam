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

export default function RevenuePage() {
  return (
    <AdminRoleGate allowedRoles={["finance", "super_admin"]}>
      <Suspense fallback={<p className="p-8 text-ink-muted">Đang tải...</p>}>
        <RevenueContent />
      </Suspense>
    </AdminRoleGate>
  );
}

function RevenueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  const setFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      router.push(`/payments/revenue?${params.toString()}`);
    },
    [router, searchParams],
  );

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.paymentsAdmin.revenue({ from, to }),
    queryFn: () =>
      adminApi.adminGetRevenueReport({
        from: from || undefined,
        to: to || undefined,
      }),
  });

  const report = data?.data;

  const handleExport = async () => {
    const blob = await adminApi.adminExportRevenueReport({
      from: from || undefined,
      to: to || undefined,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "revenue-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminPageShell>
      <PaymentsSectionTabs />

      <div className="mb-4 flex flex-wrap gap-2">
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
        <button
          type="button"
          onClick={() => void handleExport()}
          className="rounded-lg bg-primary px-4 py-2 text-on-primary"
        >
          Xuất CSV
        </button>
      </div>

      {isLoading && <p className="text-ink-muted">Đang tải...</p>}

      {report && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <p className="text-label text-ink-muted">Tổng doanh thu (ròng)</p>
              <p className="text-display-sm">{report.totalRevenueVnd.toLocaleString("vi-VN")} ₫</p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-label text-ink-muted">Số giao dịch</p>
              <p className="text-display-sm">{report.totalCount}</p>
            </div>
          </div>

          <h2 className="mb-2 text-title-md">Theo môn học</h2>
          <AdminDataTable className="mb-6">
            <TableHeader>
              <TableRow>
                <TableHead>Môn học</TableHead>
                <TableHead>Doanh thu</TableHead>
                <TableHead>Số GD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.bySubject.map((row) => (
                <TableRow key={row.subjectId}>
                  <TableCell>{row.subjectName}</TableCell>
                  <TableCell>{row.revenueVnd.toLocaleString("vi-VN")} ₫</TableCell>
                  <TableCell>{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </AdminDataTable>

          <h2 className="mb-2 text-title-md">Theo kênh</h2>
          <AdminDataTable>
            <TableHeader>
              <TableRow>
                <TableHead>Kênh</TableHead>
                <TableHead>Doanh thu</TableHead>
                <TableHead>Số GD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.byChannel.map((row) => (
                <TableRow key={row.channel}>
                  <TableCell>{row.channel}</TableCell>
                  <TableCell>{row.revenueVnd.toLocaleString("vi-VN")} ₫</TableCell>
                  <TableCell>{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </AdminDataTable>
        </>
      )}
    </AdminPageShell>
  );
}
