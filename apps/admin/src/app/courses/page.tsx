"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import { adminApi } from "@/lib/admin-api";
import { queryKeys, summarizeSettled } from "@practice-exam/api-client";
import type { AdminCourseView } from "@practice-exam/types";
import {
  AdminDataTable,
  AdminIconAction,
  AdminTableActions,
  MaterialIcon,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, ArrowDown, ArrowUp, Check, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type BulkResult = { success: number; failed: number } | null;
type VisibilityFilter = "all" | "active" | "archived";

const PAGE_SIZE = 10;

const VISIBILITY_BADGES = {
  active: {
    label: "Công khai",
    className: "bg-success-muted text-success",
    dotClassName: "bg-success",
  },
  archived: {
    label: "Lưu trữ",
    className: "bg-surface-container-highest text-on-surface-variant",
    dotClassName: "bg-on-surface-variant",
  },
} as const;

const FILTER_TABS: { value: VisibilityFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Công khai" },
  { value: "archived", label: "Lưu trữ" },
];

const headClass =
  "px-6 text-xs font-bold uppercase tracking-wider text-on-surface-variant";
const cellClass = "px-6";
const rowClass = "hover:bg-surface-subtle";
const checkboxClass =
  "rounded border-outline-variant text-primary focus:ring-primary/20 disabled:opacity-40";

function getPaginationRange(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (current < total - 2) pages.push("ellipsis");
  if (total > 1) pages.push(total);

  return pages;
}

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
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.courses.admin,
    queryFn: () => adminApi.adminListCourses(),
  });

  const courses = data?.data ?? [];

  const stats = useMemo(() => {
    const total = courses.length;
    const active = courses.filter((course) => course.visibility === "active").length;
    const subjectTotal = courses.reduce((sum, course) => sum + course.subjectCount, 0);
    const activePct = total > 0 ? (active / total) * 100 : 0;
    return { total, active, subjectTotal, activePct };
  }, [courses]);

  const filtered = useMemo(() => {
    if (visibilityFilter === "all") return courses;
    return courses.filter((course) => course.visibility === visibilityFilter);
  }, [courses, visibilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(safePage * PAGE_SIZE, filtered.length);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const paginationRange = getPaginationRange(safePage, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

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

  const allSelected =
    pageRows.length > 0 && pageRows.every((course) => selectedIds.has(course.id));
  const someSelected = pageRows.some((course) => selectedIds.has(course.id));

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (pageRows.length > 0 && pageRows.every((course) => prev.has(course.id))) {
        const next = new Set(prev);
        for (const row of pageRows) next.delete(row.id);
        return next;
      }
      const next = new Set(prev);
      for (const row of pageRows) next.add(row.id);
      return next;
    });
  }, [pageRows]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const changeFilter = (next: VisibilityFilter) => {
    setVisibilityFilter(next);
    setPage(1);
    setSelectedIds(new Set());
    setBulkResult(null);
  };

  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const next = new Set([...prev].filter((id) => courses.some((course) => course.id === id)));
      return next.size === prev.size ? prev : next;
    });
  }, [courses]);

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.courses.admin });
    void queryClient.invalidateQueries({ queryKey: queryKeys.subjects.admin });
  }, [queryClient]);

  const visibilityMutation = useMutation({
    mutationFn: ({ id, visibility }: { id: string; visibility: "active" | "archived" }) =>
      visibility === "active" ? adminApi.adminActivateCourse(id) : adminApi.adminArchiveCourse(id),
    onSuccess: (_data, variables) => {
      setActionError(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(variables.id);
        return next;
      });
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
  const actionsBusy =
    bulkRunning || reorderMutation.isPending || visibilityMutation.isPending;
  const reorderEnabled = visibilityFilter === "all";

  const moveCourse = (courseId: string, direction: -1 | 1) => {
    if (!reorderEnabled || actionsBusy) return;
    const index = courses.findIndex((course) => course.id === courseId);
    if (index < 0) return;
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
      <div className="mb-6 flex flex-wrap items-center justify-end gap-4">
        <Link
          href="/courses/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-label font-bold text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95"
        >
          <MaterialIcon name="add" size={18} />
          Thêm khóa học mới
        </Link>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon="school"
          label="Tổng số khóa học"
          value={isLoading ? "—" : stats.total.toLocaleString("vi-VN")}
          hint={isLoading ? undefined : "Toàn bộ danh mục"}
          iconClassName="bg-primary/10 text-primary"
          valueClassName="text-primary"
        />
        <StatCard
          icon="check_circle"
          label="Đang mở đăng ký"
          value={isLoading ? "—" : stats.active.toLocaleString("vi-VN")}
          hint={
            isLoading
              ? undefined
              : `${stats.activePct.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}% trên tổng số`
          }
          iconClassName="bg-success/10 text-success"
          valueClassName="text-success"
        />
        <StatCard
          icon="menu_book"
          label="Tổng số môn học"
          value={isLoading ? "—" : stats.subjectTotal.toLocaleString("vi-VN")}
          hint={isLoading ? undefined : "Tổng môn thuộc các khóa"}
          iconClassName="bg-warning/10 text-warning"
          valueClassName="text-warning"
        />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTER_TABS.map((tab) => {
          const active = visibilityFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => changeFilter(tab.value)}
              className={
                active
                  ? "rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-on-primary transition-all"
                  : "rounded-full border border-outline-variant bg-surface-container-low px-4 py-1.5 text-xs font-medium text-on-surface-variant transition-all hover:bg-surface-container-high"
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {actionError && (
        <p className="mb-5 rounded-xl border border-error/30 bg-error-container px-6 py-3 text-body-sm text-on-error-container">
          {actionError}
        </p>
      )}

      {selectedIds.size > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-6 py-3.5">
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
        <div className="mb-5 rounded-xl border border-outline-variant bg-surface-container-lowest px-6 py-3.5 text-body-sm">
          Thành công: <strong className="text-success">{bulkResult.success}</strong> · Thất bại:{" "}
          <strong className={bulkResult.failed ? "text-error" : ""}>{bulkResult.failed}</strong>
        </div>
      )}

      <AdminDataTable
        footer={
          !isLoading ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant bg-surface-container-low/30 px-6 py-4">
              <p className="text-xs text-on-surface-variant">
                Hiển thị{" "}
                <span className="font-bold text-on-surface">
                  {pageStart} - {pageEnd}
                </span>{" "}
                của <span className="font-bold text-on-surface">{filtered.length}</span> kết quả
              </p>
              {filtered.length > 0 ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Trang trước"
                  >
                    <MaterialIcon name="chevron_left" size={20} />
                  </button>
                  {paginationRange.map((pageNum, index) =>
                    pageNum === "ellipsis" ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-on-surface-variant">
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setPage(pageNum)}
                        className={
                          pageNum === safePage
                            ? "h-8 w-8 rounded-lg bg-primary text-xs font-bold text-on-primary"
                            : "h-8 w-8 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container-high"
                        }
                      >
                        {pageNum}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Trang sau"
                  >
                    <MaterialIcon name="chevron_right" size={20} />
                  </button>
                </div>
              ) : null}
            </div>
          ) : undefined
        }
      >
        <TableHeader>
          <TableRow className="bg-surface-container-low/50">
            <TableHead className={`w-12 ${cellClass}`}>
              <input
                type="checkbox"
                aria-label="Chọn tất cả khóa học trên trang"
                checked={allSelected}
                disabled={bulkRunning || pageRows.length === 0}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={toggleAll}
                className={checkboxClass}
              />
            </TableHead>
            <TableHead className={headClass}>Khóa học &amp; mã</TableHead>
            <TableHead className={headClass}>Môn học</TableHead>
            <TableHead className={headClass}>Thứ tự</TableHead>
            <TableHead className={headClass}>Trạng thái</TableHead>
            <TableHead className={`w-[200px] text-right ${headClass}`}>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={6} className={`${cellClass} py-10 text-center text-on-surface-variant`}>
                Đang tải...
              </TableCell>
            </TableRow>
          )}
          {!isLoading && filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className={`${cellClass} py-10 text-center text-on-surface-variant`}>
                {courses.length === 0
                  ? "Chưa có khóa học."
                  : "Không có khóa học trong bộ lọc này."}
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            pageRows.map((course) => {
              const globalIndex = courses.findIndex((c) => c.id === course.id);
              return (
                <CourseRow
                  key={course.id}
                  course={course}
                  checked={selectedIds.has(course.id)}
                  actionsBusy={actionsBusy}
                  canMoveUp={reorderEnabled && globalIndex > 0}
                  canMoveDown={
                    reorderEnabled && globalIndex >= 0 && globalIndex < courses.length - 1
                  }
                  onToggle={() => toggleRow(course.id)}
                  onMoveUp={() => moveCourse(course.id, -1)}
                  onMoveDown={() => moveCourse(course.id, 1)}
                  onActivate={() =>
                    visibilityMutation.mutate({ id: course.id, visibility: "active" })
                  }
                  onArchive={() =>
                    visibilityMutation.mutate({ id: course.id, visibility: "archived" })
                  }
                  onDelete={() => handleDelete([course.id])}
                />
              );
            })}
        </TableBody>
      </AdminDataTable>

      <div className="mt-6 flex gap-3 rounded-xl border border-warning/40 bg-warning/10 px-5 py-4">
        <MaterialIcon name="info" size={22} className="mt-0.5 shrink-0 text-warning" filled />
        <div>
          <p className="text-sm font-bold text-on-surface">Hướng dẫn quản trị viên</p>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Thay đổi trên khóa học Công khai áp dụng ngay. Dùng trạng thái Lưu trữ để tạm đóng đăng
            ký mà không xóa dữ liệu.
          </p>
        </div>
      </div>
    </AdminPageShell>
  );
}

