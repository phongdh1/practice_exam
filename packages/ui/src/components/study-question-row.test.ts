import { describe, expect, it } from "vitest";
import { isStudyRowLocked } from "./study-question-row";

describe("isStudyRowLocked", () => {
  const atLimitTier = {
    isAtLimit: true,
    hasActiveSubscription: false,
  };

  it("unlocks all rows for subscribed users", () => {
    expect(
      isStudyRowLocked({ viewedThisPeriod: false }, { isAtLimit: true, hasActiveSubscription: true }),
    ).toBe(false);
  });

  it("unlocks rows when under study tier cap", () => {
    expect(
      isStudyRowLocked(
        { viewedThisPeriod: false },
        { isAtLimit: false, hasActiveSubscription: false },
      ),
    ).toBe(false);
  });

  it("locks unviewed rows when at cap", () => {
    expect(isStudyRowLocked({ viewedThisPeriod: false }, atLimitTier)).toBe(true);
  });

  it("keeps viewed rows unlocked when at cap", () => {
    expect(isStudyRowLocked({ viewedThisPeriod: true }, atLimitTier)).toBe(false);
  });
});
