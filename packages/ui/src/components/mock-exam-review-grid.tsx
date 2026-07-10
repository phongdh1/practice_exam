"use client";

import type { MockExamReviewItem } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export interface MockExamReviewGridProps {
  items: MockExamReviewItem[];
  sectionCount: number;
  onJumpToQuestion: (questionId: string) => void;
  onSubmit: () => void;
  submitting?: boolean;
  confirmOpen: boolean;
  onConfirmOpenChange: (open: boolean) => void;
  screenId?: "W-33" | "Z-33";
  className?: string;
}

export function MockExamReviewGrid({
  items,
  sectionCount,
  onJumpToQuestion,
  onSubmit,
  submitting = false,
  confirmOpen,
  onConfirmOpenChange,
  screenId = "W-33",
  className,
}: MockExamReviewGridProps) {
  const unanswered = items.filter((item) => !item.answered).length;

  const bySection = Array.from({ length: sectionCount }, (_, sectionIndex) =>
    items.filter((item) => item.sectionIndex === sectionIndex),
  );

  return (
    <div className={cn("space-y-6", className)} data-screen={screenId}>
      <div>
        <h2 className="text-title font-semibold text-ink">Xem lại bài thi</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Bạn có thể chuyển đến bất kỳ câu nào để thay đổi đáp án trước khi nộp bài.
        </p>
        {unanswered > 0 && (
          <p className="mt-2 text-sm text-warning">Còn {unanswered} câu chưa trả lời.</p>
        )}
      </div>

      {bySection.map((sectionItems, sectionIndex) => (
        <div key={sectionIndex} className="space-y-3">
          <p className="text-sm font-medium text-ink">Phần {sectionIndex + 1}</p>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
            {sectionItems.map((item) => (
              <button
                key={item.questionId}
                type="button"
                onClick={() => onJumpToQuestion(item.questionId)}
                className={cn(
                  "rounded-md border px-2 py-2 text-sm font-medium transition-colors",
                  item.answered
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-outline-variant text-ink-muted",
                )}
              >
                {item.globalQuestionNumber}
              </button>
            ))}
          </div>
        </div>
      ))}

      <Button type="button" className="w-full sm:w-auto" onClick={() => onConfirmOpenChange(true)}>
        Nộp bài
      </Button>

      <Dialog open={confirmOpen} onOpenChange={onConfirmOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận nộp bài</DialogTitle>
            <DialogDescription>
              Sau khi nộp, bạn không thể thay đổi câu trả lời. Bạn có chắc muốn nộp bài?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onConfirmOpenChange(false)}>
              Xem lại
            </Button>
            <Button type="button" onClick={onSubmit} disabled={submitting}>
              {submitting ? "Đang nộp..." : "Nộp bài"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
