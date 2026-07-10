"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";

import { adminApi } from "@/lib/admin-api";
import { queryKeys, summarizeSettled } from "@practice-exam/api-client";
import { Badge, MaterialIcon } from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useState } from "react";

type BulkResult = { success: number; failed: number } | null;

function EditorialQueueContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const subjectId = searchParams.get("subjectId") ?? "";
  const [bulkResult, setBulkResult] = useState<BulkResult>(null);

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`/review?${params.toString()}`);
    },
    [router, searchParams],
  );

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.editorial.queue({ subjectId }),
    queryFn: () => adminApi.adminListReviewQueue(subjectId ? { subjectId } : undefined),
  });

  const items = data?.data ?? [];

  const approveAllMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          await adminApi.adminAssignReview(id);
          return adminApi.adminApproveQuestion(id);
        }),
      );
      return summarizeSettled(results);
    },
    onSuccess: (summary) => {
      setBulkResult(summary);
      void queryClient.invalidateQueries({ queryKey: ["editorial", "queue"] });
      void queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });

  const handleApproveAll = () => {
    if (items.length === 0) return;
    if (
      !window.confirm(
        `Duyệt tất cả ${items.length} câu hỏi trong hàng đợi này? Các câu không thể duyệt sẽ được báo trong kết quả.`,
      )
    ) {
      return;
    }
    setBulkResult(null);
    approveAllMutation.mutate(items.map((item) => item.id));
  };

  return (
    <AdminPageShell
      title="Hàng đợi biên tập"
      subtitle="A-40 — Câu hỏi chờ duyệt."
    >
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Lọc theo Subject ID"
          defaultValue={subjectId}
          onKeyDown={(e) => {
            if (e.key === "Enter") setFilter("subjectId", (e.target as HTMLInputElement).value);
          }}
          className="rounded-lg border border-outline-variant px-3 py-2"
        />
        <button
          type="button"
          disabled={items.length === 0 || approveAllMutation.isPending}
          onClick={handleApproveAll}
          className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-label text-on-primary disabled:opacity-40"
        >
          <MaterialIcon name="done_all" size={18} />
          {approveAllMutation.isPending
            ? "Đang duyệt..."
            : `Duyệt tất cả${items.length ? ` (${items.length})` : ""}`}
        </button>
        <Link href="/flags" className="rounded-lg border border-outline px-4 py-2 text-label hover:bg-surface-container-low">
          Báo cáo từ thí sinh (A-42)
        </Link>
      </div>

      {bulkResult && (
        <div className="mb-4 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-sm">
          Thành công: <strong className="text-success">{bulkResult.success}</strong> · Thất bại:{" "}
          <strong className={bulkResult.failed ? "text-error" : ""}>{bulkResult.failed}</strong>
        </div>
      )}

      {isLoading && <p className="text-ink-muted">Đang tải...</p>}
      {!isLoading && items.length === 0 && (
        <p className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-ink-muted">
          Không có câu hỏi chờ duyệt.
        </p>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-on-surface">{item.stem}</p>
              <p className="mt-1 text-label text-ink-muted">
                {item.subjectName} · {item.authorName} · {item.ageDays} ngày
                {item.reviewerName && ` · Đã gán: ${item.reviewerName}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {item.reviewerId ? (
                <Badge variant="secondary">Đã gán</Badge>
              ) : (
                <Badge>Chờ gán</Badge>
              )}
              <Link
                href={`/review/${item.id}`}
                className="rounded-lg bg-primary px-4 py-2 text-label text-on-primary"
              >
                Duyệt
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AdminPageShell>
  );
}

export default function EditorialQueuePage() {
  return (
    <AdminRoleGate allowedRoles={["reviewer", "super_admin"]}>
      <Suspense fallback={<p className="p-8 text-ink-muted">Đang tải...</p>}>
        <EditorialQueueContent />
      </Suspense>
    </AdminRoleGate>
  );
}
