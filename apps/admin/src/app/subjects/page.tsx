"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import {
  AdminDataTable,
  AdminIconAction,
  AdminTableActions,
  AdminTableEmpty,
  Badge,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Check, Pencil } from "lucide-react";
import { CatalogSectionToolbar } from "@/components/catalog-section-tabs";
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

      <AdminDataTable>
        <TableHeader>
          <TableRow>
            <TableHead>Môn học</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Go-live</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[120px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <AdminTableEmpty colSpan={6}>Đang tải...</AdminTableEmpty>}
          {!isLoading && subjects.length === 0 && (
            <AdminTableEmpty colSpan={6}>Chưa có môn học.</AdminTableEmpty>
          )}
          {subjects.map((subject) => (
            <TableRow key={subject.id}>
              <TableCell>
                <div className="font-medium">{subject.name}</div>
                <div className="font-mono text-label text-ink-muted">{subject.code}</div>
              </TableCell>
              <TableCell>{subject.courseName}</TableCell>
              <TableCell>
                {subject.monthlyAmountVnd?.toLocaleString("vi-VN") ?? "—"} ₫
              </TableCell>
              <TableCell className="text-body-sm">
                {subject.goLive.publishedQuestionCount}/
                {subject.goLive.requirements.minPublishedQuestions} câu hỏi,{" "}
                {subject.goLive.approvedTemplateCount}/
                {subject.goLive.requirements.minApprovedTemplates} template
              </TableCell>
              <TableCell>
                <Badge variant={subject.visibility === "active" ? "secondary" : "outline"}>
                  {subject.visibility === "active" ? "Hoạt động" : "Lưu trữ"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <AdminTableActions>
                  {subject.visibility === "archived" ? (
                    subject.goLive.canActivate ? (
                      <AdminIconAction
                        icon={Check}
                        label="Kích hoạt"
                        disabled={visibilityMutation.isPending}
                        onClick={() =>
                          visibilityMutation.mutate({ id: subject.id, visibility: "active" })
                        }
                      />
                    ) : null
                  ) : (
                    <AdminIconAction
                      icon={Archive}
                      label="Lưu trữ"
                      onClick={() =>
                        visibilityMutation.mutate({ id: subject.id, visibility: "archived" })
                      }
                    />
                  )}
                  <AdminIconAction
                    icon={Pencil}
                    label="Sửa"
                    href={`/subjects/${subject.id}`}
                  />
                </AdminTableActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </AdminDataTable>
    </AdminPageShell>
  );
}
