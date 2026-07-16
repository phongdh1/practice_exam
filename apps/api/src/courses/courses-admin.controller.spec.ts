import { Reflector } from "@nestjs/core";
import type { AdminRole } from "@prisma/client";
import { ROLES_KEY } from "../admin-auth/decorators/roles.decorator";
import { CoursesAdminController } from "./courses-admin.controller";

const LIST_ROLES: AdminRole[] = ["super_admin", "editor", "reviewer"];
const MUTATE_ROLES: AdminRole[] = ["super_admin"];

const MUTATE_METHODS = [
  "create",
  "reorder",
  "update",
  "archive",
  "activate",
  "delete",
] as const;

describe("CoursesAdminController roles", () => {
  const reflector = new Reflector();
  const proto = CoursesAdminController.prototype;

  it("has no class-level Roles metadata", () => {
    expect(reflector.get(ROLES_KEY, CoursesAdminController)).toBeUndefined();
  });

  it("allows super_admin, editor, and reviewer on list", () => {
    expect(reflector.get(ROLES_KEY, proto.list)).toEqual(LIST_ROLES);
  });

  it.each(MUTATE_METHODS)("restricts %s to super_admin", (method) => {
    expect(reflector.get(ROLES_KEY, proto[method])).toEqual(MUTATE_ROLES);
  });
});
