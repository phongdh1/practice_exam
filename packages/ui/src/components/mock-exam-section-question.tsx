"use client";

import type { MockExamQuestionView, QuestionTypeValue } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { AnswerOption } from "./answer-option";
import { Button } from "./ui/button";

export interface MockExamSectionQuestionProps {
  question: MockExamQuestionView;
  sectionLabel: string;
  totalQuestions?: number;
  sectionQuestionCount?: number;
  reviewing?: boolean;
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
  totalQuestions,
  sectionQuestionCount,
  reviewing = false,
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
    <div className={cn("space-y-5", className)} data-screen={screenId}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-label font-medium text-ink-muted">
          {reviewing ? "Xem lại" : sectionLabel} · Câu {question.globalQuestionNumber}{totalQuestions ? `/${totalQuestions}` : ""}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={onExit}>
          Thoát
        </Button>
      </div>

      <div className={cn("grid gap-4", screenId === "W-32" && sectionQuestionCount && "md:grid-cols-[minmax(0,1fr)_15rem]")}>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6">
          <h2 className="text-heading font-heading text-ink">{question.stem}</h2>
          {question.imageUrls.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {question.imageUrls.map((url, index) => (
                <img key={url} src={url} alt={`Hình minh họa ${index + 1}`} className="max-h-72 max-w-full rounded-lg object-contain" />
              ))}
            </div>
          )}
          <p className="mt-4 text-sm text-ink-muted">{multi ? "Chọn các đáp án phù hợp." : "Chọn một đáp án."}</p>
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

          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              disabled={!canProceed || saving}
              onClick={isLastInSection ? onFinishSection : onSaveAndNext}
            >
              {saving ? "Đang lưu..." : reviewing ? "Lưu đáp án" : isLastInSection ? "Hoàn thành phần thi" : "Câu tiếp theo"}
            </Button>
          </div>
        </div>
        {screenId === "W-32" && sectionQuestionCount && (
          <aside className="h-fit space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <h3 className="font-semibold text-primary">Tiến độ phần thi</h3>
            <p className="text-sm text-ink-muted">{question.questionIndex}/{sectionQuestionCount} câu đã lưu</p>
            <progress className="w-full accent-primary" value={question.questionIndex} max={sectionQuestionCount} aria-label="Số câu đã lưu trong phần thi" />
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: sectionQuestionCount }, (_, index) => (
                <span
                  key={index}
                  aria-current={index === question.questionIndex ? "step" : undefined}
                  aria-label={`Câu ${index + 1}: ${index < question.questionIndex ? "đã lưu" : index === question.questionIndex ? "hiện tại" : "chưa trả lời"}`}
                  className={cn(
                    "rounded-md border py-1 text-center text-xs",
                    index < question.questionIndex && "border-success bg-success-muted text-success",
                    index === question.questionIndex && "border-primary font-bold text-primary",
                  )}
                >
                  {index + 1}
                </span>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
