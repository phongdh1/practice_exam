import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { toOptionalInputJsonValue } from "../prisma/input-json";
import { AUTH_ERRORS_VI } from "../auth/constants/auth-errors.vi";

export interface AdminAuthPayload {
  sub: string;
  username: string;
  role: string;
  aud: "admin";
}

export interface AdminAuthResult {
  admin: {
    id: string;
    username: string;
    displayName: string | null;
    role: string;
  };
  tokens: {
    accessToken: string;
  };
}

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string): Promise<AdminAuthResult> {
    const normalizedUsername = username.trim().toLowerCase();
    const admin = await this.prisma.adminUser.findUnique({
      where: { username: normalizedUsername },
    });

    if (!admin || admin.isDisabled) {
      await this.logLoginAudit(
        admin?.isDisabled ? admin.id : null,
        normalizedUsername,
        "admin_login_failed",
        {
          reason: admin?.isDisabled ? "disabled" : "not_found",
        },
      );
      throw new UnauthorizedException({
        code: "INVALID_CREDENTIALS",
        message: AUTH_ERRORS_VI.INVALID_CREDENTIALS,
      });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      await this.logLoginAudit(admin.id, normalizedUsername, "admin_login_failed", {
        reason: "invalid_password",
      });
      throw new UnauthorizedException({
        code: "INVALID_CREDENTIALS",
        message: AUTH_ERRORS_VI.INVALID_CREDENTIALS,
      });
    }

    await this.logLoginAudit(admin.id, normalizedUsername, "admin_login_success");

    const payload: AdminAuthPayload = {
      sub: admin.id,
      username: admin.username,
      role: admin.role,
      aud: "admin",
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret",
      expiresIn: "8h",
    });

    return {
      admin: {
        id: admin.id,
        username: admin.username,
        displayName: admin.displayName,
        role: admin.role,
      },
      tokens: { accessToken },
    };
  }

  private async logLoginAudit(
    adminId: string | null,
    username: string,
    action: "admin_login_success" | "admin_login_failed",
    details?: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.adminAuthAuditLog.create({
      data: { adminId, username, action, details: toOptionalInputJsonValue(details) },
    });
  }
}
