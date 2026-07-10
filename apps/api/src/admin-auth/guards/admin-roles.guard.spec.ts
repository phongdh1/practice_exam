import { ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { ExecutionContext } from "@nestjs/common";
import { AdminRolesGuard } from "./admin-roles.guard";
import { ROLES_KEY } from "../decorators/roles.decorator";

function mockContext(role?: string): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  } as ExecutionContext;
}

describe("AdminRolesGuard", () => {
  const reflector = new Reflector();
  const guard = new AdminRolesGuard(reflector);

  it("allows when no roles are required", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);
    expect(guard.canActivate(mockContext("finance"))).toBe(true);
  });

  it("allows when admin role is in required list", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["finance", "super_admin"]);
    expect(guard.canActivate(mockContext("finance"))).toBe(true);
  });

  it("denies finance on editorial approve roles", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["super_admin", "reviewer"]);
    expect(() => guard.canActivate(mockContext("finance"))).toThrow(ForbiddenException);
  });

  it("denies editor on payment integration roles", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["super_admin"]);
    expect(() => guard.canActivate(mockContext("editor"))).toThrow(ForbiddenException);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    void ROLES_KEY;
  });
});
