"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";

import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import { MaterialIcon } from "@practice-exam/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function BulkImportPage() {
  return (
    <AdminRoleGate allowedRoles={["editor", "super_admin"]}>
      <BulkImportContent />
    </AdminRoleGate>
  );
}

function BulkImportContent() {
  const [courseId, setCourseId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [batchId, setBatchId] = useState<string | null>(null);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  const { data: coursesData } = useQuery({
    queryKey: queryKeys.courses.admin,
    queryFn: () => adminApi.adminListCourses(),
  });
  const { data: subjectsData } = useQuery({
    queryKey: queryKeys.subjects.admin,
    queryFn: () => adminApi.adminListSubjects(),
  });

  const courses = coursesData?.data ?? [];
  const subjects = subjectsData?.data ?? [];
  const filteredSubjects = useMemo(
    () => subjects.filter((subject) => subject.courseId === courseId),
    [subjects, courseId],
  );

  const importMutation = useMutation({
    mutationFn: (file: File) => adminApi.adminImportQuestions(subjectId, file),
    onSuccess: (res) => setBatchId(res.data.batchId),
  });

  const handleDownloadTemplate = async () => {
    setTemplateError(null);
    setIsDownloadingTemplate(true);
    try {
      const blob = await adminApi.adminDownloadImportTemplate();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "mau-import-cau-hoi.xlsx";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setTemplateError(err instanceof Error ? err.message : "Không tải được file mẫu.");
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const { data: report } = useQuery({
    queryKey: queryKeys.importBatches.detail(batchId ?? ""),
    queryFn: () => adminApi.adminGetImportReport(batchId!),
    enabled: !!batchId,
    refetchInterval: (query) =>
      query.state.data?.data.status === "completed" || query.state.data?.data.status === "failed"
        ? false
        : 2000,
  });

  return (
    <AdminPageShell>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link href="/questions" className="text-label text-primary hover:underline">
          ← Quay lại ngân hàng câu hỏi
        </Link>
        <button
          type="button"
          onClick={() => void handleDownloadTemplate()}
          disabled={isDownloadingTemplate}
          className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-label text-primary hover:bg-surface-container-low disabled:opacity-60"
        >
          <MaterialIcon name="download" size={20} />
          {isDownloadingTemplate ? "Đang tải file mẫu..." : "Tải file mẫu"}
        </button>
      </div>

      {templateError && <p className="mb-4 text-error">{templateError}</p>}

      <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container-low p-4 text-body">
        <p className="text-label font-medium text-on-surface-variant">Cột trong file mẫu</p>
        <p className="mt-2 text-ink-muted">
          Loại câu hỏi, Câu hỏi, Đáp án A–D, Đáp án đúng, Giải thích, Độ khó, Chủ đề. Chọn{" "}
          <strong>Loại câu hỏi</strong> và <strong>Độ khó</strong> từ dropdown (sheet DanhMuc). Xem
          thêm sheet HuongDan trong file tải về.
        </p>
      </div>

      <div className="max-w-xl space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
        <div>
          <label className="text-label text-on-surface-variant" htmlFor="import-course">
            Course
          </label>
          <select
            id="import-course"
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              setSubjectId("");
            }}
            className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2"
          >
            <option value="">Chọn Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.code})
                {course.visibility === "archived" ? " - lưu trữ" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-label text-on-surface-variant" htmlFor="import-subject">
            Môn học
          </label>
          <select
            id="import-subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            disabled={!courseId}
            className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2 disabled:opacity-60"
          >
            <option value="">{courseId ? "Chọn môn học" : "Chọn Course trước"}</option>
            {filteredSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-outline-variant p-8 hover:border-primary/40">
            <MaterialIcon name="upload_file" size={40} className="text-primary" />
            <span className="text-body">Chọn file .xlsx</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              disabled={!subjectId || importMutation.isPending}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importMutation.mutate(file);
              }}
            />
          </label>
        </div>
        {importMutation.isPending && (
          <p className="text-body text-ink-muted">Đang tải lên và xếp hàng xử lý...</p>
        )}
        {importMutation.isError && (
          <p className="text-error">{(importMutation.error as Error).message}</p>
        )}
      </div>

      {report?.data && (
        <div className="mt-8 space-y-4">
          <h3 className="text-heading font-heading text-primary">Báo cáo import</h3>
          <p className="text-body">
            Trạng thái: <strong>{report.data.status}</strong> — Thành công: {report.data.successCount} / Lỗi:{" "}
            {report.data.errorCount} / Tổng: {report.data.totalRows}
          </p>
          {report.data.rowErrors.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-outline-variant">
              <table className="w-full text-body">
                <thead className="bg-surface-container-low text-label">
                  <tr>
                    <th className="px-4 py-2 text-left">Dòng</th>
                    <th className="px-4 py-2 text-left">Trường</th>
                    <th className="px-4 py-2 text-left">Lỗi</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.rowErrors.map((err) => (
                    <tr key={`${err.rowNumber}-${err.message}`} className="border-t border-outline-variant/50">
                      <td className="px-4 py-2">{err.rowNumber}</td>
                      <td className="px-4 py-2">{err.field ?? "—"}</td>
                      <td className="px-4 py-2 text-error">{err.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AdminPageShell>
  );
}
