"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import { adminApi } from "@/lib/admin-api";
import { queryKeys, summarizeSettled } from "@practice-exam/api-client";
import {
  AdminDataTable,
  AdminIconAction,
  AdminTableActions,
  AdminTableEmpty,
  Badge,
  MaterialIcon,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Check, Pencil, Trash2 } from "lucide-react";
import {
  CatalogSectionToolbar,
  catalogCheckboxClassName,
  catalogTableCellClassName,
  catalogTableFooterClassName,
  catalogTableHeadClassName,
  catalogTableHeadRowClassName,
  catalogTableRowClassName,
} from "@/components/catalog-section-tabs";
import { useCallback, useState } from "react";

type BulkResult = { success: number; failed: number } | null;

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkResult, setBulkResult] = useState<BulkResult>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.subjects.admin,
    queryFn: () => adminApi.adminListSubjects(),
  });

  const subjects = data?.data ?? [];

  const deletableIds = subjects
    .filter((subject) => selectedIds.has(subject.id) && subject.visibility === "archived")
    .map((subject) => subject.id);

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected = subjects.length > 0 && subjects.every((subject) => selectedIds.has(subject.id));
  const someSelected = subjects.some((subject) => selectedIds.has(subject.id));

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (subjects.length > 0 && subjects.every((subject) => prev.has(subject.id))) {
        return new Set();
      }
      return new Set(subjects.map((subject) => subject.id));
    });
  }, [subjects]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const visibilityMutation = useMutation({
    mutationFn: ({ id, visibility }: { id: string; visibility: "active" | "archived" }) =>
      visibility === "active" ? adminApi.adminActivateSubject(id) : adminApi.adminArchiveSubject(id),
    onSuccess: () => {
      setActionError(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.subjects.admin });
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map((id) => adminApi.adminDeleteSubject(id)));
      return summarizeSettled(results);
    },
    onSuccess: (summary) => {
      setBulkResult(summary);
      setSelectedIds(new Set());
      setActionError(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.subjects.admin });
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses.admin });
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const bulkRunning = deleteMutation.isPending;

  const handleDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Xóa vĩnh viễn ${ids.length} môn học đã lưu trữ? Toàn bộ câu hỏi và dữ liệu liên quan sẽ bị xóa.`,
      )
    ) {
      return;
    }
    setBulkResult(null);
    deleteMutation.mutate(ids);
  };

  return (
    <AdminPageShell>
      <CatalogSectionToolbar />

      {actionError && (
        <p className="mb-4 rounded-lg border border-error/30 bg-error-container px-4 py-2 text-body-sm text-on-error-container">
          {actionError}
        </p>
      )}

      {someSelected && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3">
          <span className="text-label font-medium text-on-surface">
            Đã chọn {selectedIds.size} môn học
          </span>
          <button
            type="button"
            disabled={deletableIds.length === 0 || bulkRunning}
            onClick={() => handleDelete(deletableIds)}
            className="inline-flex items-center gap-2 rounded-lg bg-error px-4 py-2 text-label text-on-error disabled:opacity-40"
          >
            <MaterialIcon name="delete" size={18} />
            {deleteMutation.isPending
              ? "Đang xóa..."
              : `Xóa${deletableIds.length ? ` (${deletableIds.length})` : ""}`}
          </button>
          <button
            type="button"
            disabled={bulkRunning}
            onClick={clearSelection}
            className="rounded-lg border border-outline px-4 py-2 text-label hover:bg-surface-container-low disabled:opacity-40"
          >
            Bỏ chọn
          </button>
        </div>
      )}

      {bulkResult && (
        <div className="mb-4 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-sm">
          Thành công: <strong className="text-success">{bulkResult.success}</strong> · Thất bại:{" "}
          <strong className={bulkResult.failed ? "text-error" : ""}>{bulkResult.failed}</strong>
        </div>
      )}

      <AdminDataTable
        footer={
          !isLoading ? (
            <div className={catalogTableFooterClassName}>
              <span className="font-bold text-on-surface">{subjects.length}</span> môn học
            </div>
          ) : undefined
        }
      >
        <TableHeader>
          <TableRow className={catalogTableHeadRowClassName}>
            <TableHead className={`w-12 ${catalogTableCellClassName}`}>
              <input
                type="checkbox"
                aria-label="Chọn tất cả môn học"
                checked={allSelected}
                disabled={bulkRunning}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={toggleAll}
                className={catalogCheckboxClassName}
              />
            </TableHead>
            <TableHead className={catalogTableHeadClassName}>Môn học</TableHead>
            <TableHead className={catalogTableHeadClassName}>Course</TableHead>
            <TableHead className={catalogTableHeadClassName}>Giá</TableHead>
            <TableHead className={catalogTableHeadClassName}>Go-live</TableHead>
            <TableHead className={catalogTableHeadClassName}>Trạng thái</TableHead>
            <TableHead className={`w-[200px] text-right ${catalogTableHeadClassName}`}>
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <AdminTableEmpty colSpan={7}>Đang tải...</AdminTableEmpty>}
          {!isLoading && subjects.length === 0 && (
            <AdminTableEmpty colSpan={7}>Chưa có môn học.</AdminTableEmpty>
          )}
          {subjects.map((subject) => {
            const checked = selectedIds.has(subject.id);
            return (
              <TableRow
                key={subject.id}
                data-state={checked ? "selected" : undefined}
                className={catalogTableRowClassName}
              >
                <TableCell className={catalogTableCellClassName}>
                  <input
                    type="checkbox"
                    aria-label={`Chọn môn học ${subject.name}`}
                    checked={checked}
                    disabled={bulkRunning}
                    onChange={() => toggleRow(subject.id)}
                    className={catalogCheckboxClassName}
                  />
                </TableCell>
                <TableCell className={catalogTableCellClassName}>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-on-surface">{subject.name}</div>
                    {subject.isHot && (
                      <Badge variant="secondary" className="shrink-0">
                        Hot
                      </Badge>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-on-surface-variant">{subject.code}</div>
                </TableCell>
                <TableCell className={`${catalogTableCellClassName} text-sm`}>
                  {subject.courseName}
                </TableCell>
                <TableCell className={`${catalogTableCellClassName} text-sm`}>
                  {subject.monthlyAmountVnd?.toLocaleString("vi-VN") ?? "—"} ₫
                </TableCell>
                <TableCell className={`${catalogTableCellClassName} text-body-sm text-on-surface-variant`}>
                  {subject.goLive.publishedQuestionCount}/
                  {subject.goLive.requirements.minPublishedQuestions} câu hỏi,{" "}
                  {subject.goLive.approvedTemplateCount}/
                  {subject.goLive.requirements.minApprovedTemplates} template
                </TableCell>
                <TableCell className={catalogTableCellClassName}>
                  <Badge variant={subject.visibility === "active" ? "secondary" : "outline"}>
                    {subject.visibility === "active" ? "Hoạt động" : "Lưu trữ"}
                  </Badge>
                </TableCell>
                <TableCell className={`${catalogTableCellClassName} text-right`}>
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
                    {subject.visibility === "archived" && (
                      <AdminIconAction
                        icon={Trash2}
                        label="Xóa"
                        disabled={bulkRunning}
                        onClick={() => handleDelete([subject.id])}
                      />
                    )}
                  </AdminTableActions>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </AdminDataTable>
    </AdminPageShell>
  );
}
