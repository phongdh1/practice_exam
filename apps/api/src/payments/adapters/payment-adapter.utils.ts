import crypto from "crypto";
import type { WebhookPaymentStatus, VerifiedWebhookPayload } from "../payment-provider.port";

export function mockCheckoutUrl(paymentId: string, provider: string): string {
  const base = process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
  return `${base}/api/v1/payments/${paymentId}/mock-checkout?provider=${provider}`;
}

export function headerValue(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | undefined {
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return value;
}

const VALID_WEBHOOK_STATUSES: WebhookPaymentStatus[] = ["paid", "failed", "cancelled"];

export function parseWebhookBody(body: unknown): VerifiedWebhookPayload {
  const payload = body as {
    paymentId?: string;
    externalEventId?: string;
    status?: WebhookPaymentStatus;
  };

  if (!payload.paymentId) {
    throw new Error("Missing paymentId in webhook payload");
  }
  if (!payload.status || !VALID_WEBHOOK_STATUSES.includes(payload.status)) {
    throw new Error("Missing or invalid webhook payment status");
  }

  return {
    paymentId: payload.paymentId,
    externalEventId: payload.externalEventId ?? `mock-event-${payload.paymentId}`,
    status: payload.status,
  };
}

export function assertWebhookSignature(
  headers: Record<string, string | string[] | undefined>,
  body: unknown,
  secret: string,
  headerNames: string[],
): void {
  const signature = headerNames.map((name) => headerValue(headers, name)).find(Boolean);
  if (!signature) {
    throw new Error("Missing webhook signature");
  }

  const payload = typeof body === "string" ? body : JSON.stringify(body);
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const normalized = signature.startsWith("sha256=") ? signature.slice(7) : signature;

  const expectedBuf = Buffer.from(expected);
  const normalizedBuf = Buffer.from(normalized);
  if (expectedBuf.length !== normalizedBuf.length || !crypto.timingSafeEqual(expectedBuf, normalizedBuf)) {
    throw new Error("Invalid webhook signature");
  }
}
