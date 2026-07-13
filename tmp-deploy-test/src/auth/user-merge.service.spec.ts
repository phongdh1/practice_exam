import { Test, TestingModule } from "@nestjs/testing";
import { UserMergeService } from "./user-merge.service";
import { PrismaService } from "../prisma/prisma.service";

describe("UserMergeService", () => {
  let service: UserMergeService;

  const mockPrisma = {
    $transaction: jest.fn((fn: (tx: typeof mockPrisma) => unknown) => fn(mockPrisma)),
    user: {
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    authAuditLog: {
      updateMany: jest.fn(),
    },
    subscription: {
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    freeTierUsage: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    authIdentity: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    practiceSession: {
      updateMany: jest.fn(),
    },
    mockExamAttempt: {
      updateMany: jest.fn(),
    },
    payment: {
      updateMany: jest.fn(),
    },
    questionFlag: {
      updateMany: jest.fn(),
    },
    refreshToken: {
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserMergeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(UserMergeService);
  });

  it("retains longer subscription when merging duplicate subjects", async () => {
    const shorterEnd = new Date("2026-07-01");
    const longerEnd = new Date("2026-08-01");

    mockPrisma.user.findUniqueOrThrow
      .mockResolvedValueOnce({ id: "surv", isSuspended: false })
      .mockResolvedValueOnce({ id: "dup", isSuspended: false });
    mockPrisma.authAuditLog.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.subscription.findMany
      .mockResolvedValueOnce([
        {
          id: "sub-dup",
          userId: "dup",
          subjectId: "subject-1",
          status: "active",
          periodStart: new Date("2026-06-01"),
          periodEnd: longerEnd,
          channel: "zalo",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "sub-surv",
          userId: "surv",
          subjectId: "subject-1",
          status: "active",
          periodStart: new Date("2026-06-01"),
          periodEnd: shorterEnd,
          channel: "web",
        },
      ]);
    mockPrisma.subscription.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.freeTierUsage.findMany.mockResolvedValue([]);
    mockPrisma.authIdentity.findMany.mockResolvedValue([]);
    mockPrisma.practiceSession.updateMany.mockResolvedValue({ count: 2 });
    mockPrisma.mockExamAttempt.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.payment.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.questionFlag.updateMany.mockResolvedValue({ count: 0 });

    const summary = await service.mergeUsers("surv", "dup");

    expect(mockPrisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "sub-surv" },
        data: expect.objectContaining({ periodEnd: longerEnd }),
      }),
    );
    expect(mockPrisma.subscription.delete).toHaveBeenCalledWith({ where: { id: "sub-dup" } });
    expect(summary.practiceSessionsMerged).toBe(2);
    expect(summary.duplicateSubscriptionsResolved).toBe(1);
  });

  it("propagates suspension from duplicate to survivor", async () => {
    mockPrisma.user.findUniqueOrThrow
      .mockResolvedValueOnce({ id: "surv", isSuspended: false })
      .mockResolvedValueOnce({ id: "dup", isSuspended: true });
    mockPrisma.authAuditLog.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.subscription.findMany.mockResolvedValue([]);
    mockPrisma.subscription.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.freeTierUsage.findMany.mockResolvedValue([]);
    mockPrisma.authIdentity.findMany.mockResolvedValue([]);
    mockPrisma.practiceSession.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.mockExamAttempt.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.payment.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.questionFlag.updateMany.mockResolvedValue({ count: 0 });

    await service.mergeUsers("surv", "dup");

    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "surv" },
      data: { isSuspended: true },
    });
  });
});
