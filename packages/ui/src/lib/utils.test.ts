import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn / tailwind-merge", () => {
  it("keeps typography and semantic color utilities together", () => {
    expect(cn("text-label", "text-on-primary")).toBe("text-label text-on-primary");
    expect(cn("text-label", "text-on-primary/60")).toBe("text-label text-on-primary/60");
  });

  it("still merges conflicting semantic colors", () => {
    expect(cn("text-on-primary/80", "text-on-primary")).toBe("text-on-primary");
  });
});
