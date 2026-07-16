"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import { adminApi } from "@/lib/admin-api";
import { queryKeys, summarizeSettled } from "@practice-exam/api-client";
import type { AdminSubjectView } from "@practice-exam/types";
import {
  AdminDataTable,
  AdminIconAction,
  AdminTableActions,
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
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type BulkResult = { success: number; failed: number } | null;
type VisibilityFilter = "all" | "active" | "archived";

const PAGE_SIZE = 10;

const VISIBILITY_BADGES = {
  active: {
    label: "Hoạt động",
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
  { value: "active", label: "Hoạt động" },
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

function formatFee(amount: number | null): string {
  if (amount == null) return "—";
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

function questionBarTone(count: number, min: number): string {
  if (min <= 0) return "bg-on-surface-variant/40";
  if (count >= min) return "bg-success";
  if (count <= 0) return "bg-on-surface-variant/30";
  return "bg-warning";
}

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
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.subjects.admin,
    queryFn: () => adminApi.adminListSubjects(),
  });

  const subjects = data?.data ?? [];

  const stats = useMemo(() => {
    const total = subjects.length;
    const active = subjects.filter((s) => s.visibility === "active").length;
    const goLiveReady = subjects.filter((s) => s.goLive.canActivate).length;
    const activePct = total > 0 ? (active / total) * 100 : 0;
    return { total, active, goLiveReady, activePct };
  }, [subjects]);

  const filtered = useMemo(() => {
    if (visibilityFilter === "all") return subjects;
    return subjects.filter((s) => s.visibility === visibilityFilter);
  }, [subjects, visibilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(safePage * PAGE_SIZE, filtered.length);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const paginationRange = getPaginationRange(safePage, totalPages);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

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

  const allSelected =
    pageRows.length > 0 && pageRows.every((subject) => selectedIds.has(subject.id));
  const someSelected = pageRows.some((subject) => selectedIds.has(subject.id));

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (pageRows.length > 0 && pageRows.every((subject) => prev.has(subject.id))) {
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
  };

  const visibilityMutation = useMutation({
    mutationFn: ({ id, visibility }: { id: string; visibility: "active" | "archived" }) =>
      visibility === "active" ? adminApi.adminActivateSubject(id) : adminApi.adminArchiveSubject(id),
    onSuccess: () => {
      setActionError(null);
      setSelectedIds(new Set());
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
      <div className="mb-6 flex flex-wrap items-center justify-end gap-4">
        <Link
          href="/subjects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-label font-bold text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95"
        >
          <MaterialIcon name="add" size={18} />
          Thêm môn học mới
        </Link>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon="menu_book"
          label="Tổng số môn học"
          value={isLoading ? "—" : stats.total.toLocaleString("vi-VN")}
          hint={isLoading ? undefined : "Toàn bộ danh mục"}
          iconClassName="bg-primary/10 text-primary"
          valueClassName="text-primary"
        />
        <StatCard
          icon="check_circle"
          label="Đang hoạt động"
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
          icon="rocket_launch"
          label="Go-live sẵn sàng"
          value={isLoading ? "—" : stats.goLiveReady.toLocaleString("vi-VN")}
          hint={isLoading ? undefined : "Đủ điều kiện go-live (canActivate)"}
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
        <div className="mb-5 rounded-xl border border-outline-variant bg-surface-container-lowest px-6 py-3.5 text-body-sm">
          Thành công: <strong className="text-success">{bulkResult.success}</strong> · Thất bại:{" "}
          <strong className={bulkResult.failed ? "text-error" : ""}>{bulkResult.failed}</strong>
        </div>
      )}

      <AdminDataTable
        footer={
          !isLoading && filtered.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant bg-surface-container-low/30 px-6 py-4">
              <p className="text-xs text-on-surface-variant">
                Hiển thị{" "}
                <span className="font-bold text-on-surface">
                  {pageStart} - {pageEnd}
                </span>{" "}
                trong số <span className="font-bold text-on-surface">{filtered.length}</span> môn học
              </p>
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
            </div>
          ) : undefined
        }
      >
        <TableHeader>
          <TableRow className="bg-surface-container-low/50">
            <TableHead className={`w-12 ${cellClass}`}>
              <input
                type="checkbox"
                aria-label="Chọn tất cả môn học trên trang"
                checked={allSelected}
                disabled={bulkRunning || pageRows.length === 0}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={toggleAll}
                className={checkboxClass}
              />
            </TableHead>
            <TableHead className={headClass}>Môn học &amp; mã</TableHead>
            <TableHead className={headClass}>Học phí (VND/tháng)</TableHead>
            <TableHead className={headClass}>Giới hạn free</TableHead>
            <TableHead className={headClass}>Câu hỏi</TableHead>
            <TableHead className={headClass}>Trạng thái</TableHead>
            <TableHead className={`w-[180px] text-right ${headClass}`}>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={7} className={`${cellClass} py-10 text-center text-on-surface-variant`}>
                Đang tải...
              </TableCell>
            </TableRow>
          )}
          {!isLoading && filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className={`${cellClass} py-10 text-center text-on-surface-variant`}>
                {subjects.length === 0
                  ? "Chưa có môn học."
                  : "Không có môn học trong bộ lọc này."}
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            pageRows.map((subject) => (
              <SubjectRow
                key={subject.id}
                subject={subject}
                checked={selectedIds.has(subject.id)}
                bulkRunning={bulkRunning}
                visibilityPending={visibilityMutation.isPending}
                onToggle={() => toggleRow(subject.id)}
                onActivate={() =>
                  visibilityMutation.mutate({ id: subject.id, visibility: "active" })
                }
                onArchive={() =>
                  visibilityMutation.mutate({ id: subject.id, visibility: "archived" })
                }
                onDelete={() => handleDelete([subject.id])}
              />
            ))}
        </TableBody>
      </AdminDataTable>
    </AdminPageShell>
  );
}

