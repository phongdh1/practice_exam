"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";

import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
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
    <AdminPageShell
      title="Báo cáo doanh thu"
      subtitle="A-73 — Theo môn học và kênh (web/Zalo), chỉ giao dịch đã thanh toán (đã trừ hoàn tiền)."
    >
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
          <div className="mb-6 overflow-hidden rounded-xl border">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface-container-low text-label">
                <tr>
                  <th className="px-4 py-3">Môn học</th>
                  <th className="px-4 py-3">Doanh thu</th>
                  <th className="px-4 py-3">Số GD</th>
                </tr>
              </thead>
              <tbody>
                {report.bySubject.map((row) => (
                  <tr key={row.subjectId} className="border-t">
                    <td className="px-4 py-3">{row.subjectName}</td>
                    <td className="px-4 py-3">{row.revenueVnd.toLocaleString("vi-VN")} ₫</td>
                    <td className="px-4 py-3">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="mb-2 text-title-md">Theo kênh</h2>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface-container-low text-label">
                <tr>
                  <th className="px-4 py-3">Kênh</th>
                  <th className="px-4 py-3">Doanh thu</th>
                  <th className="px-4 py-3">Số GD</th>
                </tr>
              </thead>
              <tbody>
                {report.byChannel.map((row) => (
                  <tr key={row.channel} className="border-t">
                    <td className="px-4 py-3">{row.channel}</td>
                    <td className="px-4 py-3">{row.revenueVnd.toLocaleString("vi-VN")} ₫</td>
                    <td className="px-4 py-3">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminPageShell>
  );
}
