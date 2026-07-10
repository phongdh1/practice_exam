import type { PaymentProvider } from "@prisma/client";

export interface CreateCheckoutInput {
  paymentId: string;
  amountVnd: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutResult {
  checkoutUrl: string;
  externalRef: string;
}

export type WebhookPaymentStatus = "paid" | "failed" | "cancelled";

export interface VerifiedWebhookPayload {
  paymentId: string;
  externalEventId: string;
  status: WebhookPaymentStatus;
}

export interface PaymentProviderAdapter {
  readonly provider: PaymentProvider;
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;
  verifyWebhook(
    headers: Record<string, string | string[] | undefined>,
    body: unknown,
  ): VerifiedWebhookPayload | Promise<VerifiedWebhookPayload>;
}
