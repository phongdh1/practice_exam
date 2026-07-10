import { describe, expect, it, vi } from "vitest";
import { handleServerTimerSyncExpiry, isSectionTimerExpired } from "./mock-exam-timer-sync";

describe("mock exam timer sync helpers", () => {
  it("detects expired section timer from server payload", () => {
    expect(isSectionTimerExpired(0)).toBe(true);
    expect(isSectionTimerExpired(-1)).toBe(true);
    expect(isSectionTimerExpired(1000)).toBe(false);
    expect(isSectionTimerExpired(null)).toBe(false);
    expect(isSectionTimerExpired(undefined)).toBe(false);
  });

  it("invokes onExpire once when sync reports expiry", () => {
    const onExpire = vi.fn();
    expect(handleServerTimerSyncExpiry(0, false, onExpire)).toBe(true);
    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(handleServerTimerSyncExpiry(0, true, onExpire)).toBe(false);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("does not invoke onExpire for active timers", () => {
    const onExpire = vi.fn();
    expect(handleServerTimerSyncExpiry(30_000, false, onExpire)).toBe(false);
    expect(onExpire).not.toHaveBeenCalled();
  });
});
