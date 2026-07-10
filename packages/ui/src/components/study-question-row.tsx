import type { StudyQuestionListItem, StudyTierStatus } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { MaterialIcon } from "./material-icon";

export function isStudyRowLocked(
  item: Pick<StudyQuestionListItem, "viewedThisPeriod">,
  studyTier: Pick<StudyTierStatus, "isAtLimit" | "hasActiveSubscription">,
): boolean {
  if (studyTier.hasActiveSubscription) return false;
  if (!studyTier.isAtLimit) return false;
  return !item.viewedThisPeriod;
}

function truncateStem(stem: string, maxLength = 120): string {
  const normalized = stem.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1)}…`;
}

export interface StudyQuestionRowProps {
  item: StudyQuestionListItem;
  studyTier: StudyTierStatus;
  onSelect: (questionId: string) => void;
  onLockedSelect?: () => void;
  className?: string;
}

/** Study list row (Z-12, W-12) — stem preview only, no answer indicators */
export function StudyQuestionRow({
  item,
  studyTier,
  onSelect,
  onLockedSelect,
  className,
}: StudyQuestionRowProps) {
  const locked = isStudyRowLocked(item, studyTier);
  const primaryTag = item.tags[0];

  function handleClick() {
    if (locked) {
      onLockedSelect?.();
      return;
    }
    onSelect(item.id);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-left transition-all hover:border-primary/40",
        locked && "opacity-80",
        className,
      )}
      data-component="study-question-row"
      data-locked={locked ? "true" : "false"}
      data-viewed={item.viewedThisPeriod ? "true" : "false"}
    >
      <div className="flex-1 space-y-2">
        <p className="text-body text-on-surface">{truncateStem(item.stem)}</p>
        <div className="flex flex-wrap items-center gap-2 text-caption text-ink-muted">
          {primaryTag && (
            <span className="rounded-full bg-surface-container px-2 py-0.5">{primaryTag}</span>
          )}
          <span className="capitalize">{item.difficulty}</span>
        </div>
      </div>
      {locked ? (
        <MaterialIcon name="lock" size={20} className="mt-1 shrink-0 text-ink-muted" />
      ) : (
        <MaterialIcon name="chevron_right" size={20} className="mt-1 shrink-0 text-primary" />
      )}
    </button>
  );
}
