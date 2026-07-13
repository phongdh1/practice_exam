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
import { Archive, ArrowDown, ArrowUp, Check, Pencil, Trash2 } from "lucide-react";
import { CatalogSectionToolbar } from "@/components/catalog-section-tabs";
import { useCallback, useState } from "react";

type BulkResult = { success: number; failed: number } | null;

export default function CoursesPage() {
  return (
    <AdminRoleGate allowedRoles={["super_admin"]}>
      <CoursesContent />
    </AdminRoleGate>
  );
}

function CoursesContent() {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkResult, setBulkResult] = useState<BulkResult>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.courses.admin,
    queryFn: () => adminApi.adminListCourses(),
  });

  const courses = data?.data ?? [];

  const deletableIds = courses
    .filter((course) => selectedIds.has(course.id) && course.subjectCount === 0)
    .map((course) => course.id);

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected = courses.length > 0 && courses.every((course) => selectedIds.has(course.id));
  const someSelected = courses.some((course) => selectedIds.has(course.id));

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (courses.length > 0 && courses.every((course) => prev.has(course.id))) {
        return new Set();
      }
      return new Set(courses.map((course) => course.id));
    });
  }, [courses]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.courses.admin });
    void queryClient.invalidateQueries({ queryKey: queryKeys.subjects.admin });
  }, [queryClient]);

  const visibilityMutation = useMutation({
    mutationFn: ({ id, visibility }: { id: string; visibility: "active" | "archived" }) =>
      visibility === "active" ? adminApi.adminActivateCourse(id) : adminApi.adminArchiveCourse(id),
    onSuccess: () => {
      setActionError(null);
      invalidate();
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) => adminApi.adminReorderCourses(orderedIds),
    onSuccess: () => {
      setActionError(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses.admin });
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map((id) => adminApi.adminDeleteCourse(id)));
      return summarizeSettled(results);
    },
    onSuccess: (summary) => {
      setBulkResult(summary);
      setSelectedIds(new Set());
      setActionError(null);
      invalidate();
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const bulkRunning = deleteMutation.isPending;

  const moveCourse = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= courses.length) return;
    const next = [...courses];
    [next[index], next[target]] = [next[target], next[index]];
    reorderMutation.mutate(next.map((course) => course.id));
  };

  const handleDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Xóa vĩnh viễn ${ids.length} khóa học? Chỉ khóa học không có môn học mới xóa được.`,
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
            Đã chọn {selectedIds.size} khóa học
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
            <div className="border-t border-outline-variant px-4 py-3 text-label">
              {courses.length} khóa học
            </div>
          ) : undefined
        }
      >
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                aria-label="Chọn tất cả khóa học"
                checked={allSelected}
                disabled={bulkRunning}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={toggleAll}
                className="rounded border-outline-variant text-primary disabled:opacity-40"
              />
            </TableHead>
            <TableHead>Khóa học</TableHead>
            <TableHead>Thứ tự</TableHead>
            <TableHead>Môn học</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[200px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <AdminTableEmpty colSpan={6}>Đang tải...</AdminTableEmpty>}
          {!isLoading && courses.length === 0 && (
            <AdminTableEmpty colSpan={6}>Chưa có khóa học.</AdminTableEmpty>
          )}
          {courses.map((course, index) => {
            const checked = selectedIds.has(course.id);
            return (
              <TableRow key={course.id} data-state={checked ? "selected" : undefined}>
                <TableCell>
                  <input
                    type="checkbox"
                    aria-label={`Chọn khóa học ${course.name}`}
                    checked={checked}
                    disabled={bulkRunning}
                    onChange={() => toggleRow(course.id)}
                    className="rounded border-outline-variant text-primary disabled:opacity-40"
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{course.name}</div>
                  <div className="font-mono text-label text-ink-muted">{course.code}</div>
                  {course.description && (
                    <div className="mt-1 text-body-sm text-ink-muted">{course.description}</div>
                  )}
                </TableCell>
                <TableCell>{course.displayOrder}</TableCell>
                <TableCell>{course.subjectCount}</TableCell>
                <TableCell>
                  <Badge variant={course.visibility === "active" ? "secondary" : "outline"}>
                    {course.visibility === "active" ? "Hoạt động" : "Lưu trữ"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <AdminTableActions>
                    <AdminIconAction
                      icon={ArrowUp}
                      label="Lên"
                      disabled={index === 0 || reorderMutation.isPending}
                      onClick={() => moveCourse(index, -1)}
                    />
                    <AdminIconAction
                      icon={ArrowDown}
                      label="Xuống"
                      disabled={index === courses.length - 1 || reorderMutation.isPending}
                      onClick={() => moveCourse(index, 1)}
                    />
                    <AdminIconAction
                      icon={course.visibility === "active" ? Archive : Check}
                      label={course.visibility === "active" ? "Lưu trữ" : "Kích hoạt"}
                      onClick={() =>
                        visibilityMutation.mutate({
                          id: course.id,
                          visibility: course.visibility === "active" ? "archived" : "active",
                        })
                      }
                    />
                    <AdminIconAction icon={Pencil} label="Sửa" href={`/courses/${course.id}`} />
                    {course.subjectCount === 0 && (
                      <AdminIconAction
                        icon={Trash2}
                        label="Xóa"
                        disabled={bulkRunning}
                        onClick={() => handleDelete([course.id])}
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
