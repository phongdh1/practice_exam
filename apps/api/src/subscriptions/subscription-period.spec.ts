import { addOneMonth, daysUntilExpiry } from "./subscription-period";

describe("subscription-period", () => {
  it("adds one calendar month", () => {
    const start = new Date("2026-01-15T00:00:00.000Z");
    const end = addOneMonth(start);
    expect(end.getMonth()).toBe(1);
    expect(end.getDate()).toBe(15);
  });

  it("computes days until expiry", () => {
    const now = new Date("2026-06-01T00:00:00.000Z");
    const periodEnd = new Date("2026-06-04T00:00:00.000Z");
    expect(daysUntilExpiry(periodEnd, now)).toBe(3);
  });
});
