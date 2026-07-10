"use client";

import type { MockExamCandidateTemplateView } from "@practice-exam/types";
import { resolveSubjectDisplayName } from "@practice-exam/utils";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export interface MockExamTemplateListProps {
  templates: MockExamCandidateTemplateView[];
  onSelect: (templateId: string) => void;
  subjectNamesById?: ReadonlyMap<string, string>;
  screenId?: "W-30" | "Z-30";
  className?: string;
}

export function MockExamTemplateList({
  templates,
  onSelect,
  subjectNamesById,
  screenId = "W-30",
  className,
}: MockExamTemplateListProps) {
  if (templates.length === 0) {
    return (
      <p className="text-sm text-ink-muted" data-screen={screenId}>
        Chưa có đề thi thử cho môn học này.
      </p>
    );
  }

  return (
    <div className={cn("grid gap-4", className)} data-screen={screenId}>
      {templates.map((template) => {
        const disabled = !template.canStart;
        const attemptsLabel = `Còn ${template.attempts.remaining}/${template.attempts.limit} lượt tháng này`;
        const subjectsCovered = template.subjectIds
          .map((id) => resolveSubjectDisplayName(id, subjectNamesById))
          .join(", ");
        return (
          <Card
            key={template.id}
            className={cn(disabled && "opacity-60")}
            aria-disabled={disabled}
          >
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>
                {template.totalDurationMinutes} phút · {template.totalQuestions} câu · Đạt{" "}
                {template.passingScorePercent}%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {subjectsCovered && (
                <p className="text-sm text-ink-muted">Môn học: {subjectsCovered}</p>
              )}
              <p className="text-sm text-ink-muted">{attemptsLabel}</p>
              {template.attemptsExhausted && (
                <p className="text-sm text-ink-muted">Đã dùng hết {template.attempts.limit} lượt tháng này.</p>
              )}
              {template.accessDeniedReason && !template.attemptsExhausted && (
                <p className="text-sm text-ink-muted">Cần đăng ký để thi thử.</p>
              )}
              <Button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(template.id)}
                className="w-full sm:w-auto"
              >
                {disabled ? "Không thể bắt đầu" : "Xem chi tiết"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
