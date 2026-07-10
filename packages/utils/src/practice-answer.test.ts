import { describe, expect, it } from "vitest";
import { isPracticeAnswerCorrect } from "./practice-answer";

describe("isPracticeAnswerCorrect", () => {
  it("matches single choice", () => {
    expect(isPracticeAnswerCorrect(["A"], ["A"])).toBe(true);
    expect(isPracticeAnswerCorrect(["B"], ["A"])).toBe(false);
  });

  it("matches multiple choice regardless of order", () => {
    expect(isPracticeAnswerCorrect(["B", "A"], ["A", "B"])).toBe(true);
    expect(isPracticeAnswerCorrect(["A"], ["A", "B"])).toBe(false);
  });
});
