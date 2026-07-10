"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { adminApi } from "@/lib/admin-api";
import { DASHBOARD_QUERY_STALE_MS, queryKeys } from "@practice-exam/api-client";
import { MaterialIcon } from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

export default function AdminDashboard() {
  const { data: healthData } = useQuery({
    queryKey: queryKeys.health,
    queryFn: () => adminApi.health(),
    retry: false,
  });

  const { data: kpiData, isLoading: kpiLoading, isError: kpiError, error: kpiQueryError } = useQuery({
    queryKey: queryKeys.dashboard.kpis,
    queryFn: () => adminApi.adminGetDashboardKpis(),
    staleTime: DASHBOARD_QUERY_STALE_MS,
    refetchInterval: DASHBOARD_QUERY_STALE_MS,
  });

  const kpis = kpiData?.data;
  const totalSubscriptions =
    kpis?.subscriptionsBySubject?.reduce((sum, row) => sum + row.activeCount, 0) ?? null;

  const hasKpis =
    kpis?.subscriptionsBySubject != null ||
    kpis?.monthlyRevenue != null ||
    kpis?.contentQueue != null;

  return (
    <AdminPageShell
      title="Tổng quan hệ thống (A-10)"
      subtitle="Chào mừng trở lại. Đây là tình trạng vận hành hiện tại."
    >
      <div className="space-y-8">
        {kpiLoading && <p className="text-ink-muted">Đang tải KPI...</p>}

        {!kpiLoading && kpiError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-body-sm text-destructive">
            Không thể tải KPI:{" "}
            {kpiQueryError instanceof Error ? kpiQueryError.message : "Lỗi không xác định"}
          </p>
        )}

        {!kpiLoading && !kpiError && !hasKpis && (
          <p className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-body-sm text-ink-muted">
            Không có KPI nào cho vai trò hiện tại. Liên hệ Super Admin nếu bạn cần quyền truy cập.
          </p>
        )}

        {!kpiLoading && !kpiError && hasKpis && (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {kpis?.subscriptionsBySubject != null && (
              <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <MaterialIcon name="card_membership" size={28} />
                </div>
                <div>
                  <p className="text-label text-on-surface-variant">Gói đăng ký đang hoạt động</p>
                  <h3 className="text-display-lg text-primary">{totalSubscriptions ?? 0}</h3>
                  <p className="mt-1 text-label text-ink-muted">
                    {kpis.subscriptionsBySubject.length} môn có subscriber
                  </p>
                </div>
              </div>
            )}

            {kpis?.monthlyRevenue != null && (
              <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
                <div className="rounded-lg bg-success/10 p-3 text-success">
                  <MaterialIcon name="account_balance_wallet" size={28} />
                </div>
                <div>
                  <p className="text-label text-on-surface-variant">Doanh thu tháng này</p>
                  <h3 className="text-display-lg text-primary">
                    {formatVnd(kpis.monthlyRevenue.totalRevenueVnd)}
                  </h3>
                  <p className="mt-1 text-label text-ink-muted">
                    {kpis.monthlyRevenue.totalCount} giao dịch đã xác nhận
                  </p>
                </div>
                <Link href="/payments/revenue" className="text-label text-primary underline">
                  Xem báo cáo chi tiết
                </Link>
              </div>
            )}

            {kpis?.contentQueue != null && (
              <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
                <div className="rounded-lg bg-warning/10 p-3 text-warning">
                  <MaterialIcon name="pending_actions" size={28} />
                </div>
                <div>
                  <p className="text-label text-on-surface-variant">Hàng đợi nội dung</p>
                  <h3 className="text-display-lg text-primary">
                    {kpis.contentQueue.editorialPending + kpis.contentQueue.flaggedOpen}
                  </h3>
                  <p className="mt-1 text-label text-ink-muted">
                    {kpis.contentQueue.editorialPending} chờ duyệt · {kpis.contentQueue.flaggedOpen}{" "}
                    báo cáo mở
                  </p>
                </div>
                <div className="flex gap-3 text-label">
                  <Link href="/review" className="text-primary underline">
                    Duyệt biên tập
                  </Link>
                  <Link href="/flags" className="text-primary underline">
                    Báo cáo câu hỏi
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}

        {kpis?.subscriptionsBySubject && kpis.subscriptionsBySubject.length > 0 && (
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <h3 className="mb-4 text-heading font-heading text-primary">
              Đăng ký đang hoạt động theo môn
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-body-sm">
                <thead>
                  <tr className="border-b border-outline-variant text-left">
                    <th className="px-3 py-2">Môn</th>
                    <th className="px-3 py-2">Mã</th>
                    <th className="px-3 py-2">Số gói active</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.subscriptionsBySubject.map((row) => (
                    <tr key={row.subjectId} className="border-b border-outline-variant last:border-0">
                      <td className="px-3 py-2">{row.subjectName}</td>
                      <td className="px-3 py-2 font-mono text-label">{row.subjectCode}</td>
                      <td className="px-3 py-2">{row.activeCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <h3 className="mb-4 text-heading font-heading text-primary">Trạng thái API</h3>
          {healthData ? (
            <p className="flex items-center gap-2 text-body text-on-surface-variant">
              <MaterialIcon name="check_circle" className="text-success" filled />
              API health: {healthData.data.status}
            </p>
          ) : (
            <p className="text-body text-ink-muted">Đang kiểm tra kết nối API...</p>
          )}
          {kpis?.generatedAt && (
            <p className="mt-2 text-label text-ink-muted">
              KPI cập nhật lúc {new Date(kpis.generatedAt).toLocaleString("vi-VN")} (cache tối đa 5
              phút)
            </p>
          )}
        </section>
      </div>
    </AdminPageShell>
  );
}
