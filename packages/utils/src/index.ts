/** Format date in ICT timezone */
export function ictDate(iso: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export { formatVnd } from "./format-vnd";
export {
  formatFreeTierCatalogLabel,
  formatFreeTierMeter,
  formatMonthlyPriceVnd,
  formatStudyTierMeter,
  formatSubscriptionActivePill,
  resolveSubjectCardStatusLabel,
  resolveSubjectDisplayName,
  type SubjectSubscriptionStatus,
  type SubjectSubscriptionView,
} from "./subject-display";
export { getIctPeriodKey, ICT_TIMEZONE } from "./ict-period";
export {
  isPracticeAnswerCorrect,
  practiceSessionExpiresAt,
  PRACTICE_SESSION_TTL_MS,
} from "./practice-answer";
export {
  scanProhibitedClaims,
  type ContentComplianceResult,
  type ProhibitedClaimMatch,
} from "./content-compliance";
