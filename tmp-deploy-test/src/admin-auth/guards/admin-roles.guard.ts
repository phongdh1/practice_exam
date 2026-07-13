import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { AdminRole } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { AdminRequestUser } from "./admin-jwt.guard";

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;

    const request = context.switchToHttp().getRequest<{ user: AdminRequestUser }>();
    const admin = request.user;
    if (!admin?.role || !requiredRoles.includes(admin.role as AdminRole)) {
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: "Bạn không có quyền thực hiện thao tác này.",
      });
    }
    return true;
  }
}
