import { Test, TestingModule } from "@nestjs/testing";
import { SubscriptionsService } from "./subscriptions.service";
import { PrismaService } from "../prisma/prisma.service";

describe("SubscriptionsService", () => {
  let service: SubscriptionsService;

  const mockPrisma = {
    subscription: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    subject: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => unknown) =>
      fn(mockPrisma),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(SubscriptionsService);
  });

  it("marks expiring subscriptions within 3 days", () => {
    const periodEnd = new Date(Date.now() + 2 * 86_400_000);
    expect(service.resolveDisplayStatus(periodEnd, "active")).toBe("expiring");
  });

  it("creates new subscription on first payment", async () => {
    mockPrisma.subscription.findFirst.mockResolvedValue(null);
    mockPrisma.subscription.create.mockResolvedValue({
      id: "sub-1",
      periodStart: new Date("2026-06-01T00:00:00.000Z"),
      periodEnd: new Date("2026-07-01T00:00:00.000Z"),
    });

    const result = await service.activateOrRenewFromPayment({
      userId: "user-1",
      subjectId: "subject-1",
      channel: "web",
      paymentId: "pay-1",
      paidAt: new Date("2026-06-01T00:00:00.000Z"),
    });

    expect(result.subscriptionId).toBe("sub-1");
    expect(mockPrisma.subscription.create).toHaveBeenCalled();
  });

  it("extends renewal from previous period end", async () => {
    const existingEnd = new Date("2026-07-01T00:00:00.000Z");
    mockPrisma.subscription.findFirst.mockResolvedValue({
      id: "sub-1",
      periodEnd: existingEnd,
      periodStart: new Date("2026-06-01T00:00:00.000Z"),
    });
    mockPrisma.subscription.update.mockResolvedValue({
      id: "sub-1",
      periodStart: existingEnd,
      periodEnd: new Date("2026-08-01T00:00:00.000Z"),
    });

    await service.activateOrRenewFromPayment({
      userId: "user-1",
      subjectId: "subject-1",
      channel: "web",
      paymentId: "pay-2",
      paidAt: new Date("2026-06-15T00:00:00.000Z"),
    });

    expect(mockPrisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "sub-1" },
        data: expect.objectContaining({ paymentId: "pay-2" }),
      }),
    );
  });
});
