import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { WebhookEventLogItem } from "@practice-exam/types";
import type { PaymentProvider } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { WebhooksService } from "../payments/webhooks.service";
import { IntegrationConfigService } from "./integration-config.service";

const RETENTION_DAYS = 90;
const PURGE_INTERVAL_MS = 24 * 60 * 60 * 1000;

type UnifiedWebhookRow = {
  id: string;
  category: "payment" | "zalo_oauth";
  provider: PaymentProvider | null;
  external_event_id: string | null;
  status: string;
  error_message: string | null;
  retry_count: number;
  created_at: Date;
  processed_at: Date | null;
  payment_id: string | null;
  payload: Prisma.JsonValue;
  can_retry: boolean;
};

@Injectable()
export class WebhookLogAdminService {
  private lastPurgeAt = Date.now();
  private purgeInFlight: Promise<void> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly webhooksService: WebhooksService,
    private readonly integrationConfig: IntegrationConfigService,
  ) {}

  async listEvents(limit = 50): Promise<WebhookEventLogItem[]> {
    this.schedulePurgeIfDue();

    const rows = await this.prisma.$queryRaw<UnifiedWebhookRow[]>(Prisma.sql`
      SELECT *
      FROM (
        SELECT
          p.id::text AS id,
          'payment'::text AS category,
          p.provider::text AS provider,
          p.external_event_id,
          p.status,
          p.error_message,
          p.retry_count,
          p.created_at,
          p.processed_at,
          p.payment_id::text AS payment_id,
          p.payload,
          (p.status = 'failed') AS can_retry
        FROM payment_webhook_events p
        UNION ALL
        SELECT
          z.id::text AS id,
          'zalo_oauth'::text AS category,
          NULL::text AS provider,
          z.external_id AS external_event_id,
          z.status,
          z.error_message,
          0 AS retry_count,
          z.created_at,
          z.processed_at,
          NULL::text AS payment_id,
          z.payload,
          false AS can_retry
        FROM zalo_oauth_events z
      ) events
      ORDER BY created_at DESC
      LIMIT ${limit}
    `);

    return rows.map((event) => ({
      id: event.id,
      category: event.category,
      provider: event.provider,
      externalEventId: event.external_event_id,
      status: event.status,
      errorMessage: event.error_message,
      retryCount: event.retry_count,
      createdAt: event.created_at.toISOString(),
      processedAt: event.processed_at?.toISOString() ?? null,
      paymentId: event.payment_id,
      payload: event.payload,
      canRetry: event.can_retry,
    }));
  }

  async purgeExpiredEvents(): Promise<void> {
    await this.purgeExpired();
  }

  async retryPaymentWebhook(eventId: string): Promise<{ processed: boolean }> {
    const event = await this.prisma.paymentWebhookEvent.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException({
        code: "WEBHOOK_EVENT_NOT_FOUND",
        message: "Không tìm thấy sự kiện webhook.",
      });
    }
    if (event.status !== "failed") {
      throw new NotFoundException({
        code: "WEBHOOK_NOT_RETRYABLE",
        message: "Chỉ có thể thử lại sự kiện webhook thất bại.",
      });
    }
    return this.webhooksService.retryWebhookEvent(eventId);
  }

  async sendTestPaymentWebhook(
    provider: PaymentProvider,
    paymentId: string,
    adminId: string,
  ): Promise<{ processed: boolean; duplicate: boolean }> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new NotFoundException({
        code: "PAYMENT_NOT_FOUND",
        message: "Không tìm thấy giao dịch thanh toán.",
      });
    }
    if (payment.status !== "pending") {
      throw new BadRequestException({
        code: "PAYMENT_NOT_PENDING",
        message: "Chỉ có thể gửi test webhook cho giao dịch đang chờ thanh toán.",
      });
    }
    if (payment.provider !== provider) {
      throw new BadRequestException({
        code: "PAYMENT_PROVIDER_MISMATCH",
        message: "Giao dịch không khớp với nhà cung cấp thanh toán.",
      });
    }
    if (!payment.isTest) {
      throw new BadRequestException({
        code: "PAYMENT_NOT_TEST_MODE",
        message: "Chỉ có thể gửi test webhook cho giao dịch test mode.",
      });
    }

    const result = await this.webhooksService.processVerifiedWebhook(
      provider,
      {
        paymentId,
        externalEventId: `admin-test-${paymentId}-${Date.now()}`,
        status: "paid",
      },
      { source: "admin_test_webhook", paymentId, adminId },
    );

    await this.integrationConfig.writeIntegrationAudit(adminId, provider, "test_webhook", {
      paymentId,
      processed: result.processed,
      duplicate: result.duplicate,
    });

    return result;
  }

  private schedulePurgeIfDue(): void {
    const now = Date.now();
    if (now - this.lastPurgeAt < PURGE_INTERVAL_MS || this.purgeInFlight) {
      return;
    }

    this.purgeInFlight = this.purgeExpired()
      .then(() => {
        this.lastPurgeAt = Date.now();
      })
      .finally(() => {
        this.purgeInFlight = null;
      });
  }

  private async purgeExpired(): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

    await Promise.all([
      this.prisma.paymentWebhookEvent.deleteMany({
        where: { createdAt: { lt: cutoff } },
      }),
      this.prisma.zaloOAuthEvent.deleteMany({
        where: { createdAt: { lt: cutoff } },
      }),
    ]);
  }
}
