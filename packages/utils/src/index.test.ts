import { describe, expect, it } from "vitest";
import { formatVnd } from "./index";

describe("formatVnd", () => {
  it("formats integer VND", () => {
    expect(formatVnd(150000)).toMatch(/150\.?000/);
  });
});