function SubjectRow({
  subject,
  checked,
  bulkRunning,
  visibilityPending,
  onToggle,
  onActivate,
  onArchive,
  onDelete,
}: {
  subject: AdminSubjectView;
  checked: boolean;
  bulkRunning: boolean;
  visibilityPending: boolean;
  onToggle: () => void;
  onActivate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const visibilityBadge = VISIBILITY_BADGES[subject.visibility] ?? VISIBILITY_BADGES.archived;
  const minQ = subject.goLive.requirements.minPublishedQuestions;
  const qCount = subject.goLive.publishedQuestionCount;
  const barPct = minQ > 0 ? Math.min(100, (qCount / minQ) * 100) : 0;
  const initial = (subject.name.trim().charAt(0) || "?").toUpperCase();

  return (
    <TableRow data-state={checked ? "selected" : undefined} className={rowClass}>
      <TableCell className={cellClass}>
        <input
          type="checkbox"
          aria-label={`Chọn môn học ${subject.name}`}
          checked={checked}
          disabled={bulkRunning}
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
            <div className="flex items-center gap-2">
              <div className="truncate text-sm font-semibold text-primary">{subject.name}</div>
              {subject.isHot && (
                <Badge variant="secondary" className="shrink-0">
                  Hot
                </Badge>
              )}
            </div>
            <div className="font-mono text-[11px] text-on-surface-variant">{subject.code}</div>
            <div className="truncate text-[11px] text-on-surface-variant">{subject.courseName}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className={`${cellClass} text-sm font-semibold text-on-surface`}>
        {formatFee(subject.monthlyAmountVnd)}
      </TableCell>
      <TableCell className={cellClass}>
        <span className="inline-flex rounded-full bg-surface-container-high px-2.5 py-0.5 text-xs font-medium text-on-surface-variant">
          {subject.freeTierLimit == null ? "—" : `${subject.freeTierLimit}/tháng`}
        </span>
      </TableCell>
      <TableCell className={cellClass}>
        <div className="text-sm font-semibold text-on-surface">
          {qCount.toLocaleString("vi-VN")}
        </div>
        <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-surface-container-high">
          <div
            className={`h-full rounded-full ${questionBarTone(qCount, minQ)}`}
            style={{ width: `${barPct}%` }}
          />
        </div>
        {minQ > 0 ? (
          <div className="mt-1 text-[10px] text-on-surface-variant">
            mục tiêu {minQ.toLocaleString("vi-VN")}
          </div>
        ) : null}
      </TableCell>
      <TableCell className={cellClass}>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${visibilityBadge.className}`}
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
          {subject.visibility === "archived" ? (
            subject.goLive.canActivate ? (
              <AdminIconAction
                icon={Check}
                label="Kích hoạt"
                disabled={visibilityPending}
                onClick={onActivate}
              />
            ) : null
          ) : (
            <AdminIconAction
              icon={Archive}
              label="Lưu trữ"
              disabled={visibilityPending}
              onClick={onArchive}
            />
          )}
          <AdminIconAction icon={Pencil} label="Sửa" href={`/subjects/${subject.id}`} />
          {subject.visibility === "archived" && (
            <AdminIconAction
              icon={Trash2}
              label="Xóa"
              disabled={bulkRunning}
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
