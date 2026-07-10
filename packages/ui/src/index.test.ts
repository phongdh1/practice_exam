import { describe, expect, it } from "vitest";
import {
  brandColors,
  Button,
  Checkbox,
  Form,
  FormField,
  getDisclaimerAckKey,
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./index";
import { resolveSubjectCardStatusLabel } from "@practice-exam/utils";

describe("@practice-exam/ui brand tokens", () => {
  it("exports primary and success colors from DESIGN.md", () => {
    expect(brandColors.primary).toBe("#1B4F72");
    expect(brandColors.success).toBe("#0E7C4A");
  });
});

describe("subject catalog UI helpers", () => {
  it("resolves free tier label for catalog cards", () => {
    const status = resolveSubjectCardStatusLabel({ freeTierUsed: 0, freeTierLimit: 20 });
    expect(status.label).toBe("0/20 câu miễn phí");
  });
});

describe("disclaimer acknowledgment helpers", () => {
  it("builds versioned disclaimer ack keys", () => {
    expect(getDisclaimerAckKey("v1")).toBe("disclaimer_ack_v1");
  });
});

describe("shadcn primitive exports", () => {
  it("exports key ui primitives from the package barrel", () => {
    expect(Button).toBeDefined();
    expect(Sheet).toBeDefined();
    expect(SheetContent).toBeDefined();
    expect(SheetTrigger).toBeDefined();
    expect(Checkbox).toBeDefined();
    expect(Form).toBeDefined();
    expect(FormField).toBeDefined();
  });
});
