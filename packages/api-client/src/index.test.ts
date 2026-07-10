import { describe, expect, it } from "vitest";
import { createApiClient, queryKeys } from "./index";

describe("ApiClient", () => {
  it("exposes health query key", () => {
    expect(queryKeys.health).toEqual(["health"]);
  });

  it("exposes subjects query keys", () => {
    expect(queryKeys.subjects.all).toEqual(["subjects"]);
    expect(queryKeys.subjects.detail("abc")).toEqual(["subjects", "abc"]);
  });

  it("exposes entitlements and settings query keys", () => {
    expect(queryKeys.entitlements.freeTier).toEqual(["entitlements", "free-tier"]);
    expect(queryKeys.settings.disclaimer).toEqual(["settings", "disclaimer"]);
  });

  it("exposes study query keys", () => {
    expect(queryKeys.study.tier("sub-1")).toEqual(["study", "tier", "sub-1"]);
    expect(queryKeys.study.questions("sub-1", { page: 1 })).toEqual([
      "study",
      "questions",
      "sub-1",
      { page: 1 },
    ]);
    expect(queryKeys.study.questionDetail("sub-1", "q-1")).toEqual([
      "study",
      "question",
      "sub-1",
      "q-1",
    ]);
  });
});
