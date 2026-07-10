import { describe, expect, it } from "vitest";
import {
  formatFreeTierCatalogLabel,
  formatFreeTierMeter,
  formatMonthlyPriceVnd,
  formatStudyTierMeter,
  formatSubscriptionActivePill,
  resolveSubjectCardStatusLabel,
  resolveSubjectDisplayName,
} from "./subject-display";

describe("subject display formatters", () => {
  it("formats monthly price with /tháng suffix", () => {
    expect(formatMonthlyPriceVnd(100_000)).toMatch(/100\.?000.*\/tháng/);
  });

  it("formats free tier meter for detail view", () => {
    expect(formatFreeTierMeter(5, 20)).toBe("Đã dùng 5/20 câu luyện tập miễn phí tháng này.");
  });

  it("formats study tier meter for detail view", () => {
    expect(formatStudyTierMeter(2, 5)).toBe("Đã xem 2/5 câu ôn miễn phí tháng này.");
  });

  it("formats compact free tier label for catalog", () => {
    expect(formatFreeTierCatalogLabel(0, 20)).toBe("0/20 câu miễn phí");
  });

  it("formats active subscription pill", () => {
    expect(formatSubscriptionActivePill("2026-07-29T00:00:00.000Z")).toMatch(
      /Đang hoạt động đến 29\/07\/2026/,
    );
  });

  it("prefers subscription pill when active", () => {
    const result = resolveSubjectCardStatusLabel({
      subscription: { status: "active", expiresAt: "2026-07-29T00:00:00.000Z" },
      freeTierUsed: 5,
      freeTierLimit: 20,
    });
    expect(result.kind).toBe("subscription");
    expect(result.label).toMatch(/Đang hoạt động đến/);
  });

  it("falls back to free tier meter when not subscribed", () => {
    const result = resolveSubjectCardStatusLabel({
      freeTierUsed: 3,
      freeTierLimit: 20,
    });
    expect(result.kind).toBe("free-tier");
    expect(result.label).toBe("3/20 câu miễn phí");
  });

  it("shows expiring label within 3 days", () => {
    const expiresAt = new Date(Date.now() + 2 * 86_400_000).toISOString();
    const result = resolveSubjectCardStatusLabel({
      subscription: { status: "expiring", expiresAt },
    });
    expect(result.kind).toBe("subscription");
    expect(result.label).toContain("Sắp hết hạn");
  });

  it("falls back to readable label for unknown subject UUIDs", () => {
    const map = new Map([["sub-1", "Pháp luật chứng khoán"]]);
    expect(resolveSubjectDisplayName("sub-1", map)).toBe("Pháp luật chứng khoán");
    expect(resolveSubjectDisplayName("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", map)).toBe(
      "Môn học khác",
    );
  });
});
