import { describe, expect, it } from "vitest";
import {
  STUDY_PAYWALL_BENEFITS,
  STUDY_PAYWALL_TITLE,
  formatStudyPaywallDescription,
} from "./study-tier-paywall-copy";

describe("study tier paywall copy", () => {
  it("uses the study-tier cap headline", () => {
    expect(STUDY_PAYWALL_TITLE).toBe("Hết lượt xem đáp án!");
  });

  it("describes study tier limit and subject", () => {
    expect(formatStudyPaywallDescription(5, "Pháp luật CK")).toBe(
      "Bạn đã xem hết 5 câu ôn miễn phí tháng này cho Pháp luật CK.",
    );
  });

  it("lists study subscription benefits", () => {
    expect(STUDY_PAYWALL_BENEFITS).toContain("Xem đáp án và giải thích cho tất cả câu hỏi");
    expect(STUDY_PAYWALL_BENEFITS).toContain("Luyện tập không giới hạn");
  });
});
