"use client";

import * as React from "react";
import type { PracticeSessionSummary } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { MaterialIcon } from "./material-icon";

export interface PracticeSessionSummaryViewProps {
  summary: PracticeSessionSummary;
  onPracticeAgain?: () => void;
  onSubscribe?: () => void;
  onBack: () => void;
  screenId?: "W-22" | "Z-22";
  className?: string;
}

/** Stitch W-22 / Z-22 — practice session end summary */
export function PracticeSessionSummaryView({
  summary,
  onPracticeAgain,
  onSubscribe,
  onBack,
  screenId = "W-22",
  className,
}: PracticeSessionSummaryViewProps) {
  return (
    <div className={cn("mx-auto max-w-lg space-y-6 text-center", className)} data-screen={screenId}>
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8">
        <MaterialIcon name="emoji_events" size={48} className="mx-auto text-primary" />
        <h1 className="mt-4 text-display-sm font-heading text-primary">Kết quả luyện tập</h1>
        <p className="mt-2 text-body text-ink-muted">{summary.subjectName}</p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-surface-container-low p-4">
            <p className="text-display-sm font-bold text-primary">{summary.scorePercent}%</p>
            <p className="text-label text-ink-muted">Điểm</p>
          </div>
          <div className="rounded-lg bg-surface-container-low p-4">
            <p className="text-display-sm font-bold text-primary">
              {summary.correctCount}/{summary.answeredCount}
            </p>
            <p className="text-label text-ink-muted">Câu đúng</p>
          </div>
        </div>

        {summary.freeTierAtLimit && onSubscribe && (
          <p className="mt-6 text-body-sm text-ink-muted">
            Bạn đã dùng hết lượt miễn phí tháng này. Đăng ký để luyện tập không giới hạn.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {summary.freeTierAtLimit && onSubscribe ? (
          <Button type="button" className="w-full" onClick={onSubscribe}>
            Đăng ký ngay
          </Button>
        ) : (
          onPracticeAgain && (
            <Button type="button" className="w-full" onClick={onPracticeAgain}>
              Luyện tập tiếp
            </Button>
          )
        )}
        <Button type="button" variant="outline" className="w-full" onClick={onBack}>
          Quay lại môn học
        </Button>
      </div>
    </div>
  );
}
