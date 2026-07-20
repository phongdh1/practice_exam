import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Logger,
  NotFoundException,
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
  private readonly logger = new Logger(PaymentsController.name);

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

  /**
   * SePay requires HTTP 200 + exact `{"success": true}` (no API envelope).
   * Business misses (unknown payment / amount mismatch) still ack — SePay maps any HTTP 404
   * to "endpoint not found" in their UI even when the route exists.
   */
  @Post("webhooks/sepay")
  @HttpCode(200)
  async sepayWebhook(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: unknown,
    @Res() res: Response,
  ) {
    try {
      await this.webhooksService.handleProviderWebhook("sepay", headers, body);
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`SePay webhook: payment not matched — ${JSON.stringify(body)}`);
        return res.status(200).json({ success: true });
      }
      if (
        error instanceof BadRequestException &&
        typeof error.getResponse() === "object" &&
        error.getResponse() !== null &&
        (error.getResponse() as { code?: string }).code === "PAYMENT_AMOUNT_MISMATCH"
      ) {
        this.logger.warn(`SePay webhook: amount mismatch — ${JSON.stringify(body)}`);
        return res.status(200).json({ success: true });
      }
      throw error;
    }
    return res.status(200).json({ success: true });
  }
}
