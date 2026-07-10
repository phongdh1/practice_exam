"use client";

import type { PracticeSessionDetailView } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { MaterialIcon } from "./material-icon";

export interface PracticeSessionDetailViewProps {
  detail: PracticeSessionDetailView;
  onBack: () => void;
  screenId?: "W-42" | "Z-42";
  className?: string;
}

export function PracticeSessionDetailScreen({
  detail,
  onBack,
  screenId = "W-42",
  className,
}: PracticeSessionDetailViewProps) {
  return (
    <div className={cn("mx-auto max-w-3xl space-y-6", className)} data-screen={screenId}>
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-center">
        <h1 className="text-display-sm font-heading text-primary">Chi tiết luyện tập</h1>
        <p className="mt-2 text-body text-ink-muted">{detail.subjectName}</p>
        <p className="mt-4 text-display-sm font-bold text-primary">{detail.scorePercent}%</p>
        <p className="text-sm text-ink-muted">
          {detail.correctCount}/{detail.answeredCount} câu đúng
        </p>
      </div>

      <ol className="space-y-4">
        {detail.questions.map((question) => (
          <li key={question.questionId}>
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                      question.isCorrect ? "bg-secondary" : "bg-error",
                    )}
                  >
                    {question.questionNumber}
                  </span>
                  <p className="flex-1 text-body text-ink">{question.stem}</p>
                  <MaterialIcon
                    name={question.isCorrect ? "check_circle" : "cancel"}
                    size={20}
                    className={question.isCorrect ? "text-secondary" : "text-error"}
                  />
                </div>
                <ul className="space-y-1 pl-8 text-sm">
                  {question.options.map((option) => {
                    const selected = question.selectedKeys.includes(option.key);
                    const correct = question.correctOptionKeys.includes(option.key);
                    return (
                      <li
                        key={option.key}
                        className={cn(
                          "rounded px-2 py-1",
                          correct && "bg-secondary/10 font-medium",
                          selected && !correct && "bg-error/10",
                        )}
                      >
                        {option.key}. {option.text}
                      </li>
                    );
                  })}
                </ul>
                {question.explanation && (
                  <p className="rounded-lg bg-surface-container-low p-3 text-sm text-ink-muted">
                    {question.explanation}
                  </p>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>

      <Button type="button" variant="outline" className="w-full" onClick={onBack}>
        Quay lại lịch sử
      </Button>
    </div>
  );
}
