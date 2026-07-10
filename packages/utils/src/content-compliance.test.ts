import { describe, expect, it } from "vitest";
import { scanProhibitedClaims } from "./content-compliance";

describe("scanProhibitedClaims", () => {
  it("allows compliant marketing copy", () => {
    const result = scanProhibitedClaims("Luyện thi CNVCK với ngân hàng câu hỏi phong phú.");
    expect(result.ok).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("flags guaranteed pass claims", () => {
    const result = scanProhibitedClaims("Khóa học guaranteed pass 100%");
    expect(result.ok).toBe(false);
    expect(result.violations[0]?.phrase).toBe("guaranteed pass");
  });

  it("flags official exam question claims in Vietnamese", () => {
    const result = scanProhibitedClaims("Bộ đề thi chính thức từ UBCKNN");
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.phrase === "đề thi chính thức")).toBe(true);
  });

  it("reports every occurrence of a prohibited phrase", () => {
    const result = scanProhibitedClaims("guaranteed pass và guaranteed pass lần nữa");
    expect(result.ok).toBe(false);
    expect(result.violations.filter((v) => v.phrase === "guaranteed pass")).toHaveLength(2);
  });
});
