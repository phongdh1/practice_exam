import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AdminAuthPayload } from "../admin-auth.service";

export const AdminUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AdminAuthPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: AdminAuthPayload }>();
    return request.user;
  },
);
