import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { PaymentProvider } from "@prisma/client";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/auth.guards";
import { AuthUserPayload } from "../auth/token.service";
import { CheckoutService } from "./checkout.service";
import { InitiateCheckoutDto } from "./dto/checkout.dto";
import { WebhooksService } from "./webhooks.service";

@Controller()
export class PaymentsController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly webhooksService: WebhooksService,
  ) {}

  @Post("checkout/subscription")
  @UseGuards(JwtAuthGuard)
  initiateCheckout(
    @Req() req: Request & { user: AuthUserPayload },
    @Body() dto: InitiateCheckoutDto,
  ) {
    return this.checkoutService.initiateSubscriptionCheckout({
      userId: req.user.sub,
      subjectId: dto.subjectId,
      provider: dto.provider,
      channel: dto.channel,
      promoCode: dto.promoCode,
      returnUrl: dto.returnUrl,
      cancelUrl: dto.cancelUrl,
    });
  }

  @Get("payments/:id")
  @UseGuards(JwtAuthGuard)
  getPayment(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("id") paymentId: string,
  ) {
    return this.checkoutService.getPaymentForUser(req.user.sub, paymentId);
  }

  @Post("payments/:id/mock-checkout")
  @UseGuards(JwtAuthGuard)
  mockCheckout(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("id") paymentId: string,
    @Query("provider") provider: PaymentProvider = "payos",
  ) {
    return this.checkoutService.simulateMockCheckout(req.user.sub, paymentId, provider);
  }

  @Post("webhooks/payos")
  payosWebhook(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: unknown,
  ) {
    return this.webhooksService.handleProviderWebhook("payos", headers, body);
  }

  @Post("webhooks/sepay")
  sepayWebhook(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: unknown,
  ) {
    return this.webhooksService.handleProviderWebhook("sepay", headers, body);
  }
}
