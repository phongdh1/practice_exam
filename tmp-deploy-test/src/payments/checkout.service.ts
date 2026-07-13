import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PaymentChannel, PaymentProvider } from "@prisma/client";
import type { CheckoutResult, PaymentDetail } from "@practice-exam/types";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { PaymentProviderRegistry } from "./payment-provider.registry";
import { WebhooksService } from "./webhooks.service";
import { IntegrationConfigService } from "../integrations/integration-config.service";
import { PaymentsAdminService } from "../payments-admin/payments-admin.service";

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly providerRegistry: PaymentProviderRegistry,
    private readonly webhooksService: WebhooksService,
    private readonly integrationConfig: IntegrationConfigService,
    private readonly paymentsAdminService: PaymentsAdminService,
  ) {}

  async initiateSubscriptionCheckout(input: {
    userId: string;
    subjectId: string;
    provider?: PaymentProvider;
    channel: PaymentChannel;
    promoCode?: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutResult> {
    await this.subscriptionsService.assertUserNotSuspended(input.userId);
    const subject = await this.subscriptionsService.assertSubjectExists(input.subjectId);
    const provider = input.provider ?? this.providerRegistry.getDefaultProvider();
    const adapter = this.providerRegistry.get(provider);
    const isTest = await this.integrationConfig.isProviderTestMode(provider);

    let amountVnd = subject.monthlyAmountVnd;
    let promoCode: string | null = null;
    if (input.promoCode?.trim()) {
      const promo = await this.paymentsAdminService.validatePromoForCheckout({
        code: input.promoCode,
        subjectId: input.subjectId,
        amountVnd,
      });
      amountVnd = promo.discountedAmountVnd;
      promoCode = promo.promoCode;
    }

    const payment = await this.prisma.$transaction(async (tx) => {
      if (promoCode) {
        await this.paymentsAdminService.reservePromoUsage(promoCode, tx);
      }

      return tx.payment.create({
        data: {
          userId: input.userId,
          subjectId: input.subjectId,
          provider,
          channel: input.channel,
          amountVnd,
          promoCode,
          status: "pending",
          isTest,
        },
      });
    });

    const checkout = await adapter.createCheckout({
      paymentId: payment.id,
      amountVnd: payment.amountVnd,
      description: `Đăng ký ${subject.name}`,
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        checkoutUrl: checkout.checkoutUrl,
        externalRef: checkout.externalRef,
      },
    });

    return {
      paymentId: payment.id,
      checkoutUrl: checkout.checkoutUrl,
      provider,
      channel: input.channel,
      amountVnd: payment.amountVnd,
    };
  }

  async getPaymentForUser(userId: string, paymentId: string): Promise<PaymentDetail> {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, userId },
      include: { subscription: true },
    });
    if (!payment) {
      throw new NotFoundException({
        code: "PAYMENT_NOT_FOUND",
        message: "Không tìm thấy giao dịch thanh toán.",
      });
    }

    const subscription = payment.subscription
      ? await this.subscriptionsService.getForSubject(userId, payment.subjectId)
      : null;

    return {
      id: payment.id,
      status: payment.status,
      provider: payment.provider,
      channel: payment.channel,
      amountVnd: payment.amountVnd,
      subjectId: payment.subjectId,
      checkoutUrl: payment.checkoutUrl,
      paidAt: payment.paidAt?.toISOString() ?? null,
      subscription,
    };
  }

  async simulateMockCheckout(userId: string, paymentId: string, provider: PaymentProvider): Promise<void> {
    if (process.env.NODE_ENV === "production" && process.env.PAYMENT_MOCK_ENABLED !== "true") {
      throw new ForbiddenException({
        code: "MOCK_CHECKOUT_DISABLED",
        message: "Mock checkout is not available in production.",
      });
    }

    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, userId },
    });
    if (!payment) {
      throw new NotFoundException({
        code: "PAYMENT_NOT_FOUND",
        message: "Không tìm thấy giao dịch thanh toán.",
      });
    }

    await this.webhooksService.processVerifiedWebhook(provider, {
      paymentId,
      externalEventId: `mock-sim-${paymentId}-${Date.now()}`,
      status: "paid",
    });
  }
}
