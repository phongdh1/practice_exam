export const STUDY_PAYWALL_TITLE = "Hết lượt xem đáp án!";

export const STUDY_PAYWALL_BENEFITS = [
  "Xem đáp án và giải thích cho tất cả câu hỏi",
  "Luyện tập không giới hạn",
  "Thi thử mô phỏng",
] as const;

export function formatStudyPaywallDescription(limit: number, subjectName: string): string {
  return `Bạn đã xem hết ${limit} câu ôn miễn phí tháng này cho ${subjectName}.`;
}
