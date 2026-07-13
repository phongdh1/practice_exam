import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { AUTH_ERRORS_VI } from "../constants/auth-errors.vi";
import { AuthUserPayload } from "../token.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret",
    });
  }

  async validate(payload: AuthUserPayload): Promise<AuthUserPayload> {
    if (!payload.sub) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: AUTH_ERRORS_VI.UNAUTHORIZED,
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { isSuspended: true },
    });

    if (user?.isSuspended) {
      throw new UnauthorizedException({
        code: "ACCOUNT_SUSPENDED",
        message: AUTH_ERRORS_VI.ACCOUNT_SUSPENDED,
      });
    }

    return payload;
  }
}
