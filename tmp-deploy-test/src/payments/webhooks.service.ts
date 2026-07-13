import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { PaymentProvider } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { PaymentsAdminService } from "../payments-admin/payments-admin.service";
import { PaymentProviderRegistry } from "./payment-provider.registry";
import type { VerifiedWebhookPayload, WebhookPaymentStatus } from "./payment-provider.port";

function readStoredWebhookPayload(
  payload: unknown,
  fallbackPaymentId: string | null,
  externalEventId: string,
): VerifiedWebhookPayload {
  const record =
    typeof payload === "object" && payload !== null && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};
  const status = record.status;
  const webhookStatus: WebhookPaymentStatus =
    status === "paid" || status === "failed" || status === "cancelled" ? status : "paid";
  return {
    paymentId:
      typeof record.paymentId === "string" ? record.paymentId : fallbackPaymentId ?? "",
    externalEventId,
    status: webhookStatus,
  };
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly providerRegistry: PaymentProviderRegistry,
    private readonly paymentsAdminService: PaymentsAdminService,
  ) {}

  async handleProviderWebhook(
    provider: PaymentProvider,
    headers: Record<string, string | string[] | undefined>,
    body: unknown,
  ): Promise<{ processed: boolean; duplicate: boolean }> {
    const adapter = this.providerRegistry.get(provider);
    let verified: VerifiedWebhookPayload;
    try {
      verified = await adapter.verifyWebhook(headers, body);
    } catch (error) {
      this.logger.warn(`Webhook verification failed for ${provider}: ${String(error)}`);
      throw new BadRequestException({
        code: "WEBHOOK_VERIFICATION_FAILED",
        message: "Xác thực webhook thất bại.",
      });
    }
    return this.processVerifiedWebhook(provider, verified, body);
  }

  async processVerifiedWebhook(
    provider: PaymentProvider,
    verified: VerifiedWebhookPayload,
    rawPayload: unknown = verified,
  ): Promise<{ processed: boolean; duplicate: boolean }> {
    const existingEvent = await this.prisma.paymentWebhookEvent.findUnique({
      where: {
        provider_externalEventId: {
          provider,
          externalEventId: verified.externalEventId,
        },
      },
    });
    if (existingEvent?.status === "processed") {
      return { processed: true, duplicate: true };
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: verified.paymentId },
    });
    if (!payment) {
      throw new NotFoundException({
        code: "PAYMENT_NOT_FOUND",
        message: "Không tìm thấy giao dịch thanh toán.",
      });
    }

    const event =
      existingEvent ??
      (await this.prisma.paymentWebhookEvent.create({
        data: {
          provider,
          externalEventId: verified.externalEventId,
          paymentId: payment.id,
          status: "received",
          payload: rawPayload as object,
        },
      }));

    try {
      if (verified.status === "paid") {
        await this.markPaidAndActivate(payment.id);
      } else if (verified.status === "failed" || verified.status === "cancelled") {
        await this.prisma.$transaction(async (tx) => {
          const current = await tx.payment.findUnique({ where: { id: payment.id } });
          if (current?.promoCode && current.status === "pending") {
            await this.paymentsAdminService.decrementPromoUsage(current.promoCode, tx);
          }
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: verified.status },
          });
        });
      }

      await this.prisma.paymentWebhookEvent.update({
        where: { id: event.id },
        data: { status: "processed", processedAt: new Date(), errorMessage: null },
      });
      return { processed: true, duplicate: false };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.prisma.paymentWebhookEvent.update({
        where: { id: event.id },
        data: {
          status: "failed",
          errorMessage: message,
          retryCount: { increment: 1 },
        },
      });
      throw error;
    }
  }

  async retryWebhookEvent(eventId: string): Promise<{ processed: boolean }> {
    const event = await this.prisma.paymentWebhookEvent.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException({
        code: "WEBHOOK_EVENT_NOT_FOUND",
        message: "Không tìm thấy sự kiện webhook.",
      });
    }
    const payload = readStoredWebhookPayload(
      event.payload,
      event.paymentId,
      event.externalEventId,
    );
    const result = await this.processVerifiedWebhook(event.provider, payload, event.payload);
    return { processed: result.processed };
  }

  private async markPaidAndActivate(paymentId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId } });
      if (!payment) return;
      if (payment.status === "paid") return;

      const paidAt = new Date();
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "paid", paidAt },
      });

      if (payment.isTest) {
        return;
      }

      await this.subscriptionsService.activateOrRenewFromPayment(
        {
          userId: payment.userId,
          subjectId: payment.subjectId,
          channel: payment.channel,
          paymentId: payment.id,
          paidAt,
        },
        tx,
      );
    });
  }
}
