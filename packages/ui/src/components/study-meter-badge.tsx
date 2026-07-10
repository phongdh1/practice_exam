import type { StudyTierStatus } from "@practice-exam/types";
import { formatStudyTierMeter } from "@practice-exam/utils";
import { cn } from "../lib/utils";
import { MaterialIcon } from "./material-icon";

export interface StudyMeterBadgeProps {
  studyTier: StudyTierStatus;
  className?: string;
}

function studyTierProgress(used: number, limit: number) {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

/** Study Tier meter badge (Z-11, W-11, Z-12, W-12) */
export function StudyMeterBadge({ studyTier, className }: StudyMeterBadgeProps) {
  if (studyTier.hasActiveSubscription) return null;

  const progress = studyTierProgress(studyTier.used, studyTier.limit);

  return (
    <div
      className={cn(
        "rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3",
        className,
      )}
      data-component="study-meter-badge"
      role="status"
    >
      <p className="mb-2 flex items-center gap-2 text-body-sm text-on-surface-variant">
        <MaterialIcon name="visibility" size={18} className="text-primary" />
        {formatStudyTierMeter(studyTier.used, studyTier.limit)}
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
        <div
          className="h-full rounded-full bg-secondary transition-all duration-500"
          style={{ width: `${Math.max(progress, 2)}%` }}
        />
      </div>
    </div>
  );
}
