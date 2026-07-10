"use client";

import type { StudyQuestionListItem, StudyTierStatus } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { CatalogSkeleton } from "./catalog-skeleton";
import { PullToRefresh } from "./pull-to-refresh";
import { StudyMeterBadge } from "./study-meter-badge";
import { StudyQuestionRow } from "./study-question-row";

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
  className,
}: StudyQuestionListProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showMeter = !studyTier.hasActiveSubscription;

  const listBody = (
    <div className={cn("space-y-4", className)} data-screen={screenId}>
      {showMeter && <StudyMeterBadge studyTier={studyTier} />}

      {loading && items.length === 0 ? (
        <CatalogSkeleton count={4} />
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-muted">Chưa có câu hỏi nào để ôn tập.</p>
      ) : (
        <ul className="space-y-3" data-component="study-question-list">
          {items.map((item) => (
            <li key={item.id}>
              <StudyQuestionRow
                item={item}
                studyTier={studyTier}
                onSelect={onSelectQuestion}
                onLockedSelect={onLockedSelect}
              />
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
            disabled={page <= 1 || loading}
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
            disabled={page >= totalPages || loading}
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
