import { describe, expect, it } from "vitest";
import {
  resolveHasSubscription,
  resolveSubjectDetailMeterVisibility,
} from "./subject-detail-display";

describe("subject detail display", () => {
  it("detects active subscription from subscription pill", () => {
    expect(
      resolveHasSubscription({
        subscription: { status: "active", expiresAt: "2026-12-01" },
      }),
    ).toBe(true);
  });

  it("shows both meters for freemium users with study tier data", () => {
    expect(
      resolveSubjectDetailMeterVisibility({
        hasSubscription: false,
        studyTierStatus: {
          subjectId: "sub-1",
          used: 2,
          limit: 5,
          remaining: 3,
          periodKey: "2026-07",
          isAtLimit: false,
          hasActiveSubscription: false,
        },
      }),
    ).toEqual({ showFreeTierSection: true, showStudyMeter: true });
  });

  it("hides study meter when subscribed", () => {
    expect(
      resolveSubjectDetailMeterVisibility({
        hasSubscription: true,
        studyTierStatus: {
          subjectId: "sub-1",
          used: 0,
          limit: 5,
          remaining: 5,
          periodKey: "2026-07",
          isAtLimit: false,
          hasActiveSubscription: true,
        },
      }),
    ).toEqual({ showFreeTierSection: false, showStudyMeter: false });
  });
});
