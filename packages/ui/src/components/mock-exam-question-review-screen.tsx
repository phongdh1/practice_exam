"use client";

import type { MockExamQuestionReview } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { AnswerOption } from "./answer-option";
import { Button } from "./ui/button";

export interface MockExamQuestionReviewScreenProps {
  reviews: MockExamQuestionReview[];
  currentIndex: number;
  onChangeIndex: (index: number) => void;
  onBack: () => void;
  screenId?: "W-35" | "Z-35" | "W-42" | "Z-42";
  className?: string;
}

export function MockExamQuestionReviewScreen({
  reviews,
  currentIndex,
  onChangeIndex,
  onBack,
  screenId = "W-35",
  className,
}: MockExamQuestionReviewScreenProps) {
  const review = reviews[currentIndex];
  if (!review) return null;

  return (
    <div className={cn("space-y-6", className)} data-screen={screenId}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-label font-medium text-ink-muted">
          Câu {review.globalQuestionNumber} / {reviews.length}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          Quay lại kết quả
        </Button>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <p className="text-body font-medium text-ink">{review.stem}</p>
        <div className="mt-5 space-y-3">
          {review.options.map((option, index) => {
            let state: "default" | "selected" | "correct" | "incorrect" = "default";
            if (review.correctOptionKeys.includes(option.key)) state = "correct";
            else if (review.selectedKeys.includes(option.key)) state = "incorrect";
            return (
              <AnswerOption
                key={option.key}
                label={option.text}
                index={index}
                state={state}
              />
            );
          })}
        </div>
        {review.explanation && (
          <p className="mt-5 text-sm text-ink-muted">
            <span className="font-medium text-ink">Giải thích: </span>
            {review.explanation}
          </p>
        )}
      </div>

      <div className="flex justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={currentIndex <= 0}
          onClick={() => onChangeIndex(currentIndex - 1)}
        >
          Câu trước
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={currentIndex >= reviews.length - 1}
          onClick={() => onChangeIndex(currentIndex + 1)}
        >
          Câu sau
        </Button>
      </div>
    </div>
  );
}
