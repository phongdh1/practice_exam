import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AuthUserPayload } from "../token.service";

export const AuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUserPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUserPayload }>();
    return request.user;
  },
);
