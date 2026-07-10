import { BadRequestException, Injectable } from "@nestjs/common";
import crypto from "crypto";
import type { PaymentProvider } from "@prisma/client";
import { IntegrationConfigService } from "../../integrations/integration-config.service";
import type { PaymentMerchantConfigStored } from "../../integrations/integration-config.types";
import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  PaymentProviderAdapter,
  VerifiedWebhookPayload,
} from "../payment-provider.port";
import {
  assertWebhookSignature,
  mockCheckoutUrl,
  parseWebhookBody,
} from "./payment-adapter.utils";

function usesMockCheckout(config: PaymentMerchantConfigStored): boolean {
  return (
    config.testMode ||
    process.env.PAYMENT_MOCK_ENABLED === "true" ||
    process.env.NODE_ENV === "test"
  );
}

@Injectable()
export class ConfiguredPaymentAdapter implements PaymentProviderAdapter {
  constructor(
    readonly provider: PaymentProvider,
    private readonly integrationConfig: IntegrationConfigService,
  ) {}

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const config = await this.requireMerchantConfig();

    const externalRef = `${config.merchantId}-${input.paymentId}`;
    if (usesMockCheckout(config)) {
      return {
        checkoutUrl: mockCheckoutUrl(input.paymentId, this.provider),
        externalRef,
      };
    }

    const checkoutUrl = await this.createProductionCheckoutUrl(config, input);
    return { checkoutUrl, externalRef };
  }

  async verifyWebhook(
    headers: Record<string, string | string[] | undefined>,
    body: unknown,
  ): Promise<VerifiedWebhookPayload> {
    const config = await this.integrationConfig.getPaymentMerchantStored(this.provider);
    const secret = config?.webhookSecret ?? config?.checksumKey;
    const payload = parseWebhookBody(body);

    if (secret) {
      assertWebhookSignature(headers, body, secret, this.webhookSignatureHeaders());
      return payload;
    }

    if (process.env.PAYMENT_MOCK_ENABLED === "true" || process.env.NODE_ENV === "test") {
      return payload;
    }

    throw new Error("Webhook secret not configured");
  }

  protected webhookSignatureHeaders(): string[] {
    return ["x-webhook-signature", `x-${this.provider}-signature`];
  }

  protected async createProductionCheckoutUrl(
    config: PaymentMerchantConfigStored,
    input: CreateCheckoutInput,
  ): Promise<string> {
    return this.createPayosStyleCheckoutUrl(config, input);
  }

  private async requireMerchantConfig(): Promise<PaymentMerchantConfigStored> {
    const config = await this.integrationConfig.getPaymentMerchantStored(this.provider);
    if (!config?.merchantId || !config.apiKey) {
      throw new BadRequestException({
        code: "PAYMENT_PROVIDER_NOT_CONFIGURED",
        message: "Chưa cấu hình merchant cho nhà cung cấp thanh toán.",
      });
    }
    return config;
  }

  private async createPayosStyleCheckoutUrl(
    config: PaymentMerchantConfigStored,
    input: CreateCheckoutInput,
  ): Promise<string> {
    if (!config.checksumKey) {
      throw new BadRequestException({
        code: "PAYMENT_CHECKSUM_KEY_REQUIRED",
        message: "Checksum key là bắt buộc cho checkout production.",
      });
    }

    const orderCode = Date.now() % 2_147_483_647;
    const signatureData = `amount=${input.amountVnd}&cancelUrl=${input.cancelUrl}&description=${input.description}&orderCode=${orderCode}&returnUrl=${input.returnUrl}`;
    const signature = crypto.createHmac("sha256", config.checksumKey).update(signatureData).digest("hex");

    const res = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": config.merchantId,
        "x-api-key": config.apiKey,
      },
      body: JSON.stringify({
        orderCode,
        amount: input.amountVnd,
        description: input.description,
        returnUrl: input.returnUrl,
        cancelUrl: input.cancelUrl,
        signature,
      }),
    });

    const data = (await res.json()) as { data?: { checkoutUrl?: string }; desc?: string };
    if (!res.ok || !data.data?.checkoutUrl) {
      throw new BadRequestException({
        code: "PAYMENT_CHECKOUT_FAILED",
        message: data.desc ?? "Không thể tạo liên kết thanh toán.",
      });
    }

    return data.data.checkoutUrl;
  }
}

@Injectable()
export class PayosAdapter extends ConfiguredPaymentAdapter {
  constructor(integrationConfig: IntegrationConfigService) {
    super("payos", integrationConfig);
  }
}

@Injectable()
export class SepayAdapter extends ConfiguredPaymentAdapter {
  constructor(integrationConfig: IntegrationConfigService) {
    super("sepay", integrationConfig);
  }

  protected override webhookSignatureHeaders(): string[] {
    return ["x-sepay-signature", "x-webhook-signature"];
  }

  protected override async createProductionCheckoutUrl(
    config: PaymentMerchantConfigStored,
    input: CreateCheckoutInput,
  ): Promise<string> {
    const base = process.env.SEPAY_CHECKOUT_URL ?? "https://my.sepay.vn/userapi/checkout/init";
    const params = new URLSearchParams({
      merchant_id: config.merchantId,
      amount: String(input.amountVnd),
      description: input.description,
      return_url: input.returnUrl,
      cancel_url: input.cancelUrl,
      payment_ref: input.paymentId,
    });

    const res = await fetch(`${base}?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    });

    const data = (await res.json()) as { checkout_url?: string; checkoutUrl?: string; message?: string };
    const checkoutUrl = data.checkout_url ?? data.checkoutUrl;
    if (!res.ok || !checkoutUrl) {
      throw new BadRequestException({
        code: "PAYMENT_CHECKOUT_FAILED",
        message: data.message ?? "Không thể tạo liên kết thanh toán SePay.",
      });
    }

    return checkoutUrl;
  }
}
