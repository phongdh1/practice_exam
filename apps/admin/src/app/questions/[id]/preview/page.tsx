"use client";
import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";

import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import { QuestionPreview } from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { use } from "react";

export default function QuestionPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.questions.preview(id),
    queryFn: () => adminApi.adminPreviewQuestion(id),
  });

  const preview = data?.data;

  return (
    <AdminRoleGate allowedRoles={["editor", "reviewer", "super_admin"]}>
      <AdminPageShell>
        <div className="mb-6">
          <Link href="/questions" className="text-label text-primary hover:underline">
            ← Quay lại ngân hàng câu hỏi
          </Link>
        </div>

        {isLoading && <p className="text-ink-muted">Đang tải xem trước...</p>}
        {error && <p className="text-error">Không thể tải câu hỏi.</p>}
        {preview && <QuestionPreview question={preview} />}
      </AdminPageShell>
    </AdminRoleGate>
  );
}
