import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AUTH_ERRORS_VI } from "../../auth/constants/auth-errors.vi";
import type { AdminAuthPayload } from "../admin-auth.service";

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, "admin-jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret",
    });
  }

  validate(payload: AdminAuthPayload): AdminAuthPayload {
    if (!payload.sub || payload.aud !== "admin") {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: AUTH_ERRORS_VI.UNAUTHORIZED,
      });
    }
    return payload;
  }
}
