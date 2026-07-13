import { Test, TestingModule } from "@nestjs/testing";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { EntitlementsService } from "./entitlements.service";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { getIctPeriodKey } from "@practice-exam/utils";

describe("EntitlementsService", () => {
  let service: EntitlementsService;

  const userId = "user-1";
  const subjectId = "sub-1";
  const questionId = "q-1";
  const periodKey = getIctPeriodKey();

  const mockPrisma = {
    subject: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    freeTierUsage: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
      upsert: jest.fn(),
    },
    studyTierUsage: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      createMany: jest.fn(),
      updateMany: jest.fn(),
    },
    studyViewLog: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    subscription: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockSubscriptionsService = {
    hasActiveSubscription: jest.fn(),
    expireStaleSubscriptions: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => unknown) =>
      fn(mockPrisma),
    );
    mockSubscriptionsService.hasActiveSubscription.mockResolvedValue(false);
    mockSubscriptionsService.expireStaleSubscriptions.mockResolvedValue(0);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntitlementsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SubscriptionsService, useValue: mockSubscriptionsService },
      ],
    }).compile();

    service = module.get(EntitlementsService);
  });

  it("returns free tier usage summary for active subjects", async () => {
    mockPrisma.subject.findMany.mockResolvedValue([
      {
        id: subjectId,
        pricing: { freeTierLimit: 20 },
      },
    ]);
    mockPrisma.freeTierUsage.findMany.mockResolvedValue([
      { subjectId, usedCount: 5 },
    ]);
    mockPrisma.subscription.findMany.mockResolvedValue([]);

    const result = await service.listFreeTierUsage(userId);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      subjectId,
      used: 5,
      limit: 20,
      remaining: 15,
      isAtLimit: false,
      hasActiveSubscription: false,
    });
  });

  it("throws when consuming beyond free tier limit", async () => {
    mockSubscriptionsService.hasActiveSubscription.mockResolvedValue(false);
    mockPrisma.subject.findFirst.mockResolvedValue({
      id: subjectId,
      pricing: { freeTierLimit: 20 },
    });
    mockPrisma.freeTierUsage.createMany.mockResolvedValue({ count: 0 });
    mockPrisma.freeTierUsage.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.freeTierUsage.findUnique.mockResolvedValue({
      id: "usage-1",
      usedCount: 20,
    });

    await expect(service.consumeFreeTierQuestion(userId, subjectId)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("creates first usage row atomically", async () => {
    mockSubscriptionsService.hasActiveSubscription.mockResolvedValue(false);
    mockPrisma.subject.findFirst.mockResolvedValue({
      id: subjectId,
      pricing: { freeTierLimit: 20 },
    });
    mockPrisma.freeTierUsage.createMany.mockResolvedValue({ count: 1 });

    const result = await service.consumeFreeTierQuestion(userId, subjectId);

    expect(result.used).toBe(1);
    expect(mockPrisma.freeTierUsage.updateMany).not.toHaveBeenCalled();
  });

  it("increments usage only when below limit", async () => {
    mockSubscriptionsService.hasActiveSubscription.mockResolvedValue(false);
    mockPrisma.subject.findFirst.mockResolvedValue({
      id: subjectId,
      pricing: { freeTierLimit: 20 },
    });
    mockPrisma.freeTierUsage.createMany.mockResolvedValue({ count: 0 });
    mockPrisma.freeTierUsage.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.freeTierUsage.findUniqueOrThrow.mockResolvedValue({
      usedCount: 6,
    });

    const result = await service.consumeFreeTierQuestion(userId, subjectId);

    expect(mockPrisma.freeTierUsage.updateMany).toHaveBeenCalledWith({
      where: {
        userId,
        subjectId,
        periodKey,
        usedCount: { lt: 20 },
      },
      data: { usedCount: { increment: 1 } },
    });
    expect(result.used).toBe(6);
  });

  it("returns study tier status for a subject", async () => {
    mockPrisma.subject.findFirst.mockResolvedValue({
      id: subjectId,
      pricing: { studyTierLimit: 5 },
    });
    mockPrisma.studyTierUsage.findUnique.mockResolvedValue({ viewedCount: 2 });

    const result = await service.getStudyTierStatus(userId, subjectId);

    expect(result).toMatchObject({
      subjectId,
      used: 2,
      limit: 5,
      remaining: 3,
      isAtLimit: false,
    });
  });

  it("consumes study view without touching free tier usage", async () => {
    mockSubscriptionsService.hasActiveSubscription.mockResolvedValue(false);
    mockPrisma.subject.findFirst.mockResolvedValue({
      id: subjectId,
      pricing: { studyTierLimit: 5 },
    });
    mockPrisma.studyViewLog.findUnique.mockResolvedValue(null);
    mockPrisma.studyViewLog.create.mockResolvedValue({});
    mockPrisma.studyTierUsage.createMany.mockResolvedValue({ count: 1 });
    mockPrisma.studyTierUsage.findUniqueOrThrow.mockResolvedValue({ viewedCount: 1 });

    const result = await service.consumeStudyView(userId, subjectId, questionId);

    expect(result.used).toBe(1);
    expect(mockPrisma.freeTierUsage.createMany).not.toHaveBeenCalled();
    expect(mockPrisma.studyViewLog.create).toHaveBeenCalledWith({
      data: { userId, subjectId, questionId, periodKey },
    });
    expect(mockPrisma.studyTierUsage.createMany).toHaveBeenCalled();
  });

  it("returns idempotent status when view log already exists in transaction", async () => {
    mockSubscriptionsService.hasActiveSubscription.mockResolvedValue(false);
    mockPrisma.subject.findFirst.mockResolvedValue({
      id: subjectId,
      pricing: { studyTierLimit: 5 },
    });
    mockPrisma.studyViewLog.findUnique.mockResolvedValue({ id: "log-1" });
    mockPrisma.studyTierUsage.findUnique.mockResolvedValue({ viewedCount: 2 });

    const result = await service.consumeStudyView(userId, subjectId, questionId);

    expect(result.used).toBe(2);
    expect(mockPrisma.studyTierUsage.createMany).not.toHaveBeenCalled();
    expect(mockPrisma.studyViewLog.create).not.toHaveBeenCalled();
  });

  it("returns idempotent status on concurrent duplicate view log create (P2002)", async () => {
    mockSubscriptionsService.hasActiveSubscription.mockResolvedValue(false);
    mockPrisma.subject.findFirst.mockResolvedValue({
      id: subjectId,
      pricing: { studyTierLimit: 5 },
    });
    mockPrisma.studyViewLog.findUnique.mockResolvedValue(null);
    const p2002 = new Prisma.PrismaClientKnownRequestError("unique violation", {
      code: "P2002",
      clientVersion: "test",
    });
    mockPrisma.studyViewLog.create.mockRejectedValue(p2002);
    mockPrisma.studyTierUsage.findUnique.mockResolvedValue({ viewedCount: 1 });

    const result = await service.consumeStudyView(userId, subjectId, questionId);

    expect(result.used).toBe(1);
    expect(mockPrisma.studyTierUsage.createMany).not.toHaveBeenCalled();
  });

  it("throws STUDY_TIER_EXCEEDED when study cap reached", async () => {
    mockSubscriptionsService.hasActiveSubscription.mockResolvedValue(false);
    mockPrisma.subject.findFirst.mockResolvedValue({
      id: subjectId,
      pricing: { studyTierLimit: 5 },
    });
    mockPrisma.studyViewLog.findUnique.mockResolvedValue(null);
    mockPrisma.studyViewLog.create.mockResolvedValue({});
    mockPrisma.studyTierUsage.createMany.mockResolvedValue({ count: 0 });
    mockPrisma.studyTierUsage.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.studyTierUsage.findUnique.mockResolvedValue({ viewedCount: 5 });

    await expect(service.consumeStudyView(userId, subjectId, questionId)).rejects.toMatchObject({
      response: expect.objectContaining({ code: "STUDY_TIER_EXCEEDED" }),
    });
  });

  it("bypasses study consumption for subscribed users", async () => {
    mockSubscriptionsService.hasActiveSubscription.mockResolvedValue(true);
    mockPrisma.subject.findFirst.mockResolvedValue({
      id: subjectId,
      pricing: { studyTierLimit: 5 },
    });
    mockPrisma.studyTierUsage.findUnique.mockResolvedValue(null);

    const result = await service.consumeStudyView(userId, subjectId, questionId);

    expect(result.hasActiveSubscription).toBe(true);
    expect(result.isAtLimit).toBe(false);
    expect(mockPrisma.studyTierUsage.createMany).not.toHaveBeenCalled();
    expect(mockPrisma.studyViewLog.create).not.toHaveBeenCalled();
  });

  it("denies mock exam access without subscription", async () => {
    mockSubscriptionsService.hasActiveSubscription.mockResolvedValue(false);

    const access = await service.getMockExamAccess(userId, subjectId);

    expect(access).toEqual({ allowed: false, reason: "NO_SUBSCRIPTION" });
  });

  it("allows mock exam access with active subscription", async () => {
    mockSubscriptionsService.hasActiveSubscription.mockResolvedValue(true);

    const access = await service.getMockExamAccess(userId, subjectId);

    expect(access).toEqual({ allowed: true });
  });

  it("throws when subject is missing", async () => {
    mockPrisma.subject.findFirst.mockResolvedValue(null);

    await expect(service.getSubjectFreeTierStatus(userId, subjectId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
