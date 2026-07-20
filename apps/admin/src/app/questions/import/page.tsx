"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import { adminApi } from "@/lib/admin-api";
import { toastApiError, toastApiSuccess } from "@/lib/admin-toast";
import { queryKeys } from "@practice-exam/api-client";
import { MaterialIcon } from "@practice-exam/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

const ACCEPT_EXTENSIONS = [".xlsx", ".xls"];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function isSpreadsheetFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPT_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function BulkImportPage() {
  return (
    <AdminRoleGate allowedRoles={["editor", "super_admin"]}>
      <BulkImportContent />
    </AdminRoleGate>
  );
}

function BulkImportContent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitLockRef = useRef(false);
  const [courseId, setCourseId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [dragOver, setDragOver] = useState(false);

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
    mutationFn: ({ subjectId: sid, file }: { subjectId: string; file: File }) =>
      adminApi.adminImportQuestions(sid, file),
    onSuccess: (res) => {
      setBatchId(res.data.batchId);
      setSelectedFile(null);
      toastApiSuccess("Đã gửi import câu hỏi");
    },
    onError: (error) => toastApiError(error, "Import thất bại"),
    onSettled: () => {
      submitLockRef.current = false;
    },
  });

  const busy = importMutation.isPending;
  const canSubmit = Boolean(subjectId && selectedFile) && !busy;

  const stageFile = (file: File | undefined) => {
    if (busy) return;
    setFileError(null);
    importMutation.reset();
    if (!file) return;
    if (!isSpreadsheetFile(file)) {
      setSelectedFile(null);
      setFileError("Chỉ chấp nhận file .xlsx hoặc .xls.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setSelectedFile(null);
      setFileError("File tối đa 10MB.");
      return;
    }
    setSelectedFile(file);
  };

  const resetCascade = () => {
    setSubjectId("");
    setSelectedFile(null);
    setFileError(null);
    setBatchId(null);
    importMutation.reset();
  };

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
      setTemplateError(errorMessage(err, "Không tải được file mẫu."));
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleSubmit = () => {
    if (!subjectId || !selectedFile || busy || submitLockRef.current) return;
    submitLockRef.current = true;
    importMutation.mutate({ subjectId, file: selectedFile });
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
      <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/questions"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            ← Quay lại ngân hàng câu hỏi
          </Link>
          <button
            type="button"
            onClick={() => void handleDownloadTemplate()}
            disabled={isDownloadingTemplate}
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-surface-container-low disabled:opacity-60"
          >
            <MaterialIcon name="download" size={18} />
            {isDownloadingTemplate ? "Đang tải file mẫu..." : "Tải file mẫu"}
          </button>
        </div>

        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">Import hàng loạt</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            A-33 Tải lên Excel (.xlsx), tối đa 500 dòng mỗi batch.
          </p>
        </div>

        {templateError && (
          <p
            role="alert"
            className="rounded-lg border border-error/30 bg-error-container px-4 py-2 text-body-sm text-on-error-container"
          >
            {templateError}
          </p>
        )}
        {fileError && (
          <p
            role="alert"
            className="rounded-lg border border-error/30 bg-error-container px-4 py-2 text-body-sm text-on-error-container"
          >
            {fileError}
          </p>
        )}

        <div className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 px-5 py-4">
          <MaterialIcon name="info" size={22} className="mt-0.5 shrink-0 text-primary" filled />
          <div>
            <p className="text-sm font-bold text-on-surface">Cột trong file mẫu</p>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Loại câu hỏi, Câu hỏi, Đáp án A–D, Đáp án đúng, Giải thích, Độ khó, Chủ đề. Chọn{" "}
              <strong className="text-on-surface">Loại câu hỏi</strong> và{" "}
              <strong className="text-on-surface">Độ khó</strong> từ dropdown (sheet DanhMuc). Xem
              thêm sheet HuongDan trong file tải về.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-on-surface" htmlFor="import-course">
                Course
              </label>
              <select
                id="import-course"
                value={courseId}
                disabled={busy}
                onChange={(e) => {
                  if (busy) return;
                  setCourseId(e.target.value);
                  resetCascade();
                }}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
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
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-on-surface" htmlFor="import-subject">
                Môn học
              </label>
              <select
                id="import-subject"
                value={subjectId}
                disabled={!courseId || busy}
                onChange={(e) => {
                  if (busy) return;
                  setSubjectId(e.target.value);
                  setSelectedFile(null);
                  setFileError(null);
                  importMutation.reset();
                }}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60"
              >
                <option value="">{courseId ? "Chọn môn học" : "Chọn Course trước"}</option>
                {filteredSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                stageFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={busy}
              aria-label="Chọn hoặc kéo thả file Excel"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                if (!busy) setDragOver(true);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                  setDragOver(false);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                if (busy) return;
                stageFile(event.dataTransfer.files?.[0]);
              }}
              className={[
                "flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 transition-colors",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant bg-surface-container-low",
                busy ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary/50",
              ].join(" ")}
            >
              <MaterialIcon name="upload_file" size={40} className="text-primary" />
              <div className="text-center">
                <p className="text-sm font-medium text-on-surface">
                  {selectedFile
                    ? selectedFile.name
                    : "Chọn file .xlsx hoặc kéo thả vào đây"}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB — nhấn để chọn file khác`
                    : "Định dạng hỗ trợ: .xlsx, .xls (Tối đa 10MB)"}
                </p>
              </div>
            </button>
          </div>

          {busy && (
            <p className="mt-4 text-body-sm text-ink-muted">Đang tải lên và xếp hàng xử lý...</p>
          )}
          {importMutation.isError && (
            <p className="mt-4 text-body-sm text-error">
              {errorMessage(importMutation.error, "Tải lên thất bại.")}
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "Đang tải lên..." : "Tiến hành tải lên"}
            </button>
          </div>
        </div>

        {report?.data && (
          <div className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <h3 className="text-heading font-heading text-primary">Báo cáo import</h3>
            <p className="text-body">
              Trạng thái: <strong>{report.data.status}</strong> — Thành công:{" "}
              {report.data.successCount} / Lỗi: {report.data.errorCount} / Tổng:{" "}
              {report.data.totalRows}
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
                    {report.data.rowErrors.map((err, index) => (
                      <tr
                        key={`${err.rowNumber}-${err.field ?? "none"}-${index}`}
                        className="border-t border-outline-variant/50"
                      >
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
      </div>
    </AdminPageShell>
  );
}
