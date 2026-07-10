import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** Practice Exam typography tokens (tailwind fontSize) — not in tailwind-merge defaults. */
const typographySizes = [
  "display-lg",
  "display-sm",
  "heading",
  "body",
  "body-sm",
  "label",
  "caption",
  "question-stem",
] as const;

/** Semantic text colors from tailwind-preset — hyphenated names are ambiguous to twMerge. */
const semanticTextColors = [
  "on-primary",
  "on-primary-container",
  "on-surface",
  "on-surface-variant",
  "on-background",
  "ink-muted",
  "ink-disabled",
  "price-highlight",
  "subscription-active",
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...typographySizes] }],
      "text-color": [{ text: [...semanticTextColors] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
