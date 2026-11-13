"use client";

import { useEffect, useRef, useState } from "react";
import type { StudyQuestionDetail as StudyQuestionDetailData, StudyQuestionListItem, StudyTierStatus } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { CatalogSkeleton } from "./catalog-skeleton";
import { PullToRefresh } from "./pull-to-refresh";
import { StudyMeterBadge } from "./study-meter-badge";
import { StudyQuestionDetail } from "./study-question-detail";
import { isStudyRowLocked, StudyQuestionRow } from "./study-question-row";

export interface StudyQuestionListProps {
  items: StudyQuestionListItem[];
  studyTier: StudyTierStatus;
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  screenId?: "Z-12" | "W-12";
  enablePullToRefresh?: boolean;
  onRefresh?: () => Promise<unknown> | unknown;
  onSelectQuestion: (questionId: string) => void;
  onLockedSelect?: () => void;
  loadQuestionDetail?: (id: string) => Promise<StudyQuestionDetailData>;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Study question list (Z-12, W-12) */
export function StudyQuestionList({
  items,
  studyTier,
  total,
  page,
  pageSize,
  loading = false,
  screenId = "W-12",
  enablePullToRefresh = false,
  onRefresh,
  onSelectQuestion,
  onLockedSelect,
  onPageChange,
  loadQuestionDetail,
  className,
}: StudyQuestionListProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [details, setDetails] = useState<Record<string, StudyQuestionDetailData>>({});
  const [expanded, setExpanded] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [updatedTier, setUpdatedTier] = useState<StudyTierStatus | null>(null);
  const currentTier = updatedTier ?? studyTier;
  const run = useRef(0);
  useEffect(() => () => { run.current += 1; }, []);
  const showMeter = !currentTier.hasActiveSubscription;

  async function expandAll() {
    if (!loadQuestionDetail) return;
    const runId = ++run.current;
    setExpanded(true);
    setDetailLoading(true);
    setDetailError(null);
    let tier = currentTier;
    let hasLockedQuestions = false;
    try {
      for (const item of items) {
        if (run.current !== runId) return;
        if (details[item.id]) continue;
        if (isStudyRowLocked(item, tier)) {
          hasLockedQuestions = true;
          continue;
        }
        try {
          const detail = await loadQuestionDetail(item.id);
          if (run.current !== runId) return;
          tier = detail.studyTier;
          setUpdatedTier(tier);
          setDetails((previous) => ({ ...previous, [item.id]: detail }));
        } catch (error) {
          if (run.current !== runId) return;
          if (error && typeof error === "object" && "code" in error && error.code === "STUDY_TIER_EXCEEDED") {
            hasLockedQuestions = true;
            continue;
          }
          throw error;
        }
      }
      if (hasLockedQuestions) setDetailError("Một số câu hỏi bị khóa do đã hết lượt ôn tập.");
    } catch {
      setDetailError("Không thể tải đầy đủ đáp án. Vui lòng thử lại.");
    } finally {
      if (run.current === runId) setDetailLoading(false);
    }
  }

  function collapseAll() {
    run.current += 1;
    setExpanded(false);
    setDetailLoading(false);
  }

  const listBody = (
    <div className={cn("space-y-4", className)} data-screen={screenId}>
      {showMeter && <StudyMeterBadge studyTier={currentTier} />}
      {loadQuestionDetail && items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={loading || detailLoading}
            onClick={() => void expandAll()}>
            Mở tất cả
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!expanded} onClick={collapseAll}>
            Thu gọn tất cả
          </Button>
        </div>
      )}
      {expanded && detailLoading && <p role="status" className="text-sm">Đang tải đáp án...</p>}
      {expanded && detailError && <p role="status" className="text-sm">{detailError}</p>}

      {loading && items.length === 0 ? (
        <CatalogSkeleton count={4} />
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-muted">Chưa có câu hỏi nào để ôn tập.</p>
      ) : (
        <ul className="space-y-3" data-component="study-question-list">
          {items.map((item) => (
            <li key={item.id}>
              {expanded && details[item.id] ? (
                <StudyQuestionDetail
                  question={details[item.id]}
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
                />
              ) : (
                <StudyQuestionRow
                  item={details[item.id] ? { ...item, viewedThisPeriod: true } : item}
                  studyTier={currentTier}
                  onSelect={onSelectQuestion}
                  onLockedSelect={onLockedSelect}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading || detailLoading}
            onClick={() => onPageChange(page - 1)}
          >
            Trang trước
          </Button>
          <span className="text-caption text-ink-muted">
            Trang {page}/{totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading || detailLoading}
            onClick={() => onPageChange(page + 1)}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );

  if (enablePullToRefresh && onRefresh) {
    return (
      <PullToRefresh onRefresh={onRefresh} disabled={loading}>
        {listBody}
      </PullToRefresh>
    );
  }

  return listBody;
}
