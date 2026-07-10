"use client";

import type { StudyQuestionDetail as StudyQuestionDetailData } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { AnswerOption } from "./answer-option";
import { Button } from "./ui/button";
import { MaterialIcon } from "./material-icon";

export interface StudyQuestionDetailProps {
  question: StudyQuestionDetailData;
  onFlag?: () => void;
  screenId?: "Z-13" | "W-13";
  className?: string;
}

/** Read-only study detail with answers visible on load (Z-13, W-13) */
export function StudyQuestionDetail({
  question,
  onFlag,
  screenId = "W-13",
  className,
}: StudyQuestionDetailProps) {
  const correctSet = new Set(question.correctOptionKeys);

  return (
    <article
      className={cn("space-y-6", className)}
      data-component="study-question-detail"
      data-screen={screenId}
    >
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-caption text-ink-muted">
          {question.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-surface-container px-2 py-0.5">
              {tag}
            </span>
          ))}
          <span className="capitalize">{question.difficulty}</span>
        </div>
        <h1 className="text-heading font-heading text-primary">{question.stem}</h1>
      </header>

      <div className="space-y-3" role="list">
        {question.options.map((option, index) => {
          const isCorrect = correctSet.has(option.key);
          return (
            <AnswerOption
              key={option.key}
              label={option.text}
              index={index}
              state={isCorrect ? "correct" : "default"}
              disabled
              role="listitem"
            />
          );
        })}
      </div>

      {question.explanation && (
        <section className="rounded-xl border border-outline-variant bg-surface-container-low p-4">
          <h2 className="mb-2 flex items-center gap-2 text-body font-medium text-primary">
            <MaterialIcon name="lightbulb" size={18} />
            Giải thích
          </h2>
          <p className="text-body-sm leading-relaxed text-on-surface-variant">
            {question.explanation}
          </p>
        </section>
      )}

      {onFlag && (
        <Button type="button" variant="ghost" className="text-muted-foreground" onClick={onFlag}>
          Báo cáo câu hỏi
        </Button>
      )}
    </article>
  );
}
