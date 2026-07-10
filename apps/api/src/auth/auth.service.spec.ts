import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { TokenService } from "./token.service";
import { ZaloOAuthService } from "./zalo-oauth.service";
import { UserMergeService } from "./user-merge.service";
import { ZaloOAuthEventsService } from "../integrations/zalo-oauth-events.service";

describe("AuthService", () => {
  let service: AuthService;

  const mockPrisma = {
    authIdentity: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((fn: (tx: unknown) => unknown) => fn(mockPrisma)),
  };

  const mockTokenService = {
    issueTokenPair: jest.fn().mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    }),
    refreshAccessToken: jest.fn(),
  };

  const mockZaloOAuth = {
    verifyAccessToken: jest.fn(),
  };

  const mockUserMerge = {
    logAudit: jest.fn(),
    mergeUsers: jest.fn(),
  };

  const mockZaloOAuthEvents = {
    logEvent: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TokenService, useValue: mockTokenService },
        { provide: ZaloOAuthService, useValue: mockZaloOAuth },
        { provide: UserMergeService, useValue: mockUserMerge },
        { provide: ZaloOAuthEventsService, useValue: mockZaloOAuthEvents },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe("registerWithEmail", () => {
    it("creates User and AuthIdentity(email) for new email", async () => {
      mockPrisma.authIdentity.findUnique.mockResolvedValue(null);
      const passwordHash = await bcrypt.hash("password123", 10);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-1",
        displayName: "test",
        avatarUrl: null,
        identities: [{ provider: "email", externalId: "test@example.com" }],
      });

      const result = await service.registerWithEmail("test@example.com", "password123");

      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result.user.id).toBe("user-1");
      expect(result.tokens.accessToken).toBe("access-token");
      expect(mockUserMerge.logAudit).toHaveBeenCalledWith("user-1", "register", {
        provider: "email",
      });
      void passwordHash;
    });

    it("rejects duplicate email with Vietnamese message", async () => {
      mockPrisma.authIdentity.findUnique.mockResolvedValue({ id: "existing" });

      await expect(
        service.registerWithEmail("test@example.com", "password123"),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("loginWithEmail", () => {
    it("returns tokens for valid credentials", async () => {
      const hash = await bcrypt.hash("password123", 10);
      mockPrisma.authIdentity.findUnique.mockResolvedValue({
        userId: "user-1",
        passwordHash: hash,
        user: {
          id: "user-1",
          isSuspended: false,
          displayName: "Test",
          avatarUrl: null,
          identities: [{ provider: "email", externalId: "test@example.com" }],
        },
      });

      const result = await service.loginWithEmail("test@example.com", "password123");
      expect(result.tokens.accessToken).toBe("access-token");
    });

    it("rejects invalid credentials without issuing tokens", async () => {
      mockPrisma.authIdentity.findUnique.mockResolvedValue(null);

      await expect(
        service.loginWithEmail("test@example.com", "wrong"),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockTokenService.issueTokenPair).not.toHaveBeenCalled();
    });
  });

  describe("signInWithZalo", () => {
    it("creates user for new Zalo identity", async () => {
      mockZaloOAuth.verifyAccessToken.mockResolvedValue({
        id: "zalo-123",
        name: "Zalo User",
      });
      mockPrisma.authIdentity.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-zalo",
        displayName: "Zalo User",
        avatarUrl: null,
        identities: [{ provider: "zalo", externalId: "zalo-123" }],
      });

      const result = await service.signInWithZalo("test-zalo-token");
      expect(result.user.id).toBe("user-zalo");
    });

    it("throws Vietnamese error on Zalo failure", async () => {
      mockZaloOAuth.verifyAccessToken.mockRejectedValue(new Error("fail"));

      await expect(service.signInWithZalo("bad-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
