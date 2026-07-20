import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { PayosAdapter } from "./adapters/payment-adapters";
import { CheckoutService } from "./checkout.service";
import { PaymentProviderRegistry } from "./payment-provider.registry";
import { SepayAdapter } from "./adapters/payment-adapters";
import { WebhooksService } from "./webhooks.service";
import { IntegrationConfigService } from "../integrations/integration-config.service";
import { PaymentsAdminService } from "../payments-admin/payments-admin.service";

describe("CheckoutService", () => {
  let checkoutService: CheckoutService;
  let webhooksService: WebhooksService;

  const mockPrisma = {
    payment: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    paymentWebhookEvent: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    subscription: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const subscriptionsService = {
    assertSubjectExists: jest.fn(),
    getForSubject: jest.fn(),
    activateOrRenewFromPayment: jest.fn(),
    expireStaleSubscriptions: jest.fn(),
    assertUserNotSuspended: jest.fn(),
  };

  const integrationConfig = {
    isProviderTestMode: jest.fn().mockResolvedValue(false),
    getPaymentMerchantStored: jest.fn().mockResolvedValue({
      merchantId: "merchant-1",
      apiKey: "api-key-1",
      checksumKey: "checksum-1",
      testMode: true,
    }),
  };

  const paymentsAdminService = {
    validatePromoForCheckout: jest.fn(),
    reservePromoUsage: jest.fn(),
    incrementPromoUsage: jest.fn(),
    decrementPromoUsage: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => unknown) =>
      fn(mockPrisma),
    );
    subscriptionsService.assertSubjectExists.mockResolvedValue({
      monthlyAmountVnd: 100_000,
      name: "Chứng khoán cơ bản",
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        WebhooksService,
        PaymentProviderRegistry,
        PayosAdapter,
        SepayAdapter,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SubscriptionsService, useValue: subscriptionsService },
        { provide: IntegrationConfigService, useValue: integrationConfig },
        { provide: PaymentsAdminService, useValue: paymentsAdminService },
      ],
    }).compile();

    checkoutService = module.get(CheckoutService);
    webhooksService = module.get(WebhooksService);
  });

  it("initiates checkout without creating subscription", async () => {
    mockPrisma.payment.create.mockResolvedValue({
      id: "pay-1",
      amountVnd: 100_000,
    });
    mockPrisma.payment.update.mockResolvedValue({});

    const result = await checkoutService.initiateSubscriptionCheckout({
      userId: "user-1",
      subjectId: "subject-1",
      channel: "web",
      provider: "payos",
      returnUrl: "http://localhost/return",
      cancelUrl: "http://localhost/cancel",
    });

    expect(result.paymentId).toBe("pay-1");
    expect(result.checkoutUrl).toContain("mock-checkout");
    expect(mockPrisma.payment.create).toHaveBeenCalled();
  });

  it("marks payment as test when provider is in test mode", async () => {
    integrationConfig.isProviderTestMode.mockResolvedValue(true);
    mockPrisma.payment.create.mockResolvedValue({ id: "pay-test", amountVnd: 100_000 });
    mockPrisma.payment.update.mockResolvedValue({});

    await checkoutService.initiateSubscriptionCheckout({
      userId: "user-1",
      subjectId: "subject-1",
      channel: "web",
      provider: "payos",
      returnUrl: "http://localhost/return",
      cancelUrl: "http://localhost/cancel",
    });

    expect(mockPrisma.payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isTest: true }),
      }),
    );
  });

  it("activates subscription idempotently on paid webhook", async () => {
    mockPrisma.paymentWebhookEvent.findUnique.mockResolvedValue(null);
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: "pay-1",
      userId: "user-1",
      subjectId: "subject-1",
      channel: "web",
      status: "pending",
      promoCode: null,
      isTest: false,
    });
    mockPrisma.paymentWebhookEvent.create.mockResolvedValue({ id: "evt-1" });
    mockPrisma.payment.update.mockResolvedValue({});
    subscriptionsService.activateOrRenewFromPayment.mockResolvedValue({
      subscriptionId: "sub-1",
      periodStart: new Date(),
      periodEnd: new Date(),
    });

    await webhooksService.processVerifiedWebhook("payos", {
      paymentId: "pay-1",
      externalEventId: "evt-ext-1",
      status: "paid",
    });

    expect(subscriptionsService.activateOrRenewFromPayment).toHaveBeenCalled();
    expect(mockPrisma.paymentWebhookEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "processed" }),
      }),
    );
  });

  it("does not activate subscription for test-mode payments", async () => {
    mockPrisma.paymentWebhookEvent.findUnique.mockResolvedValue(null);
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: "pay-test",
      userId: "user-1",
      subjectId: "subject-1",
      channel: "web",
      status: "pending",
      isTest: true,
    });
    mockPrisma.paymentWebhookEvent.create.mockResolvedValue({ id: "evt-test" });
    mockPrisma.payment.update.mockResolvedValue({});

    await webhooksService.processVerifiedWebhook("payos", {
      paymentId: "pay-test",
      externalEventId: "evt-test-1",
      status: "paid",
    });

    expect(subscriptionsService.activateOrRenewFromPayment).not.toHaveBeenCalled();
  });

  it("skips duplicate processed webhook events", async () => {
    mockPrisma.paymentWebhookEvent.findUnique.mockResolvedValue({
      id: "evt-1",
      status: "processed",
      externalEventId: "evt-ext-1",
      provider: "payos",
    });

    const result = await webhooksService.processVerifiedWebhook("payos", {
      paymentId: "pay-1",
      externalEventId: "evt-ext-1",
      status: "paid",
    });

    expect(result.duplicate).toBe(true);
    expect(subscriptionsService.activateOrRenewFromPayment).not.toHaveBeenCalled();
  });

  it("matches SePay bank webhook by transfer code and amount then unlocks", async () => {
    const payment = {
      id: "pay-sepay-1",
      userId: "user-1",
      subjectId: "subject-1",
      channel: "web",
      status: "pending",
      amountVnd: 100_000,
      externalRef: "PEABCDEF1234",
      promoCode: null,
      isTest: false,
    };
    mockPrisma.paymentWebhookEvent.findUnique.mockResolvedValue(null);
    mockPrisma.payment.findFirst.mockResolvedValue(payment);
    mockPrisma.payment.findUnique.mockResolvedValue(payment);
    mockPrisma.paymentWebhookEvent.create.mockResolvedValue({ id: "evt-sepay-1" });
    mockPrisma.payment.update.mockResolvedValue({});
    subscriptionsService.activateOrRenewFromPayment.mockResolvedValue({
      subscriptionId: "sub-1",
      periodStart: new Date(),
      periodEnd: new Date(),
    });

    await webhooksService.processVerifiedWebhook("sepay", {
      paymentId: "",
      externalEventId: "92704",
      status: "paid",
      transferCode: "PEABCDEF1234",
      amountVnd: 100_000,
    });

    expect(mockPrisma.payment.findFirst).toHaveBeenCalled();
    expect(subscriptionsService.activateOrRenewFromPayment).toHaveBeenCalledWith(
      expect.objectContaining({ paymentId: "pay-sepay-1" }),
      expect.anything(),
    );
  });

  it("rejects SePay bank webhook when amount mismatches", async () => {
    mockPrisma.paymentWebhookEvent.findUnique.mockResolvedValue(null);
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: "pay-sepay-2",
      amountVnd: 100_000,
      externalRef: "PEABCDEF1234",
      status: "pending",
    });

    await expect(
      webhooksService.processVerifiedWebhook("sepay", {
        paymentId: "",
        externalEventId: "92705",
        status: "paid",
        transferCode: "PEABCDEF1234",
        amountVnd: 99_000,
      }),
    ).rejects.toMatchObject({ response: expect.objectContaining({ code: "PAYMENT_AMOUNT_MISMATCH" }) });
  });

  it("reserves promo usage when checkout includes promo code", async () => {
    paymentsAdminService.validatePromoForCheckout.mockResolvedValue({
      discountedAmountVnd: 90_000,
      promoCode: "SAVE10",
    });
    mockPrisma.payment.create.mockResolvedValue({
      id: "pay-promo",
      amountVnd: 90_000,
    });
    mockPrisma.payment.update.mockResolvedValue({});

    await checkoutService.initiateSubscriptionCheckout({
      userId: "user-1",
      subjectId: "subject-1",
      channel: "web",
      provider: "payos",
      promoCode: "SAVE10",
      returnUrl: "http://localhost/return",
      cancelUrl: "http://localhost/cancel",
    });

    expect(paymentsAdminService.reservePromoUsage).toHaveBeenCalledWith("SAVE10", mockPrisma);
    expect(mockPrisma.payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ promoCode: "SAVE10", amountVnd: 90_000 }),
      }),
    );
  });
});
