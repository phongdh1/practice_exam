import { Reflector } from "@nestjs/core";
import type { AdminRole } from "@prisma/client";
import { ROLES_KEY } from "../admin-auth/decorators/roles.decorator";
import { SubjectsAdminController } from "./subjects-admin.controller";

const LIST_ROLES: AdminRole[] = ["super_admin", "editor", "reviewer"];
const MUTATE_ROLES: AdminRole[] = ["super_admin"];

const SUPER_ADMIN_ONLY_METHODS = [
  "create",
  "reorder",
  "update",
  "archive",
  "activate",
  "updateBlueprint",
  "goLiveStatus",
  "delete",
] as const;

describe("SubjectsAdminController roles", () => {
  const reflector = new Reflector();
  const proto = SubjectsAdminController.prototype;

  it("has no class-level Roles metadata", () => {
    expect(reflector.get(ROLES_KEY, SubjectsAdminController)).toBeUndefined();
  });

  it("allows super_admin, editor, and reviewer on list", () => {
    expect(reflector.get(ROLES_KEY, proto.list)).toEqual(LIST_ROLES);
  });

  it.each(SUPER_ADMIN_ONLY_METHODS)("restricts %s to super_admin", (method) => {
    expect(reflector.get(ROLES_KEY, proto[method])).toEqual(MUTATE_ROLES);
  });
});
