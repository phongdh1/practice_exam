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
  qrImageUrl?: string;
  transferContent?: string;
  bankAccountNumber?: string;
  bankCode?: string;
  accountHolder?: string;
  checkoutMode?: "redirect" | "vietqr";
}

export type WebhookPaymentStatus = "paid" | "failed" | "cancelled";

export interface VerifiedWebhookPayload {
  paymentId: string;
  externalEventId: string;
  status: WebhookPaymentStatus;
  /** When set, resolve payment by externalRef (transfer content) + amount */
  transferCode?: string;
  amountVnd?: number;
}

export interface PaymentProviderAdapter {
  readonly provider: PaymentProvider;
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;
  verifyWebhook(
    headers: Record<string, string | string[] | undefined>,
    body: unknown,
  ): VerifiedWebhookPayload | Promise<VerifiedWebhookPayload>;
}
