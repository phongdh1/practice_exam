import { formatVnd } from "./format-vnd";

const UNKNOWN_SUBJECT_LABEL = "Môn học khác";

/** Resolve a subject name for display; never returns a raw UUID. */
export function resolveSubjectDisplayName(
  subjectId: string,
  namesById?: ReadonlyMap<string, string>,
): string {
  const name = namesById?.get(subjectId);
  if (name) return name;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subjectId)) {
    return UNKNOWN_SUBJECT_LABEL;
  }
  return subjectId;
}

/** Monthly subscription price label for catalog cards */
export function formatMonthlyPriceVnd(amount: number): string {
  return `${formatVnd(amount)}/tháng`;
}

/** Free Tier meter for subject detail (Z-11, W-11) */
export function formatFreeTierMeter(used: number, limit: number): string {
  return `Đã dùng ${used}/${limit} câu luyện tập miễn phí tháng này.`;
}

/** Study Tier meter for subject detail and study list (Z-11, W-11, Z-12, W-12) */
export function formatStudyTierMeter(used: number, limit: number): string {
  return `Đã xem ${used}/${limit} câu ôn miễn phí tháng này.`;
}

/** Compact Free Tier label for catalog cards (Z-10, W-10) */
export function formatFreeTierCatalogLabel(used: number, limit: number): string {
  return `${used}/${limit} câu miễn phí`;
}

/** Active subscription pill text */
export function formatSubscriptionActivePill(expiresAt: string): string {
  const date = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(expiresAt));
  return `Đang hoạt động đến ${date}`;
}

export type SubjectSubscriptionStatus = "active" | "expiring" | "expired";

export interface SubjectSubscriptionView {
  status: SubjectSubscriptionStatus;
  expiresAt?: string;
}

/** Resolve catalog card status label: subscription pill or Free Tier meter */
export function resolveSubjectCardStatusLabel(input: {
  subscription?: SubjectSubscriptionView | null;
  freeTierUsed?: number;
  freeTierLimit?: number;
}): { kind: "subscription" | "free-tier"; label: string } {
  const { subscription, freeTierUsed = 0, freeTierLimit = 20 } = input;

  if (subscription?.status === "active" || subscription?.status === "expiring") {
    return {
      kind: "subscription",
      label: subscription.expiresAt
        ? subscription.status === "expiring"
          ? `Sắp hết hạn — gia hạn trước ${new Intl.DateTimeFormat("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              day: "2-digit",
              month: "2-digit",
            }).format(new Date(subscription.expiresAt))}`
          : formatSubscriptionActivePill(subscription.expiresAt)
        : "Đang hoạt động",
    };
  }

  if (subscription?.status === "expired") {
    return { kind: "subscription", label: "Hết hạn — gia hạn để tiếp tục" };
  }

  return {
    kind: "free-tier",
    label: formatFreeTierCatalogLabel(freeTierUsed, freeTierLimit),
  };
}
