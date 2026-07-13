import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { WebhooksService } from "../payments/webhooks.service";
import { IntegrationConfigService } from "./integration-config.service";
import { WebhookLogAdminService } from "./webhook-log-admin.service";

describe("WebhookLogAdminService", () => {
  let service: WebhookLogAdminService;

  const mockPrisma = {
    payment: {
      findUnique: jest.fn(),
    },
    paymentWebhookEvent: {
      deleteMany: jest.fn(),
      findUnique: jest.fn(),
    },
    zaloOAuthEvent: {
      deleteMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  const mockWebhooks = {
    retryWebhookEvent: jest.fn(),
    processVerifiedWebhook: jest.fn(),
  };

  const mockIntegrationConfig = {
    writeIntegrationAudit: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.paymentWebhookEvent.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.zaloOAuthEvent.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.$queryRaw.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookLogAdminService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: WebhooksService, useValue: mockWebhooks },
        { provide: IntegrationConfigService, useValue: mockIntegrationConfig },
      ],
    }).compile();

    service = module.get(WebhookLogAdminService);
  });

  it("returns unified webhook events with payload from a single query", async () => {
    mockPrisma.$queryRaw.mockResolvedValue([
      {
        id: "z1",
        category: "zalo_oauth",
        provider: null,
        external_event_id: "zalo-user",
        status: "failed",
        error_message: "ZALO_VERIFY_FAILED",
        retry_count: 0,
        created_at: new Date("2026-07-01T11:00:00Z"),
        processed_at: null,
        payment_id: null,
        payload: { code: "oauth-error" },
        can_retry: false,
      },
      {
        id: "p1",
        category: "payment",
        provider: "payos",
        external_event_id: "evt-1",
        status: "failed",
        error_message: "boom",
        retry_count: 1,
        created_at: new Date("2026-07-01T10:00:00Z"),
        processed_at: null,
        payment_id: "pay-1",
        payload: { paymentId: "pay-1", status: "failed" },
        can_retry: true,
      },
    ]);

    const events = await service.listEvents(10);

    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    expect(mockPrisma.paymentWebhookEvent.deleteMany).not.toHaveBeenCalled();
    expect(events).toHaveLength(2);
    expect(events[0].category).toBe("zalo_oauth");
    expect(events[0].payload).toEqual({ code: "oauth-error" });
    expect(events[1].canRetry).toBe(true);
  });

  it("purges expired events via explicit purge method", async () => {
    await service.purgeExpiredEvents();

    expect(mockPrisma.paymentWebhookEvent.deleteMany).toHaveBeenCalled();
    expect(mockPrisma.zaloOAuthEvent.deleteMany).toHaveBeenCalled();
  });

  it("retries only failed payment webhook events", async () => {
    mockPrisma.paymentWebhookEvent.findUnique.mockResolvedValue({
      id: "evt",
      status: "processed",
    });

    await expect(service.retryPaymentWebhook("evt")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("requires pending test-mode payment for admin test webhook", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: "pay-1",
      status: "paid",
      provider: "payos",
      isTest: true,
    });

    await expect(
      service.sendTestPaymentWebhook("payos", "pay-1", "admin-1"),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects test webhook for non-test payments", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: "pay-1",
      status: "pending",
      provider: "payos",
      isTest: false,
    });

    await expect(
      service.sendTestPaymentWebhook("payos", "pay-1", "admin-1"),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("audit-logs successful admin test webhook", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: "pay-1",
      status: "pending",
      provider: "payos",
      isTest: true,
    });
    mockWebhooks.processVerifiedWebhook.mockResolvedValue({ processed: true, duplicate: false });

    const result = await service.sendTestPaymentWebhook("payos", "pay-1", "admin-1");

    expect(result.processed).toBe(true);
    expect(mockWebhooks.processVerifiedWebhook).toHaveBeenCalledWith(
      "payos",
      expect.objectContaining({ paymentId: "pay-1", status: "paid" }),
      expect.objectContaining({ source: "admin_test_webhook", adminId: "admin-1" }),
    );
    expect(mockIntegrationConfig.writeIntegrationAudit).toHaveBeenCalledWith(
      "admin-1",
      "payos",
      "test_webhook",
      expect.objectContaining({ paymentId: "pay-1", processed: true }),
    );
  });
});
