"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { adminApi } from "@/lib/admin-api";
import { useAdminRole } from "@/lib/admin-role";
import {
  partitionByStatus,
  queryKeys,
  summarizeSettled,
  type BulkQuestionRow,
} from "@practice-exam/api-client";
import type { QuestionSummary } from "@practice-exam/types";
import {
  AdminDataTable,
  AdminTableEmpty,
  MaterialIcon,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

const STATUS_CHIPS = [
  { value: "", label: "Tất cả" },
  { value: "published", label: "Published" },
  { value: "in_review", label: "In Review" },
  { value: "draft", label: "Draft" },
] as const;

const STATUS_BADGES: Record<string, { label: string; className: string; dotClassName: string }> = {
  published: {
    label: "Published",
    className: "bg-success-muted text-success",
    dotClassName: "bg-success",
  },
  in_review: {
    label: "In Review",
    className: "bg-warning-muted text-warning border border-warning/20",
    dotClassName: "bg-warning",
  },
  draft: {
    label: "Draft",
    className: "bg-surface-container-highest text-on-surface-variant",
    dotClassName: "bg-on-surface-variant",
  },
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
};

type BulkResult = { success: number; failed: number } | null;

function questionDisplayId(id: string): string {
  return `Q-${id.replace(/-/g, "").slice(-5).toUpperCase()}`;
}

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

function formatStatValue(value: number | undefined): string {
  if (value === undefined) return "—";
  return value.toLocaleString("vi-VN");
}

export default function QuestionBankPage() {
  return (
    <AdminRoleGate allowedRoles={["editor", "reviewer", "super_admin"]}>
      <Suspense fallback={<p className="p-8 text-ink-muted">Đang tải...</p>}>
        <QuestionBankContent />
      </Suspense>
    </AdminRoleGate>
  );
}

function QuestionBankContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const role = useAdminRole();

  const canSubmit = role === "editor" || role === "super_admin";
  const canApprove = role === "reviewer" || role === "super_admin";
  const canDelete = role === "editor" || role === "super_admin";

  const filters = {
    search: searchParams.get("search") ?? "",
    status: searchParams.get("status") ?? "",
    difficulty: searchParams.get("difficulty") ?? "",
    topic: searchParams.get("topic") ?? "",
    courseId: searchParams.get("courseId") ?? "",
    subjectId: searchParams.get("subjectId") ?? "",
    page: Number(searchParams.get("page") ?? "1"),
    pageSize: Number(searchParams.get("pageSize") ?? "25"),
  };

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkResult, setBulkResult] = useState<BulkResult>(null);

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      if (key !== "page") params.delete("page");
      router.push(`/questions?${params.toString()}`);
    },
    [router, searchParams],
  );

  const { data, isLoading, refetch: refetchQuestions } = useQuery({
    queryKey: queryKeys.questions.search(filters),
    queryFn: () => adminApi.adminSearchQuestions(filters),
  });

  const {
    data: statsData,
    isError: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: queryKeys.questions.stats,
    queryFn: () => adminApi.adminGetQuestionStats(),
  });

  const { data: subjectsData } = useQuery({
    queryKey: queryKeys.subjects.admin,
    queryFn: () => adminApi.adminListSubjects(),
  });

  const allSubjects = subjectsData?.data ?? [];
  const selectedSubjectName =
    allSubjects.find((subject) => subject.id === filters.subjectId)?.name ?? "Tất cả";

  const result = data?.data;
  const items = useMemo(() => result?.items ?? [], [result]);
  const stats = statsData?.data;

  const searchKey = searchParams.toString();
  useEffect(() => {
    setSelectedIds(new Set());
    setBulkResult(null);
  }, [searchKey]);

  const selectedRows: BulkQuestionRow[] = useMemo(
    () =>
      items
        .filter((question) => selectedIds.has(question.id))
        .map((question) => ({ id: question.id, status: question.status })),
    [items, selectedIds],
  );

  const { draftIds, inReviewIds, deletableIds } = useMemo(
    () => partitionByStatus(selectedRows),
    [selectedRows],
  );

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected = items.length > 0 && items.every((question) => selectedIds.has(question.id));
  const someSelected = items.some((question) => selectedIds.has(question.id));

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (items.length > 0 && items.every((question) => prev.has(question.id))) {
        return new Set();
      }
      return new Set(items.map((question) => question.id));
    });
  }, [items]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const afterBulk = useCallback(
    (summary: { success: number; failed: number }, invalidateEditorial = false) => {
      setBulkResult(summary);
      setSelectedIds(new Set());
      void queryClient.invalidateQueries({ queryKey: ["questions"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.questions.stats });
      if (invalidateEditorial) {
        void queryClient.invalidateQueries({ queryKey: ["editorial", "queue"] });
      }
    },
    [queryClient],
  );

  const submitMutation = useMutation({
    mutationFn: async () => {
      const results = await Promise.allSettled(
        draftIds.map((id) => adminApi.adminSubmitQuestionForReview(id)),
      );
      return summarizeSettled(results);
    },
    onSuccess: (summary) => afterBulk(summary),
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      const results = await Promise.allSettled(
        inReviewIds.map(async (id) => {
          await adminApi.adminAssignReview(id);
          return adminApi.adminApproveQuestion(id);
        }),
      );
      return summarizeSettled(results);
    },
    onSuccess: (summary) => afterBulk(summary, true),
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map((id) => adminApi.adminDeleteQuestion(id)));
      return summarizeSettled(results);
    },
    onSuccess: (summary) => afterBulk(summary),
  });

  const bulkRunning =
    submitMutation.isPending || approveMutation.isPending || deleteMutation.isPending;

  const handleSubmit = () => {
    if (draftIds.length === 0) return;
    if (
      !window.confirm(
        `Gửi duyệt ${draftIds.length} câu hỏi ở trạng thái Nháp? Các câu ở trạng thái khác sẽ được bỏ qua.`,
      )
    ) {
      return;
    }
    setBulkResult(null);
    submitMutation.mutate();
  };

  const handleApprove = () => {
    if (inReviewIds.length === 0) return;
    if (
      !window.confirm(
        `Duyệt ${inReviewIds.length} câu hỏi ở trạng thái Chờ duyệt? Các câu ở trạng thái khác sẽ được bỏ qua.`,
      )
    ) {
      return;
    }
    setBulkResult(null);
    approveMutation.mutate();
  };

  const handleDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Xóa vĩnh viễn ${ids.length} câu hỏi? Câu đã xuất bản sẽ bị bỏ qua. Hành động không thể hoàn tác.`,
      )
    ) {
      return;
    }
    setBulkResult(null);
    deleteMutation.mutate(ids);
  };

  const handleRefresh = () => {
    clearSelection();
    setBulkResult(null);
    void refetchQuestions();
    void refetchStats();
  };

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;
  const pageStart = result && result.total > 0 ? (result.page - 1) * result.pageSize + 1 : 0;
  const pageEnd = result ? Math.min(result.page * result.pageSize, result.total) : 0;
  const paginationRange = getPaginationRange(result?.page ?? 1, totalPages);

  return (
    <AdminPageShell
      title="Ngân hàng câu hỏi"
      subtitle="Quản lý và biên tập nội dung các câu hỏi chứng chỉ (A-30)."
    >
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
        <Link
          href="/questions/import"
          className="text-label text-primary hover:underline"
        >
          Import Excel
        </Link>
        <Link href="/review" className="text-label text-primary hover:underline">
          Hàng đợi duyệt
        </Link>
        <Link
          href="/questions/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-label font-bold text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95"
        >
          <MaterialIcon name="add" size={18} />
          Tạo câu hỏi mới
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
        <div className="mr-2 flex items-center gap-2 text-label text-on-surface-variant">
          <MaterialIcon name="filter_list" size={20} />
          Bộ lọc:
        </div>

        <div className="relative">
          <label className="sr-only" htmlFor="subject-filter">
            Môn học
          </label>
          <select
            id="subject-filter"
            value={filters.subjectId}
            onChange={(event) => setFilter("subjectId", event.target.value)}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-body-sm hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Môn học: Tất cả</option>
            {allSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                Môn học: {subject.name}
              </option>
            ))}
          </select>
          <span className="sr-only">Đang chọn: {selectedSubjectName}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_CHIPS.map((chip) => {
            const active = filters.status === chip.value;
            return (
              <button
                key={chip.value || "all"}
                type="button"
                onClick={() => setFilter("status", chip.value)}
                className={
                  active
                    ? "rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-on-primary transition-all"
                    : "rounded-full border border-outline-variant bg-surface-container-low px-4 py-1.5 text-xs font-medium text-on-surface-variant transition-all hover:bg-surface-container-high"
                }
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        <div className="hidden h-6 w-px bg-outline-variant sm:block" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-label text-on-surface-variant">Độ khó:</span>
          <select
            value={filters.difficulty}
            onChange={(event) => setFilter("difficulty", event.target.value)}
            className="cursor-pointer border-none bg-transparent text-xs font-bold text-primary focus:ring-0"
          >
            <option value="">Tất cả độ khó</option>
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="ml-auto flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          <MaterialIcon name="refresh" size={16} />
          Làm mới
        </button>
      </div>

      {someSelected && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3">
          <span className="text-label font-medium text-on-surface">
            Đã chọn {selectedRows.length} câu (trang này)
          </span>
          {canSubmit && (
            <button
              type="button"
              disabled={draftIds.length === 0 || bulkRunning}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label text-on-primary disabled:opacity-40"
            >
              <MaterialIcon name="send" size={18} />
              {submitMutation.isPending
                ? "Đang gửi..."
                : `Gửi duyệt${draftIds.length ? ` (${draftIds.length})` : ""}`}
            </button>
          )}
          {canApprove && (
            <button
              type="button"
              disabled={inReviewIds.length === 0 || bulkRunning}
              onClick={handleApprove}
              className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-label text-on-primary disabled:opacity-40"
            >
              <MaterialIcon name="done_all" size={18} />
              {approveMutation.isPending
                ? "Đang duyệt..."
                : `Duyệt tất cả${inReviewIds.length ? ` (${inReviewIds.length})` : ""}`}
            </button>
          )}
          {canDelete && (
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
          )}
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
          result ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant bg-surface-container-low/30 px-6 py-4">
              <p className="text-xs text-on-surface-variant">
                Hiển thị{" "}
                <span className="font-bold text-on-surface">
                  {pageStart} - {pageEnd}
                </span>{" "}
                trên tổng số{" "}
                <span className="font-bold text-on-surface">{result.total}</span> câu hỏi
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={result.page <= 1}
                  onClick={() => setFilter("page", String(result.page - 1))}
                  className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Trang trước"
                >
                  <MaterialIcon name="chevron_left" size={20} />
                </button>
                {paginationRange.map((page, index) =>
                  page === "ellipsis" ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-on-surface-variant">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setFilter("page", String(page))}
                      className={
                        page === result.page
                          ? "h-8 w-8 rounded-lg bg-primary text-xs font-bold text-on-primary"
                          : "h-8 w-8 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container-high"
                      }
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  disabled={result.page >= totalPages}
                  onClick={() => setFilter("page", String(result.page + 1))}
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
            <TableHead className="w-12 px-6">
              <input
                type="checkbox"
                aria-label="Chọn tất cả câu hỏi trên trang"
                checked={allSelected}
                disabled={bulkRunning}
                ref={(element) => {
                  if (element) element.indeterminate = someSelected && !allSelected;
                }}
                onChange={toggleAll}
                className="rounded border-outline-variant text-primary focus:ring-primary/20 disabled:opacity-40"
              />
            </TableHead>
            <TableHead className="px-6 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Nội dung câu hỏi
            </TableHead>
            <TableHead className="w-40 px-6 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Môn học
            </TableHead>
            <TableHead className="w-32 px-6 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Trạng thái
            </TableHead>
            <TableHead className="w-28 px-6 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Độ khó
            </TableHead>
            <TableHead className="w-24 px-6 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <AdminTableEmpty colSpan={6}>Đang tải...</AdminTableEmpty>}
          {!isLoading && items.length === 0 && (
            <AdminTableEmpty colSpan={6}>Không có câu hỏi phù hợp.</AdminTableEmpty>
          )}
          {items.map((question: QuestionSummary) => {
            const checked = selectedIds.has(question.id);
            const badge = STATUS_BADGES[question.status] ?? {
              label: question.status,
              className: "bg-surface-container-highest text-on-surface-variant",
              dotClassName: "bg-on-surface-variant",
            };

            return (
              <TableRow
                key={question.id}
                data-state={checked ? "selected" : undefined}
                className="group hover:bg-surface-subtle"
              >
                <TableCell className="px-6">
                  <input
                    type="checkbox"
                    aria-label={`Chọn câu hỏi ${question.stem.slice(0, 40)}`}
                    checked={checked}
                    disabled={bulkRunning}
                    onChange={() => toggleRow(question.id)}
                    className="rounded border-outline-variant text-primary focus:ring-primary/20 disabled:opacity-40"
                  />
                </TableCell>
                <TableCell className="px-6">
                  <div className="flex flex-col">
                    <p className="line-clamp-1 text-sm font-semibold text-primary">{question.stem}</p>
                    <p className="mt-0.5 text-[11px] text-on-surface-variant">
                      ID: {questionDisplayId(question.id)} • Cập nhật:{" "}
                      {formatRelativeTime(question.updatedAt)}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="max-w-40 px-6">
                  {question.subjectName ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block truncate text-sm text-on-surface">
                          {question.subjectName}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{question.subjectName}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-sm text-on-surface-variant">—</span>
                  )}
                </TableCell>
                <TableCell className="px-6">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${badge.className}`}
                  >
                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${badge.dotClassName}`} />
                    {badge.label}
                  </span>
                </TableCell>
                <TableCell className="px-6">
                  <span className="text-sm text-on-surface-variant">
                    {DIFFICULTY_LABELS[question.difficulty] ?? question.difficulty}
                  </span>
                </TableCell>
                <TableCell className="px-6 text-right">
                  <Link
                    href={`/questions/${question.id}/edit`}
                    className="rounded-lg px-3 py-1.5 text-sm font-bold text-primary transition-all hover:bg-primary/10"
                  >
                    Sửa
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </AdminDataTable>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard
          icon="list_alt"
          label="Tổng số câu hỏi"
          value={formatStatValue(statsError ? undefined : stats?.total)}
          iconClassName="bg-primary/10 text-primary"
          valueClassName="text-primary"
        />
        <StatCard
          icon="check_circle"
          label="Đã xuất bản"
          value={formatStatValue(statsError ? undefined : stats?.published)}
          iconClassName="bg-success/10 text-success"
          valueClassName="text-success"
        />
        <StatCard
          icon="rate_review"
          label="Đang chờ duyệt"
          value={formatStatValue(statsError ? undefined : stats?.inReview)}
          iconClassName="bg-warning/10 text-warning"
          valueClassName="text-warning"
        />
        <StatCard
          icon="drafts"
          label="Bản nháp"
          value={formatStatValue(statsError ? undefined : stats?.draft)}
          iconClassName="bg-surface-container-highest text-on-surface-variant"
          valueClassName="text-on-surface"
        />
      </div>
    </AdminPageShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  iconClassName,
  valueClassName,
}: {
  icon: string;
  label: string;
  value: string;
  iconClassName: string;
  valueClassName: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${iconClassName}`}
      >
        <MaterialIcon name={icon} size={24} filled />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
          {label}
        </p>
        <p className={`text-2xl font-display ${valueClassName}`}>{value}</p>
      </div>
    </div>
  );
}
