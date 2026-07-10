import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import crypto from "crypto";
import { IntegrationConfigService } from "../../integrations/integration-config.service";
import { PayosAdapter, SepayAdapter } from "./payment-adapters";

describe("ConfiguredPaymentAdapter", () => {
  const integrationConfig = {
    getPaymentMerchantStored: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    integrationConfig.getPaymentMerchantStored.mockResolvedValue({
      merchantId: "merchant-1",
      apiKey: "api-key-1",
      checksumKey: "checksum-1",
      webhookSecret: "webhook-secret-1",
      testMode: true,
    });
  });

  async function createPayosAdapter(): Promise<PayosAdapter> {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayosAdapter,
        { provide: IntegrationConfigService, useValue: integrationConfig },
      ],
    }).compile();
    return module.get(PayosAdapter);
  }

  it("requires merchant config before checkout", async () => {
    integrationConfig.getPaymentMerchantStored.mockResolvedValue(null);
    const adapter = await createPayosAdapter();

    await expect(
      adapter.createCheckout({
        paymentId: "pay-1",
        amountVnd: 100_000,
        description: "Test",
        returnUrl: "http://localhost/return",
        cancelUrl: "http://localhost/cancel",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("uses merchant id in external ref for test-mode checkout", async () => {
    const adapter = await createPayosAdapter();

    const result = await adapter.createCheckout({
      paymentId: "pay-1",
      amountVnd: 100_000,
      description: "Test",
      returnUrl: "http://localhost/return",
      cancelUrl: "http://localhost/cancel",
    });

    expect(result.externalRef).toBe("merchant-1-pay-1");
    expect(result.checkoutUrl).toContain("mock-checkout");
    expect(integrationConfig.getPaymentMerchantStored).toHaveBeenCalledWith("payos");
  });

  it("verifies webhook signature when secret is configured", async () => {
    const adapter = await createPayosAdapter();
    const body = { paymentId: "pay-1", externalEventId: "evt-1", status: "paid" as const };
    const signature = crypto.createHmac("sha256", "webhook-secret-1").update(JSON.stringify(body)).digest("hex");

    const verified = await adapter.verifyWebhook({ "x-webhook-signature": signature }, body);

    expect(verified.paymentId).toBe("pay-1");
  });

  it("rejects unsigned webhooks in production mode without secret fallback", async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalMockEnabled = process.env.PAYMENT_MOCK_ENABLED;
    process.env.NODE_ENV = "production";
    delete process.env.PAYMENT_MOCK_ENABLED;

    integrationConfig.getPaymentMerchantStored.mockResolvedValue({
      merchantId: "merchant-1",
      apiKey: "api-key-1",
      testMode: false,
    });
    const adapter = await createPayosAdapter();

    await expect(
      adapter.verifyWebhook({}, { paymentId: "pay-1", status: "paid" }),
    ).rejects.toThrow("Webhook secret not configured");

    process.env.NODE_ENV = originalNodeEnv;
    process.env.PAYMENT_MOCK_ENABLED = originalMockEnabled;
  });

  it("does not skip signature verification when merchant testMode is enabled in production", async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalMockEnabled = process.env.PAYMENT_MOCK_ENABLED;
    process.env.NODE_ENV = "production";
    delete process.env.PAYMENT_MOCK_ENABLED;

    integrationConfig.getPaymentMerchantStored.mockResolvedValue({
      merchantId: "merchant-1",
      apiKey: "api-key-1",
      webhookSecret: "webhook-secret-1",
      testMode: true,
    });
    const adapter = await createPayosAdapter();
    const body = { paymentId: "pay-1", externalEventId: "evt-1", status: "paid" as const };

    await expect(adapter.verifyWebhook({}, body)).rejects.toThrow("Missing webhook signature");

    process.env.NODE_ENV = originalNodeEnv;
    process.env.PAYMENT_MOCK_ENABLED = originalMockEnabled;
  });
});

describe("SepayAdapter", () => {
  it("loads sepay merchant config at checkout", async () => {
    const integrationConfig = {
      getPaymentMerchantStored: jest.fn().mockResolvedValue({
        merchantId: "sepay-merchant",
        apiKey: "sepay-key",
        testMode: true,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SepayAdapter,
        { provide: IntegrationConfigService, useValue: integrationConfig },
      ],
    }).compile();

    const adapter = module.get(SepayAdapter);
    const result = await adapter.createCheckout({
      paymentId: "pay-sepay",
      amountVnd: 50_000,
      description: "SePay test",
      returnUrl: "http://localhost/return",
      cancelUrl: "http://localhost/cancel",
    });

    expect(integrationConfig.getPaymentMerchantStored).toHaveBeenCalledWith("sepay");
    expect(result.externalRef).toBe("sepay-merchant-pay-sepay");
  });
});
