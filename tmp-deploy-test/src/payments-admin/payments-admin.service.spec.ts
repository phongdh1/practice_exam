import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { UserMergeService } from "../auth/user-merge.service";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentsAdminService } from "./payments-admin.service";

describe("PaymentsAdminService", () => {
  let service: PaymentsAdminService;

  const mockPrisma = {
    payment: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    subject: { findMany: jest.fn() },
    paymentWebhookEvent: { findMany: jest.fn() },
    paymentRefund: { create: jest.fn(), findMany: jest.fn() },
    promoCode: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    subscription: { findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    $transaction: jest.fn(),
  };

  const userMergeService = { logAudit: jest.fn() };

  const admin = {
    sub: "admin-1",
    username: "finance",
    role: "finance" as const,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => unknown) =>
      fn(mockPrisma),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsAdminService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UserMergeService, useValue: userMergeService },
      ],
    }).compile();

    service = module.get(PaymentsAdminService);
  });

  it("lists transactions with pagination", async () => {
    mockPrisma.payment.count.mockResolvedValue(1);
    mockPrisma.payment.findMany.mockResolvedValue([
      {
        id: "pay-1",
        userId: "user-1",
        subjectId: "subj-1",
        amountVnd: 100_000,
        provider: "payos",
        channel: "web",
        status: "paid",
        externalRef: "ext-1",
        promoCode: null,
        paidAt: new Date(),
        createdAt: new Date(),
        user: { displayName: "Test User" },
        subscription: { id: "sub-1", status: "active" },
      },
    ]);
    mockPrisma.subject.findMany.mockResolvedValue([
      { id: "subj-1", name: "Chứng khoán", code: "CK" },
    ]);

    const result = await service.listTransactions({ page: 1, limit: 20 });

    expect(result.total).toBe(1);
    expect(result.items[0].subjectName).toBe("Chứng khoán");
    expect(result.items[0].subscriptionId).toBe("sub-1");
  });

  it("rejects expired promo codes at checkout", async () => {
    mockPrisma.promoCode.findUnique.mockResolvedValue({
      code: "OLD",
      isActive: true,
      expiresAt: new Date("2020-01-01"),
      usageCount: 0,
      usageLimit: 10,
      subjectIds: [],
      discountType: "percentage",
      discountValue: 10,
    });

    await expect(
      service.validatePromoForCheckout({ code: "OLD", subjectId: "subj-1", amountVnd: 100_000 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("applies percentage discount at checkout", async () => {
    mockPrisma.promoCode.findUnique.mockResolvedValue({
      code: "SAVE10",
      isActive: true,
      expiresAt: new Date("2099-01-01"),
      usageCount: 0,
      usageLimit: 10,
      subjectIds: [],
      discountType: "percentage",
      discountValue: 10,
    });

    const result = await service.validatePromoForCheckout({
      code: "save10",
      subjectId: "subj-1",
      amountVnd: 100_000,
    });

    expect(result.discountedAmountVnd).toBe(90_000);
    expect(result.promoCode).toBe("SAVE10");
  });

  it("initiates refund for paid payment with audit log", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: "pay-1",
      userId: "user-1",
      subjectId: "subj-1",
      status: "paid",
      amountVnd: 100_000,
      paidAt: new Date(),
      promoCode: null,
      subscription: { id: "sub-1", status: "active", periodStart: new Date(), periodEnd: new Date(Date.now() + 30 * 86400000) },
      refunds: [],
    });
    mockPrisma.paymentRefund.create.mockResolvedValue({
      id: "ref-1",
      paymentId: "pay-1",
      amountVnd: 100_000,
      reason: "Duplicate charge",
      status: "pending",
      providerRef: null,
      createdAt: new Date(),
      processedAt: null,
    });
    mockPrisma.paymentRefund.update = jest.fn().mockResolvedValue({
      id: "ref-1",
      paymentId: "pay-1",
      amountVnd: 100_000,
      reason: "Duplicate charge",
      status: "confirmed",
      providerRef: "mock-refund-payos-pay-1",
      createdAt: new Date(),
      processedAt: new Date(),
    });
    mockPrisma.subscription.findUnique.mockResolvedValue({
      id: "sub-1",
      status: "active",
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 86400000),
    });

    const result = await service.initiateRefund("pay-1", { reason: "Duplicate charge" }, admin);

    expect(result.status).toBe("confirmed");
    expect(userMergeService.logAudit).toHaveBeenCalledWith(
      "user-1",
      "admin.payment_refund",
      expect.objectContaining({ paymentId: "pay-1" }),
    );
  });

  it("resolves active subscription by user and subject after renewal", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: "pay-old",
      userId: "user-1",
      subjectId: "subj-1",
      status: "paid",
      amountVnd: 100_000,
      paidAt: new Date(),
      promoCode: null,
      subscription: null,
      refunds: [],
    });
    mockPrisma.subscription.findFirst.mockResolvedValue({
      id: "sub-renewed",
      status: "active",
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 86400000),
    });
    mockPrisma.paymentRefund.create.mockResolvedValue({
      id: "ref-2",
      paymentId: "pay-old",
      amountVnd: 100_000,
      reason: "Customer request",
      status: "pending",
      providerRef: null,
      createdAt: new Date(),
      processedAt: null,
    });
    mockPrisma.paymentRefund.update = jest.fn().mockResolvedValue({
      id: "ref-2",
      paymentId: "pay-old",
      amountVnd: 100_000,
      reason: "Customer request",
      status: "confirmed",
      providerRef: "mock-refund-payos-pay-old",
      createdAt: new Date(),
      processedAt: new Date(),
    });
    mockPrisma.subscription.findUnique.mockResolvedValue({
      id: "sub-renewed",
      status: "active",
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 30 * 86400000),
    });

    await service.initiateRefund("pay-old", { reason: "Customer request" }, admin);

    expect(mockPrisma.subscription.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user-1", subjectId: "subj-1", status: "active" }),
      }),
    );
    expect(mockPrisma.subscription.update).toHaveBeenCalled();
  });

  it("decrements promo usage count on refund", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: "pay-1",
      userId: "user-1",
      subjectId: "subj-1",
      status: "paid",
      amountVnd: 100_000,
      paidAt: new Date(),
      promoCode: "SAVE10",
      subscription: null,
      refunds: [],
    });
    mockPrisma.paymentRefund.create.mockResolvedValue({
      id: "ref-3",
      paymentId: "pay-1",
      amountVnd: 100_000,
      reason: "Promo test",
      status: "pending",
      providerRef: null,
      createdAt: new Date(),
      processedAt: null,
    });
    mockPrisma.paymentRefund.update = jest.fn().mockResolvedValue({
      id: "ref-3",
      status: "confirmed",
      paymentId: "pay-1",
      amountVnd: 100_000,
      reason: "Promo test",
      providerRef: "mock-refund",
      createdAt: new Date(),
      processedAt: new Date(),
    });
    mockPrisma.promoCode.findUnique.mockResolvedValue({
      code: "SAVE10",
      usageCount: 1,
    });

    await service.initiateRefund("pay-1", { reason: "Promo test" }, admin);

    expect(mockPrisma.promoCode.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { code: "SAVE10" },
        data: { usageCount: { decrement: 1 } },
      }),
    );
  });

  it("rejects promo reservation when usage limit reached", async () => {
    mockPrisma.promoCode.findUnique.mockResolvedValue({
      code: "FULL",
      isActive: true,
      expiresAt: new Date("2099-01-01"),
      usageCount: 10,
      usageLimit: 10,
    });

    await expect(service.reservePromoUsage("FULL", mockPrisma as never)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("atomically reserves promo usage at checkout", async () => {
    mockPrisma.promoCode.findUnique.mockResolvedValue({
      code: "SAVE10",
      isActive: true,
      expiresAt: new Date("2099-01-01"),
      usageCount: 2,
      usageLimit: 10,
    });
    mockPrisma.promoCode.updateMany.mockResolvedValue({ count: 1 });

    await service.reservePromoUsage("SAVE10", mockPrisma as never);

    expect(mockPrisma.promoCode.updateMany).toHaveBeenCalledWith({
      where: { code: "SAVE10", usageCount: 2 },
      data: { usageCount: { increment: 1 } },
    });
  });

  it("excludes non-paid payments from revenue totals", async () => {
    mockPrisma.payment.findMany.mockResolvedValue([
      { subjectId: "subj-1", channel: "web", amountVnd: 50_000, paidAt: new Date() },
    ]);
    mockPrisma.paymentRefund.findMany.mockResolvedValue([
      {
        amountVnd: 10_000,
        payment: { subjectId: "subj-1", channel: "web", amountVnd: 10_000 },
      },
    ]);
    mockPrisma.subject.findMany.mockResolvedValue([
      { id: "subj-1", name: "CK", code: "CK" },
    ]);

    const report = await service.getRevenueReport({});

    expect(report.totalRevenueVnd).toBe(40_000);
    expect(report.totalCount).toBe(1);
    expect(report.bySubject[0].revenueVnd).toBe(40_000);
  });
});
