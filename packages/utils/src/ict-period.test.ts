import { describe, expect, it } from "vitest";
import { getIctPeriodKey } from "./ict-period";

describe("getIctPeriodKey", () => {
  it("returns YYYY-MM for a known ICT instant", () => {
    // 2026-05-31 18:00 UTC = 2026-06-01 01:00 ICT
    expect(getIctPeriodKey(new Date("2026-05-31T18:00:00.000Z"))).toBe("2026-06");
  });

  it("uses ICT month before UTC month rolls over", () => {
    // 2026-06-30 17:00 UTC = 2026-07-01 00:00 ICT
    expect(getIctPeriodKey(new Date("2026-06-30T17:00:00.000Z"))).toBe("2026-07");
  });
});
