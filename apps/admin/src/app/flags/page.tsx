"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";

import { adminApi } from "@/lib/admin-api";
import { toastApiError, toastApiSuccess } from "@/lib/admin-toast";
import { queryKeys } from "@practice-exam/api-client";
import { Badge } from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

export default function FlaggedQuestionsPage() {
  return (
    <AdminRoleGate allowedRoles={["reviewer", "super_admin"]}>
      <FlaggedQuestionsContent />
    </AdminRoleGate>
  );
}

function FlaggedQuestionsContent() {
  const queryClient = useQueryClient();
  const [resolutionNote, setResolutionNote] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.editorial.flags(),
    queryFn: () => adminApi.adminListFlags(),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      adminApi.adminResolveFlag(id, note),
    onSuccess: () => {
      toastApiSuccess("Đã xử lý báo cáo");
      void queryClient.invalidateQueries({ queryKey: queryKeys.editorial.flags() });
    },
    onError: (error) => toastApiError(error, "Xử lý báo cáo thất bại"),
  });

  const flags = data?.data ?? [];

  return (
    <AdminPageShell>
      <div className="mb-6">
        <Link href="/review" className="text-label text-primary hover:underline">
          ← Hàng đợi duyệt
        </Link>
      </div>

      {isLoading && <p className="text-ink-muted">Đang tải...</p>}
      {!isLoading && flags.length === 0 && (
        <p className="rounded-xl border p-8 text-center text-ink-muted">Không có báo cáo nào.</p>
      )}

      <div className="space-y-4">
        {flags.map((flag) => (
          <div key={flag.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{flag.questionStem}</p>
                <p className="mt-1 text-label text-ink-muted">
                  {flag.userDisplayName ?? flag.userId} · {new Date(flag.createdAt).toLocaleString("vi-VN")}
                </p>
                {flag.comment && <p className="mt-2 text-body italic">&ldquo;{flag.comment}&rdquo;</p>}
              </div>
              <Badge variant={flag.status === "resolved" ? "secondary" : "default"}>{flag.status}</Badge>
            </div>
            {flag.status !== "resolved" && (
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Ghi chú xử lý"
                  value={resolutionNote[flag.id] ?? ""}
                  onChange={(e) =>
                    setResolutionNote((prev) => ({ ...prev, [flag.id]: e.target.value }))
                  }
                  className="flex-1 rounded-lg border px-3 py-2"
                />
                <button
                  type="button"
                  disabled={!resolutionNote[flag.id]?.trim() || resolveMutation.isPending}
                  onClick={() =>
                    resolveMutation.mutate({ id: flag.id, note: resolutionNote[flag.id] })
                  }
                  className="rounded-lg bg-primary px-4 py-2 text-on-primary disabled:opacity-50"
                >
                  Đã xử lý
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminPageShell>
  );
}
