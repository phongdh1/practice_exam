import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUserPayload {
  sub: string;
  email?: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async issueTokenPair(userId: string, email?: string): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email } satisfies AuthUserPayload,
      {
        secret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret",
        expiresIn: "15m",
      },
    );

    const refreshToken = randomBytes(48).toString("hex");
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
      include: { user: { include: { identities: true } } },
    });

    if (!stored || stored.user.isSuspended) {
      return Promise.reject(new Error("INVALID_REFRESH"));
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    const emailIdentity = stored.user.identities.find((i) => i.provider === "email");
    return this.issueTokenPair(stored.userId, emailIdentity?.externalId);
  }

  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
