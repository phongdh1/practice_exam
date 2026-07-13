import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AUTH_ERRORS_VI } from "../../auth/constants/auth-errors.vi";
import type { AdminAuthPayload } from "../admin-auth.service";

@Injectable()
export class AdminJwtGuard extends AuthGuard("admin-jwt") {
  handleRequest<T>(err: Error | null, user: T): T {
    if (err || !user) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: AUTH_ERRORS_VI.UNAUTHORIZED,
      });
    }
    return user;
  }
}

export type AdminRequestUser = AdminAuthPayload;
