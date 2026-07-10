"use client";

import type { MockExamQuestionView, QuestionTypeValue } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { AnswerOption } from "./answer-option";
import { Button } from "./ui/button";

export interface MockExamSectionQuestionProps {
  question: MockExamQuestionView;
  sectionLabel: string;
  selectedKeys: string[];
  onToggleOption: (key: string) => void;
  onSaveAndNext: () => void;
  onFinishSection: () => void;
  isLastInSection: boolean;
  saving?: boolean;
  onExit: () => void;
  screenId?: "W-32" | "Z-32";
  className?: string;
}

function isMultipleChoice(type: QuestionTypeValue) {
  return type === "multiple_choice";
}

export function MockExamSectionQuestion({
  question,
  sectionLabel,
  selectedKeys,
  onToggleOption,
  onSaveAndNext,
  onFinishSection,
  isLastInSection,
  saving = false,
  onExit,
  screenId = "W-32",
  className,
}: MockExamSectionQuestionProps) {
  const multi = isMultipleChoice(question.questionType);
  const canProceed = selectedKeys.length > 0;

  return (
    <div className={cn("space-y-6", className)} data-screen={screenId}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-label font-medium text-ink-muted">
          {sectionLabel} · Câu {question.globalQuestionNumber}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onExit}>
          Thoát
        </Button>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <p className="text-body font-medium text-ink">{question.stem}</p>
        <div className="mt-5 space-y-3" role={multi ? "group" : "radiogroup"} aria-label="Đáp án">
          {question.options.map((option, index) => (
            <AnswerOption
              key={option.key}
              label={option.text}
              index={index}
              state={selectedKeys.includes(option.key) ? "selected" : "default"}
              onClick={() => onToggleOption(option.key)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={!canProceed || saving}
          onClick={isLastInSection ? onFinishSection : onSaveAndNext}
        >
          {saving ? "Đang lưu..." : isLastInSection ? "Hoàn thành phần thi" : "Câu tiếp theo"}
        </Button>
      </div>
    </div>
  );
}
