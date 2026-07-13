"use client";
import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";

import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import { QuestionPreview } from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

export default function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: questionData } = useQuery({
    queryKey: queryKeys.questions.detail(id),
    queryFn: () => adminApi.adminGetQuestion(id),
  });

  const { data: previewData } = useQuery({
    queryKey: queryKeys.questions.preview(id),
    queryFn: () => adminApi.adminPreviewQuestion(id),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.editorial.queue() });
    router.push("/review");
  };

  const assignMutation = useMutation({
    mutationFn: () => adminApi.adminAssignReview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.questions.detail(id) }),
  });

  const approveMutation = useMutation({
    mutationFn: () => adminApi.adminApproveQuestion(id, comment || undefined),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: () => adminApi.adminRejectQuestion(id, comment),
    onSuccess: invalidate,
  });

  const question = questionData?.data;
  const preview = previewData?.data;

  return (
    <AdminRoleGate allowedRoles={["reviewer", "super_admin"]}>
    <AdminPageShell>
      <div className="mb-6">
        <Link href="/review" className="text-label text-primary hover:underline">
          ← Quay lại hàng đợi
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {preview && <QuestionPreview question={preview} />}
        </div>
        <div className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          <p className="text-body text-ink-muted">
            Trạng thái: <strong>{question?.status}</strong>
          </p>
          {!question?.reviewerId && (
            <button
              type="button"
              onClick={() => assignMutation.mutate()}
              disabled={assignMutation.isPending}
              className="w-full rounded-lg border border-primary px-4 py-2 text-primary"
            >
              Gán cho tôi
            </button>
          )}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Nhận xét (bắt buộc khi từ chối)"
            rows={4}
            className="w-full rounded-lg border border-outline-variant px-3 py-2"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="flex-1 rounded-lg bg-success px-4 py-2 text-on-primary"
            >
              Phê duyệt
            </button>
            <button
              type="button"
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending || !comment.trim()}
              className="flex-1 rounded-lg bg-error px-4 py-2 text-on-primary disabled:opacity-50"
            >
              Từ chối
            </button>
          </div>
        </div>
      </div>
    </AdminPageShell>
    </AdminRoleGate>
  );
}
