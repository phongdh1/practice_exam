"use client";

import type { MockExamResultsView } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export interface MockExamResultsViewProps {
  results: MockExamResultsView;
  onReviewQuestions: () => void;
  onDone: () => void;
  screenId?: "W-34" | "Z-34" | "W-42" | "Z-42";
  className?: string;
}

export function MockExamResultsScreen({
  results,
  onReviewQuestions,
  onDone,
  screenId = "W-34",
  className,
}: MockExamResultsViewProps) {
  return (
    <div className={cn("space-y-6", className)} data-screen={screenId}>
      <div className="text-center">
        <p className="text-label text-ink-muted">{results.templateName}</p>
        <p className="mt-2 font-mono text-display font-bold text-ink">{results.scorePercent}%</p>
        <p className={cn("mt-2 text-title font-semibold", results.passed ? "text-success" : "text-ink")}>
          {results.passed ? "Đạt yêu cầu" : "Chưa đạt yêu cầu"}
        </p>
        <p className="mt-1 text-sm text-ink-muted">Ngưỡng đạt: {results.passingScorePercent}%</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kết quả theo phần</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {results.sectionBreakdown.map((section) => (
            <div
              key={section.sectionIndex}
              className="flex items-center justify-between rounded-lg border border-outline-variant px-4 py-3 text-sm"
            >
              <span>
                Phần {section.sectionOrder + 1} · {section.correctCount}/{section.totalCount} câu đúng
              </span>
              <span className="font-medium">{section.scorePercent}%</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="outline" onClick={onReviewQuestions}>
          Xem giải thích từng câu
        </Button>
        <Button type="button" onClick={onDone}>
          Hoàn tất
        </Button>
      </div>
    </div>
  );
}
