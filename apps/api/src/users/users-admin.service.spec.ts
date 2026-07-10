import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { UserMergeService } from "../auth/user-merge.service";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { UsersAdminService } from "./users-admin.service";

describe("UsersAdminService", () => {
  let service: UsersAdminService;

  const mockUser = {
    id: "user-1",
    displayName: "Test User",
    avatarUrl: null,
    isSuspended: false,
    createdAt: new Date("2026-01-01"),
    identities: [
      { provider: "email", externalId: "test@example.com", createdAt: new Date("2026-01-01") },
    ],
    subscriptions: [],
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    authIdentity: {
      findMany: jest.fn(),
    },
    practiceSession: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    mockExamAttempt: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    subscription: {
      findMany: jest.fn(),
    },
    authAuditLog: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((ops: unknown) => Promise.all(ops as Promise<unknown>[])),
  };

  const mockSubscriptions = {
    listForUser: jest.fn(),
    manualGrant: jest.fn(),
    manualRevoke: jest.fn(),
  };

  const mockMerge = {
    mergeUsers: jest.fn(),
    logAudit: jest.fn(),
  };

  const admin = { sub: "admin-1", username: "support", role: "support", aud: "admin" as const };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersAdminService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SubscriptionsService, useValue: mockSubscriptions },
        { provide: UserMergeService, useValue: mockMerge },
      ],
    }).compile();
    service = module.get(UsersAdminService);
  });

  it("searches users by identity external id", async () => {
    mockPrisma.authIdentity.findMany.mockResolvedValue([
      { userId: "user-1", user: { ...mockUser, identities: mockUser.identities } },
    ]);

    const results = await service.searchUsers("test@example.com", admin);
    expect(results).toHaveLength(1);
    expect(results[0]?.email).toBe("test@example.com");
    expect(mockMerge.logAudit).toHaveBeenCalledWith(
      null,
      "admin.search_users",
      expect.objectContaining({ adminId: "admin-1" }),
    );
  });

  it("loads profile and logs PII access", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockSubscriptions.listForUser.mockResolvedValue([]);
    mockPrisma.practiceSession.findMany.mockResolvedValue([]);
    mockPrisma.mockExamAttempt.findMany.mockResolvedValue([]);
    mockPrisma.authAuditLog.findMany.mockResolvedValue([]);

    const profile = await service.getProfile("user-1", admin);

    expect(profile.id).toBe("user-1");
    expect(mockMerge.logAudit).toHaveBeenCalledWith(
      "user-1",
      "admin.view_user_profile",
      expect.objectContaining({ adminId: "admin-1" }),
    );
  });

  it("grants subscription with audit reason", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    mockSubscriptions.manualGrant.mockResolvedValue({
      id: "sub-1",
      subjectId: "subject-1",
      status: "active",
      periodStart: "2026-07-01",
      periodEnd: "2026-08-01",
      channel: "admin",
      daysUntilExpiry: 30,
    });

    await service.grantSubscription(
      "user-1",
      { subjectId: "subject-1", reason: "billing exception" },
      admin,
    );

    expect(mockSubscriptions.manualGrant).toHaveBeenCalled();
    expect(mockMerge.logAudit).toHaveBeenCalledWith(
      "user-1",
      "admin.subscription.grant",
      expect.objectContaining({ reason: "billing exception" }),
    );
  });

  it("rejects suspend when already suspended", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, isSuspended: true });

    await expect(service.suspendUser("user-1", "abuse", admin)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("throws when user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(service.getProfile("missing", admin)).rejects.toBeInstanceOf(NotFoundException);
  });
});
