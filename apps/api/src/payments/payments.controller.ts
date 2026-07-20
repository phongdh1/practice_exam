import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { PaymentProvider } from "@prisma/client";
import type { Request, Response } from "express";
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

  /** SePay bank webhooks require exact `{"success": true}` (no API envelope). */
  @Post("webhooks/sepay")
  @HttpCode(200)
  async sepayWebhook(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: unknown,
    @Res() res: Response,
  ) {
    await this.webhooksService.handleProviderWebhook("sepay", headers, body);
    return res.status(200).json({ success: true });
  }
}
