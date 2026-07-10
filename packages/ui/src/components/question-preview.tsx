import * as React from "react";
import type { QuestionPreview as QuestionPreviewData } from "@practice-exam/types";
import { AnswerOption } from "./answer-option";
import { cn } from "../lib/utils";

export interface QuestionPreviewProps {
  question: QuestionPreviewData;
  showExplanation?: boolean;
  className?: string;
}

/** Candidate-render preview — matches Practice Mode (A-32 / W-21 / Z-21) */
export function QuestionPreview({
  question,
  showExplanation = false,
  className,
}: QuestionPreviewProps) {
  const [revealed, setRevealed] = React.useState(showExplanation);

  return (
    <div className={cn("mx-auto max-w-2xl space-y-6", className)} data-component="question-preview">
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <p className="whitespace-pre-wrap text-body text-on-surface">{question.stem}</p>
        {question.imageUrls.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {question.imageUrls.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                className="max-h-48 rounded-lg border border-outline-variant object-contain"
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isCorrect = question.correctOptionKeys.includes(option.key);
          const state = revealed && isCorrect ? "correct" : "default";
          return (
            <AnswerOption
              key={option.key}
              label={option.text}
              index={index}
              state={state}
              disabled
            />
          );
        })}
      </div>

      {question.explanation && (
        <div className="space-y-3">
          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="w-full rounded-lg bg-primary px-4 py-3 text-label font-bold text-on-primary transition-opacity hover:opacity-90"
            >
              Xem giải thích
            </button>
          ) : (
            <div className="rounded-xl border border-success/30 bg-success-muted p-4">
              <p className="mb-2 text-label font-bold text-success">Giải thích</p>
              <p className="whitespace-pre-wrap text-body text-on-surface">{question.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
