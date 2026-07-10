import * as React from "react";
import { cn } from "../lib/utils";
import { MaterialIcon } from "./material-icon";

export type AnswerOptionState = "default" | "selected" | "correct" | "incorrect";

export interface AnswerOptionProps extends React.HTMLAttributes<HTMLButtonElement> {
  label: string;
  state?: AnswerOptionState;
  index?: number;
  disabled?: boolean;
}

const stateClasses: Record<AnswerOptionState, string> = {
  default: "border border-outline-variant bg-surface-container-lowest hover:border-primary/40",
  selected: "border-2 border-primary bg-secondary",
  correct: "border-2 border-success bg-success-muted",
  incorrect: "border-2 border-error bg-error-muted",
};

const stateIcons: Partial<Record<AnswerOptionState, string>> = {
  selected: "radio_button_checked",
  correct: "check_circle",
  incorrect: "cancel",
};

/** Stitch W-21 / Z-21 practice answer option */
export function AnswerOption({
  label,
  state = "default",
  index,
  disabled,
  className,
  ...props
}: AnswerOptionProps) {
  const icon = stateIcons[state];

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex w-full items-start gap-4 rounded-xl p-4 text-left text-body transition-all active:scale-[0.99]",
        stateClasses[state],
        className,
      )}
      data-component={`answer-option-${state}`}
      aria-pressed={state === "selected"}
      {...props}
    >
      {index !== undefined && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-label font-bold text-primary">
          {String.fromCharCode(65 + index)}
        </span>
      )}
      <span className="flex-1 pt-0.5">{label}</span>
      {icon && <MaterialIcon name={icon} size={22} className="shrink-0 text-primary" filled />}
    </button>
  );
}