function CourseRow({
  course,
  checked,
  actionsBusy,
  canMoveUp,
  canMoveDown,
  onToggle,
  onMoveUp,
  onMoveDown,
  onActivate,
  onArchive,
  onDelete,
}: {
  course: AdminCourseView;
  checked: boolean;
  actionsBusy: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onActivate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const visibilityBadge = VISIBILITY_BADGES[course.visibility] ?? VISIBILITY_BADGES.archived;
  const initial = (course.name.trim().charAt(0) || "?").toUpperCase();

  return (
    <TableRow data-state={checked ? "selected" : undefined} className={rowClass}>
      <TableCell className={cellClass}>
        <input
          type="checkbox"
          aria-label={`Chọn khóa học ${course.name}`}
          checked={checked}
          disabled={actionsBusy}
          onChange={onToggle}
          className={checkboxClass}
        />
      </TableCell>
      <TableCell className={cellClass}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-primary">{course.name}</div>
            <div className="font-mono text-[11px] text-on-surface-variant">{course.code}</div>
            {course.description ? (
              <div className="mt-0.5 truncate text-[11px] text-on-surface-variant">
                {course.description}
              </div>
            ) : null}
          </div>
        </div>
      </TableCell>
      <TableCell className={`${cellClass} text-sm font-semibold text-on-surface`}>
        {course.subjectCount.toLocaleString("vi-VN")}
      </TableCell>
      <TableCell className={`${cellClass} text-sm text-on-surface`}>{course.displayOrder}</TableCell>
      <TableCell className={cellClass}>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${visibilityBadge.className}`}
        >
          <span
            aria-hidden="true"
            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${visibilityBadge.dotClassName}`}
          />
          {visibilityBadge.label}
        </span>
      </TableCell>
      <TableCell className={`${cellClass} text-right`}>
        <AdminTableActions>
          <AdminIconAction
            icon={ArrowUp}
            label="Lên"
            disabled={!canMoveUp || actionsBusy}
            onClick={onMoveUp}
          />
          <AdminIconAction
            icon={ArrowDown}
            label="Xuống"
            disabled={!canMoveDown || actionsBusy}
            onClick={onMoveDown}
          />
          <AdminIconAction
            icon={course.visibility === "active" ? Archive : Check}
            label={course.visibility === "active" ? "Lưu trữ" : "Kích hoạt"}
            disabled={actionsBusy}
            onClick={course.visibility === "active" ? onArchive : onActivate}
          />
          <AdminIconAction icon={Pencil} label="Sửa" href={`/courses/${course.id}`} />
          {course.subjectCount === 0 && (
            <AdminIconAction
              icon={Trash2}
              label="Xóa"
              disabled={actionsBusy}
              onClick={onDelete}
            />
          )}
        </AdminTableActions>
      </TableCell>
    </TableRow>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  iconClassName,
  valueClassName,
}: {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  iconClassName: string;
  valueClassName: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
      >
        <MaterialIcon name={icon} size={24} filled />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
          {label}
        </p>
        <p className={`text-2xl font-display ${valueClassName}`}>{value}</p>
        {hint ? <p className="mt-0.5 text-xs text-on-surface-variant">{hint}</p> : null}
      </div>
    </div>
  );
}
