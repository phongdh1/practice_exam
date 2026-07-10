"use client";

import * as React from "react";
import type { PracticeQuestionView, QuestionTypeValue } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { AnswerOption, type AnswerOptionState } from "./answer-option";
import { Button } from "./ui/button";
import { MaterialIcon } from "./material-icon";

export interface PracticeQuestionViewProps {
  question: PracticeQuestionView;
  questionNumber: number;
  selectedKeys: string[];
  revealed: boolean;
  isCorrect: boolean | null;
  correctOptionKeys: string[];
  explanation: string | null;
  onToggleOption: (key: string) => void;
  onConfirm: () => void;
  onNext: () => void;
  onEnd: () => void;
  onFlag: () => void;
  confirming?: boolean;
  loadingNext?: boolean;
  screenId?: "W-21" | "Z-21";
  className?: string;
}

function optionState(
  key: string,
  selectedKeys: string[],
  revealed: boolean,
  correctOptionKeys: string[],
): AnswerOptionState {
  if (!revealed) {
    return selectedKeys.includes(key) ? "selected" : "default";
  }
  if (correctOptionKeys.includes(key)) return "correct";
  if (selectedKeys.includes(key)) return "incorrect";
  return "default";
}

function isMultipleChoice(type: QuestionTypeValue) {
  return type === "multiple_choice";
}

/** Stitch W-21 / Z-21 — one question with confirm-before-reveal flow */
export function PracticeQuestionView({
  question,
  questionNumber,
  selectedKeys,
  revealed,
  isCorrect,
  correctOptionKeys,
  explanation,
  onToggleOption,
  onConfirm,
  onNext,
  onEnd,
  onFlag,
  confirming = false,
  loadingNext = false,
  screenId = "W-21",
  className,
}: PracticeQuestionViewProps) {
  const multi = isMultipleChoice(question.questionType);
  const canConfirm = selectedKeys.length > 0 && !revealed;
  const canNext = revealed;

  return (
    <div className={cn("space-y-6", className)} data-screen={screenId}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-label font-medium text-ink-muted">Câu {questionNumber}</p>
        <Button type="button" variant="ghost" size="sm" onClick={onEnd}>
          Kết thúc
        </Button>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <p className="text-body font-medium text-ink">{question.stem}</p>
        {question.imageUrls.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {question.imageUrls.map((url) => (
              <img key={url} src={url} alt="" className="max-h-40 rounded-lg object-contain" />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3" role={multi ? "group" : "radiogroup"} aria-label="Đáp án">
        {question.options.map((option, index) => (
          <AnswerOption
            key={option.key}
            label={option.text}
            index={index}
            state={optionState(option.key, selectedKeys, revealed, correctOptionKeys)}
            disabled={revealed || confirming}
            onClick={() => onToggleOption(option.key)}
          />
        ))}
      </div>

      {!revealed && (
        <Button
          type="button"
          className="w-full"
          disabled={!canConfirm || confirming}
          onClick={onConfirm}
        >
          {confirming ? "Đang xử lý..." : "Xác nhận"}
        </Button>
      )}

      {revealed && (
        <div className="space-y-4">
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-3 text-body font-medium",
              isCorrect ? "bg-success-muted text-success" : "bg-error-muted text-error",
            )}
            role="status"
          >
            <MaterialIcon
              name={isCorrect ? "check_circle" : "cancel"}
              size={22}
              filled
              className={isCorrect ? "text-success" : "text-error"}
            />
            <span>{isCorrect ? "Chính xác" : "Chưa đúng"}</span>
          </div>

          {explanation && (
            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
              <p className="text-label font-semibold text-primary">Giải thích</p>
              <p className="mt-2 text-body-sm text-ink-muted">{explanation}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" className="flex-1" onClick={onFlag}>
              Báo cáo câu hỏi
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={!canNext || loadingNext}
              onClick={onNext}
            >
              {loadingNext ? "Đang tải..." : "Câu tiếp"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
