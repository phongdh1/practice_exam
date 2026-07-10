"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import { Badge } from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CatalogSectionToolbar } from "@/components/catalog-section-tabs";
import Link from "next/link";
import { useState } from "react";

export default function SubjectsPage() {
  return (
    <AdminRoleGate allowedRoles={["super_admin"]}>
      <SubjectsContent />
    </AdminRoleGate>
  );
}

function SubjectsContent() {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.subjects.admin,
    queryFn: () => adminApi.adminListSubjects(),
  });

  const visibilityMutation = useMutation({
    mutationFn: ({ id, visibility }: { id: string; visibility: "active" | "archived" }) =>
      visibility === "active" ? adminApi.adminActivateSubject(id) : adminApi.adminArchiveSubject(id),
    onSuccess: () => {
      setActionError(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.subjects.admin });
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const subjects = data?.data ?? [];

  return (
    <AdminPageShell
      title="Môn học"
      subtitle="Mỗi môn thuộc đúng một Course; giá, free tier và go-live gate vẫn ở cấp môn."
    >
      <CatalogSectionToolbar />

      {actionError && (
        <p className="mb-4 rounded-lg border border-error/30 bg-error-container px-4 py-2 text-body-sm text-on-error-container">
          {actionError}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <table className="w-full text-left text-body">
          <thead className="bg-surface-container-low text-label">
            <tr>
              <th className="px-4 py-3">Môn học</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Go-live</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  Đang tải...
                </td>
              </tr>
            )}
            {!isLoading && subjects.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  Chưa có môn học.
                </td>
              </tr>
            )}
            {subjects.map((subject) => (
              <tr key={subject.id} className="border-t border-outline-variant">
                <td className="px-4 py-3">
                  <div className="font-medium">{subject.name}</div>
                  <div className="font-mono text-label text-ink-muted">{subject.code}</div>
                </td>
                <td className="px-4 py-3">{subject.courseName}</td>
                <td className="px-4 py-3">
                  {subject.monthlyAmountVnd?.toLocaleString("vi-VN") ?? "—"} ₫
                </td>
                <td className="px-4 py-3 text-body-sm">
                  {subject.goLive.publishedQuestionCount}/
                  {subject.goLive.requirements.minPublishedQuestions} câu hỏi,{" "}
                  {subject.goLive.approvedTemplateCount}/
                  {subject.goLive.requirements.minApprovedTemplates} template
                </td>
                <td className="px-4 py-3">
                  <Badge variant={subject.visibility === "active" ? "secondary" : "outline"}>
                    {subject.visibility === "active" ? "Hoạt động" : "Lưu trữ"}
                  </Badge>
                </td>
                <td className="space-x-3 px-4 py-3 text-right">
                  {subject.visibility === "archived" ? (
                    subject.goLive.canActivate ? (
                      <button
                        type="button"
                        className="text-primary underline disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={visibilityMutation.isPending}
                        onClick={() =>
                          visibilityMutation.mutate({
                            id: subject.id,
                            visibility: "active",
                          })
                        }
                      >
                        Kích hoạt
                      </button>
                    ) : (
                      <span
                        className="text-ink-muted"
                        title={`Chưa đủ ${subject.goLive.requirements.minPublishedQuestions} câu Published và ${subject.goLive.requirements.minApprovedTemplates} Mock Exam Template đã duyệt`}
                      >
                        Chưa đủ go-live
                      </span>
                    )
                  ) : (
                    <button
                      type="button"
                      className="text-primary underline"
                      onClick={() =>
                        visibilityMutation.mutate({
                          id: subject.id,
                          visibility: "archived",
                        })
                      }
                    >
                      Lưu trữ
                    </button>
                  )}
                  <Link href={`/subjects/${subject.id}`} className="text-primary underline">
                    Sửa
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  );
}
