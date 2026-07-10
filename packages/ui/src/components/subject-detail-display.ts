import type { StudyTierStatus } from "@practice-exam/types";
import type { SubjectSubscriptionView } from "@practice-exam/utils";

export function resolveHasSubscription(input: {
  freeTierStatus?: { hasActiveSubscription?: boolean } | null;
  subscription?: SubjectSubscriptionView | null;
}): boolean {
  return Boolean(
    input.freeTierStatus?.hasActiveSubscription ||
      input.subscription?.status === "active" ||
      input.subscription?.status === "expiring",
  );
}

export function resolveSubjectDetailMeterVisibility(input: {
  hasSubscription: boolean;
  studyTierStatus?: StudyTierStatus | null;
}): { showFreeTierSection: boolean; showStudyMeter: boolean } {
  return {
    showFreeTierSection: !input.hasSubscription,
    showStudyMeter: Boolean(input.studyTierStatus && !input.hasSubscription),
  };
}
