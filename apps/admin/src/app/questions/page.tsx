"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";

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
import { Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

const STATUS_LABELS: Record<string, string> = {
  draft: "Nháp",
  in_review: "Chờ duyệt",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
};

type BulkResult = { success: number; failed: number } | null;

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

  const filters = {
    search: searchParams.get("search") ?? "",
    status: searchParams.get("status") ?? "",
    difficulty: searchParams.get("difficulty") ?? "",
    topic: searchParams.get("topic") ?? "",
    page: Number(searchParams.get("page") ?? "1"),
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

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.questions.search(filters),
    queryFn: () => adminApi.adminSearchQuestions(filters),
  });

  const result = data?.data;
  const items = useMemo(() => result?.items ?? [], [result]);

  const searchKey = searchParams.toString();
  useEffect(() => {
    setSelectedIds(new Set());
    setBulkResult(null);
  }, [searchKey]);

  const selectedRows: BulkQuestionRow[] = useMemo(
    () =>
      items
        .filter((q) => selectedIds.has(q.id))
        .map((q) => ({ id: q.id, status: q.status })),
    [items, selectedIds],
  );

  const { draftIds, inReviewIds } = useMemo(
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

  const allSelected = items.length > 0 && items.every((q) => selectedIds.has(q.id));
  const someSelected = items.some((q) => selectedIds.has(q.id));

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (items.length > 0 && items.every((q) => prev.has(q.id))) {
        return new Set();
      }
      return new Set(items.map((q) => q.id));
    });
  }, [items]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const afterBulk = useCallback(
    (summary: { success: number; failed: number }, invalidateEditorial = false) => {
      setBulkResult(summary);
      setSelectedIds(new Set());
      void queryClient.invalidateQueries({ queryKey: ["questions"] });
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

  const bulkRunning = submitMutation.isPending || approveMutation.isPending;

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

  return (
    <AdminPageShell
      title="Ngân hàng câu hỏi"
      subtitle="Quản lý và biên tập nội dung các câu hỏi chứng chỉ (A-30)."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            placeholder="Tìm kiếm..."
            defaultValue={filters.search}
            onKeyDown={(e) => {
              if (e.key === "Enter") setFilter("search", (e.target as HTMLInputElement).value);
            }}
            className="rounded-lg border border-outline-variant px-3 py-2 text-body"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilter("status", e.target.value)}
            className="rounded-lg border border-outline-variant px-3 py-2 text-body"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={filters.difficulty}
            onChange={(e) => setFilter("difficulty", e.target.value)}
            className="rounded-lg border border-outline-variant px-3 py-2 text-body"
          >
            <option value="">Độ khó</option>
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
          <input
            type="text"
            placeholder="Chủ đề (tag)"
            defaultValue={filters.topic}
            onKeyDown={(e) => {
              if (e.key === "Enter") setFilter("topic", (e.target as HTMLInputElement).value);
            }}
            className="rounded-lg border border-outline-variant px-3 py-2 text-body"
          />
        </div>
        <div className="flex gap-2">
          <Link
            href="/questions/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label text-on-primary"
          >
            <MaterialIcon name="add" size={18} />
            Tạo câu hỏi
          </Link>
          <Link
            href="/questions/import"
            className="flex items-center gap-2 rounded-lg border border-outline px-4 py-2 text-label hover:bg-surface-container-low"
          >
            <MaterialIcon name="upload_file" size={18} />
            Import Excel
          </Link>
          <Link
            href="/review"
            className="flex items-center gap-2 rounded-lg border border-outline px-4 py-2 text-label hover:bg-surface-container-low"
          >
            <MaterialIcon name="fact_check" size={18} />
            Hàng đợi duyệt
          </Link>
        </div>
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
          result && result.total > result.pageSize ? (
            <div className="flex items-center justify-between border-t border-outline-variant px-4 py-3 text-label">
              <span>
                {result.total} câu hỏi — trang {result.page}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={result.page <= 1}
                  onClick={() => setFilter("page", String(result.page - 1))}
                  className="rounded border px-3 py-1 disabled:opacity-40"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={result.page * result.pageSize >= result.total}
                  onClick={() => setFilter("page", String(result.page + 1))}
                  className="rounded border px-3 py-1 disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            </div>
          ) : undefined
        }
      >
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                aria-label="Chọn tất cả câu hỏi trên trang"
                checked={allSelected}
                disabled={bulkRunning}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={toggleAll}
                className="rounded border-outline-variant text-primary disabled:opacity-40"
              />
            </TableHead>
            <TableHead>Câu hỏi</TableHead>
            <TableHead>Môn</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Độ khó</TableHead>
            <TableHead>Tác giả</TableHead>
            <TableHead className="w-[100px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <AdminTableEmpty colSpan={7}>Đang tải...</AdminTableEmpty>}
          {!isLoading && items.length === 0 && (
            <AdminTableEmpty colSpan={7}>Không có câu hỏi phù hợp.</AdminTableEmpty>
          )}
          {items.map((q: QuestionSummary) => {
            const checked = selectedIds.has(q.id);
            return (
              <TableRow key={q.id} data-state={checked ? "selected" : undefined}>
                <TableCell>
                  <input
                    type="checkbox"
                    aria-label={`Chọn câu hỏi ${q.stem.slice(0, 40)}`}
                    checked={checked}
                    disabled={bulkRunning}
                    onChange={() => toggleRow(q.id)}
                    className="rounded border-outline-variant text-primary disabled:opacity-40"
                  />
                </TableCell>
                <TableCell className="max-w-md truncate">{q.stem}</TableCell>
                <TableCell>{q.subjectName}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{STATUS_LABELS[q.status] ?? q.status}</Badge>
                </TableCell>
                <TableCell className="capitalize">{q.difficulty}</TableCell>
                <TableCell>{q.authorName}</TableCell>
                <TableCell className="text-right">
                  <AdminTableActions>
                    <AdminIconAction icon={Pencil} label="Sửa" href={`/questions/${q.id}/edit`} />
                    <AdminIconAction
                      icon={Eye}
                      label="Xem trước"
                      href={`/questions/${q.id}/preview`}
                    />
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
