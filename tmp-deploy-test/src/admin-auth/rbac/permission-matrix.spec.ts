import type { AdminRole } from "@prisma/client";
import {
  ADMIN_PERMISSION_MATRIX,
  roleHasCapability,
} from "./permission-matrix";

describe("ADMIN_PERMISSION_MATRIX", () => {
  it("matches PRD addendum boundaries for editor vs finance vs payment config", () => {
    expect(roleHasCapability("editor", "question_crud_draft")).toBe(true);
    expect(roleHasCapability("editor", "zalo_payment_config")).toBe(false);
    expect(roleHasCapability("finance", "payment_log_reconciliation")).toBe(true);
    expect(roleHasCapability("finance", "editorial_approve_reject")).toBe(false);
    expect(roleHasCapability("reviewer", "editorial_approve_reject")).toBe(true);
    expect(roleHasCapability("reviewer", "question_crud_draft")).toBe(false);
  });

  it("includes every admin role on each row", () => {
    const roles: AdminRole[] = ["super_admin", "editor", "reviewer", "support", "finance"];
    for (const matrixRow of ADMIN_PERMISSION_MATRIX) {
      for (const role of roles) {
        expect(typeof matrixRow.roles[role]).toBe("boolean");
      }
    }
  });

  it("grants super_admin every capability", () => {
    for (const matrixRow of ADMIN_PERMISSION_MATRIX) {
      expect(matrixRow.roles.super_admin).toBe(true);
    }
  });
});
