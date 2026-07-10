"use client";

import type { MockExamAttemptView } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export interface MockExamBriefingProps {
  attempt: MockExamAttemptView;
  attemptsRemaining: number;
  attemptsLimit: number;
  onStart: () => void;
  onBack: () => void;
  loading?: boolean;
  screenId?: "W-31" | "Z-31";
  className?: string;
}

export function MockExamBriefing({
  attempt,
  attemptsRemaining,
  attemptsLimit,
  onStart,
  onBack,
  loading = false,
  screenId = "W-31",
  className,
}: MockExamBriefingProps) {
  return (
    <div className={cn("space-y-6", className)} data-screen={screenId}>
      <div>
        <h1 className="text-headline font-semibold text-ink">{attempt.templateName}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {attempt.totalDurationMinutes} phút · {attempt.totalQuestions} câu · Ngưỡng đạt{" "}
          {attempt.passingScorePercent}%
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Còn {attemptsRemaining}/{attemptsLimit} lượt tháng này
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quy tắc thi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-ink-muted">
          <p>Thi theo từng phần với thời gian riêng.</p>
          <p>Trong mỗi phần, chỉ được đi tiếp — không quay lại phần trước.</p>
          <p>Sau phần cuối, bạn xem lại toàn bộ câu trả lời trước khi nộp bài.</p>
          <p>Câu trả lời được lưu tự động khi bạn chọn đáp án.</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-sm font-medium text-ink">Cấu trúc đề thi</p>
        <ul className="space-y-2">
          {attempt.sections.map((section) => (
            <li
              key={section.sectionIndex}
              className="rounded-lg border border-outline-variant px-4 py-3 text-sm"
            >
              Phần {section.sectionOrder + 1}: {section.questionCount} câu · {section.timeLimitMinutes}{" "}
              phút · Trọng số {section.weightPercent}%
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="outline" onClick={onBack}>
          Quay lại
        </Button>
        <Button type="button" onClick={onStart} disabled={loading}>
          {loading ? "Đang bắt đầu..." : "Bắt đầu thi"}
        </Button>
      </div>
    </div>
  );
}
