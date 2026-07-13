import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthProvider } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AUTH_ERRORS_VI } from "./constants/auth-errors.vi";
import { TokenService, TokenPair } from "./token.service";
import { UserMergeService, MergeSummary } from "./user-merge.service";
import { ZaloOAuthService } from "./zalo-oauth.service";
import { ZaloOAuthEventsService } from "../integrations/zalo-oauth-events.service";

export interface AuthUserView {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  email?: string;
  identities: { provider: AuthProvider; externalId: string }[];
}

export interface AuthMeView {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  identities: { provider: AuthProvider; linkedAt: string }[];
}

export interface AuthResult {
  user: AuthUserView;
  tokens: TokenPair;
  mergeSummary?: MergeSummary;
}

export interface OAuthProfile {
  provider: AuthProvider;
  externalId: string;
  displayName?: string;
  avatarUrl?: string;
}

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly zaloOAuth: ZaloOAuthService,
    private readonly userMerge: UserMergeService,
    private readonly zaloOAuthEvents: ZaloOAuthEventsService,
  ) {}

  async registerWithEmail(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();
    this.assertValidEmail(normalizedEmail);
    this.assertValidPassword(password);

    const existing = await this.prisma.authIdentity.findUnique({
      where: {
        provider_externalId: { provider: "email", externalId: normalizedEmail },
      },
    });
    if (existing) {
      throw new ConflictException({
        code: "EMAIL_ALREADY_REGISTERED",
        message: AUTH_ERRORS_VI.EMAIL_ALREADY_REGISTERED,
      });
    }

    const passwordHash = await bcrypt.hash(password, this.saltRounds);

    const user = await this.prisma.user.create({
      data: {
        displayName: displayName ?? normalizedEmail.split("@")[0],
        identities: {
          create: {
            provider: "email",
            externalId: normalizedEmail,
            passwordHash,
          },
        },
      },
      include: { identities: true },
    });

    await this.userMerge.logAudit(user.id, "register", { provider: "email" });

    const tokens = await this.tokenService.issueTokenPair(user.id, normalizedEmail);
    return { user: this.toUserView(user), tokens };
  }

  async loginWithEmail(email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const identity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_externalId: { provider: "email", externalId: normalizedEmail },
      },
      include: { user: { include: { identities: true } } },
    });

    if (!identity?.passwordHash) {
      throw new UnauthorizedException({
        code: "INVALID_CREDENTIALS",
        message: AUTH_ERRORS_VI.INVALID_CREDENTIALS,
      });
    }

    if (identity.user.isSuspended) {
      throw new UnauthorizedException({
        code: "ACCOUNT_SUSPENDED",
        message: AUTH_ERRORS_VI.ACCOUNT_SUSPENDED,
      });
    }

    const valid = await bcrypt.compare(password, identity.passwordHash);
    if (!valid) {
      throw new UnauthorizedException({
        code: "INVALID_CREDENTIALS",
        message: AUTH_ERRORS_VI.INVALID_CREDENTIALS,
      });
    }

    const tokens = await this.tokenService.issueTokenPair(identity.userId, normalizedEmail);
    return { user: this.toUserView(identity.user), tokens };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResult> {
    try {
      const tokens = await this.tokenService.refreshAccessToken(refreshToken);
      const payload = await this.decodeAccessToken(tokens.accessToken);
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: payload.sub },
        include: { identities: true },
      });
      return { user: this.toUserView(user), tokens };
    } catch {
      throw new UnauthorizedException({
        code: "INVALID_REFRESH_TOKEN",
        message: AUTH_ERRORS_VI.INVALID_REFRESH_TOKEN,
      });
    }
  }

  async signInWithOAuth(profile: OAuthProfile): Promise<AuthResult> {
    const identity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_externalId: {
          provider: profile.provider,
          externalId: profile.externalId,
        },
      },
      include: { user: { include: { identities: true } } },
    });

    if (identity) {
      if (identity.user.isSuspended) {
        throw new UnauthorizedException({
          code: "ACCOUNT_SUSPENDED",
          message: AUTH_ERRORS_VI.ACCOUNT_SUSPENDED,
        });
      }
      const tokens = await this.tokenService.issueTokenPair(identity.userId);
      return { user: this.toUserView(identity.user), tokens };
    }

    const user = await this.prisma.user.create({
      data: {
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        identities: {
          create: {
            provider: profile.provider,
            externalId: profile.externalId,
          },
        },
      },
      include: { identities: true },
    });

    await this.userMerge.logAudit(user.id, "oauth_sign_in", {
      provider: profile.provider,
    });

    const tokens = await this.tokenService.issueTokenPair(user.id);
    return { user: this.toUserView(user), tokens };
  }

  async signInWithZalo(accessToken: string): Promise<AuthResult> {
    try {
      const profile = await this.zaloOAuth.verifyAccessToken(accessToken);
      await this.zaloOAuthEvents.logEvent({
        externalId: profile.id,
        status: "processed",
        payload: { action: "sign_in", provider: "zalo" },
      });
      return this.signInWithOAuth({
        provider: "zalo",
        externalId: profile.id,
        displayName: profile.name,
        avatarUrl: profile.picture,
      });
    } catch (error) {
      await this.zaloOAuthEvents.logEvent({
        status: "failed",
        payload: { action: "sign_in", provider: "zalo" },
        errorMessage: error instanceof Error ? error.message : "ZALO_AUTH_FAILED",
      });
      throw new UnauthorizedException({
        code: "ZALO_AUTH_FAILED",
        message: AUTH_ERRORS_VI.ZALO_AUTH_FAILED,
      });
    }
  }

  async linkProvider(
    currentUserId: string,
    profile: OAuthProfile,
  ): Promise<AuthResult> {
    const currentUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: currentUserId },
      include: { identities: true },
    });

    if (currentUser.identities.some((i) => i.provider === profile.provider)) {
      throw new ConflictException({
        code: "PROVIDER_ALREADY_LINKED",
        message: AUTH_ERRORS_VI.PROVIDER_ALREADY_LINKED,
      });
    }

    const existingIdentity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_externalId: {
          provider: profile.provider,
          externalId: profile.externalId,
        },
      },
      include: { user: true },
    });

    let mergeSummary: MergeSummary | undefined;

    if (existingIdentity && existingIdentity.userId !== currentUserId) {
      mergeSummary = await this.prisma.$transaction(async (tx) => {
        const summary = await this.userMerge.mergeUsers(
          currentUserId,
          existingIdentity.userId,
          tx,
        );
        await this.userMerge.logAudit(
          currentUserId,
          "link_merge",
          {
            provider: profile.provider,
            mergedFrom: existingIdentity.userId,
            ...summary,
          },
          tx,
        );
        return summary;
      });
    } else if (!existingIdentity) {
      await this.prisma.authIdentity.create({
        data: {
          userId: currentUserId,
          provider: profile.provider,
          externalId: profile.externalId,
        },
      });
      await this.userMerge.logAudit(currentUserId, "link", {
        provider: profile.provider,
        externalId: profile.externalId,
      });
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: currentUserId },
      include: { identities: true },
    });

    const emailIdentity = user.identities.find((i) => i.provider === "email");
    const tokens = await this.tokenService.issueTokenPair(
      user.id,
      emailIdentity?.externalId,
    );

    return { user: this.toUserView(user), tokens, mergeSummary };
  }

  async linkZalo(currentUserId: string, accessToken: string): Promise<AuthResult> {
    try {
      const profile = await this.zaloOAuth.verifyAccessToken(accessToken);
      await this.zaloOAuthEvents.logEvent({
        externalId: profile.id,
        status: "processed",
        payload: { action: "link", provider: "zalo", userId: currentUserId },
      });
      return this.linkProvider(currentUserId, {
        provider: "zalo",
        externalId: profile.id,
        displayName: profile.name,
        avatarUrl: profile.picture,
      });
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      await this.zaloOAuthEvents.logEvent({
        status: "failed",
        payload: { action: "link", provider: "zalo", userId: currentUserId },
        errorMessage: err instanceof Error ? err.message : "ZALO_AUTH_FAILED",
      });
      throw new UnauthorizedException({
        code: "ZALO_AUTH_FAILED",
        message: AUTH_ERRORS_VI.ZALO_AUTH_FAILED,
      });
    }
  }

  async getUserById(userId: string): Promise<AuthUserView> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { identities: true },
    });
    return this.toUserView(user);
  }

  async getMe(userId: string): Promise<AuthMeView> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { identities: true },
    });
    if (user.isSuspended) {
      throw new UnauthorizedException({
        code: "ACCOUNT_SUSPENDED",
        message: AUTH_ERRORS_VI.ACCOUNT_SUSPENDED,
      });
    }
    return {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      identities: user.identities.map((identity) => ({
        provider: identity.provider,
        linkedAt: identity.createdAt.toISOString(),
      })),
    };
  }

  private toUserView(user: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    identities: { provider: AuthProvider; externalId: string }[];
  }): AuthUserView {
    const emailIdentity = user.identities.find((i) => i.provider === "email");
    return {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      email: emailIdentity?.externalId,
      identities: user.identities.map((i) => ({
        provider: i.provider,
        externalId: i.externalId,
      })),
    };
  }

  private assertValidEmail(email: string): void {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException({
        code: "INVALID_EMAIL",
        message: AUTH_ERRORS_VI.INVALID_EMAIL,
      });
    }
  }

  private assertValidPassword(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException({
        code: "WEAK_PASSWORD",
        message: AUTH_ERRORS_VI.WEAK_PASSWORD,
      });
    }
  }

  private async decodeAccessToken(token: string): Promise<{ sub: string }> {
    const { JwtService } = await import("@nestjs/jwt");
    const jwt = new JwtService();
    return jwt.verifyAsync(token, {
      secret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret",
    });
  }
}
