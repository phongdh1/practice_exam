import * as React from "react";
import { cn } from "../lib/utils";

export interface DisclaimerFooterProps {
  text: string;
  className?: string;
  onOpenFull?: () => void;
}

/** Persistent compact disclaimer banner for candidate surfaces */
export function DisclaimerFooter({ text, className, onOpenFull }: DisclaimerFooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-disclaimer-border bg-disclaimer-bg px-4 py-3 text-xs leading-relaxed text-ink-muted",
        className,
      )}
      data-component="disclaimer-footer"
    >
      <p>{text}</p>
      {onOpenFull && (
        <button
          type="button"
          onClick={onOpenFull}
          className="mt-1 text-primary underline"
        >
          Xem đầy đủ
        </button>
      )}
    </footer>
  );
}
