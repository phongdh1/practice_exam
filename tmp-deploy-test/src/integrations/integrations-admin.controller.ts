import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { PaymentProvider } from "@prisma/client";
import { AdminJwtGuard, type AdminRequestUser } from "../admin-auth/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../admin-auth/guards/admin-roles.guard";
import { Roles } from "../admin-auth/decorators/roles.decorator";
import {
  TestPaymentWebhookDto,
  UpdatePaymentMerchantDto,
  UpdateZaloConfigDto,
} from "./dto/integrations-admin.dto";
import { IntegrationConfigService } from "./integration-config.service";
import { WebhookLogAdminService } from "./webhook-log-admin.service";

@Controller("admin/integrations")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
export class IntegrationsAdminController {
  constructor(
    private readonly integrationConfig: IntegrationConfigService,
    private readonly webhookLogAdmin: WebhookLogAdminService,
  ) {}

  @Get("zalo")
  @Roles("super_admin")
  getZaloConfig() {
    return this.integrationConfig.getZaloConfigView();
  }

  @Put("zalo")
  @Roles("super_admin")
  updateZaloConfig(
    @Body() dto: UpdateZaloConfigDto,
    @Req() req: { user: AdminRequestUser },
  ) {
    return this.integrationConfig.updateZaloConfig(dto, req.user.sub);
  }

  @Post("zalo/verify")
  @Roles("super_admin")
  verifyZaloConfig(@Req() req: { user: AdminRequestUser }) {
    return this.integrationConfig.verifyZaloConfig(req.user.sub);
  }

  @Get("payments")
  @Roles("super_admin")
  async listPaymentMerchants() {
    const [payos, sepay] = await Promise.all([
      this.integrationConfig.getPaymentMerchantView("payos"),
      this.integrationConfig.getPaymentMerchantView("sepay"),
    ]);
    return { payos, sepay };
  }

  @Get("payments/:provider")
  @Roles("super_admin")
  getPaymentMerchant(@Param("provider") provider: PaymentProvider) {
    return this.integrationConfig.getPaymentMerchantView(provider);
  }

  @Put("payments/:provider")
  @Roles("super_admin")
  updatePaymentMerchant(
    @Param("provider") provider: PaymentProvider,
    @Body() dto: UpdatePaymentMerchantDto,
    @Req() req: { user: AdminRequestUser },
  ) {
    return this.integrationConfig.updatePaymentMerchantConfig(provider, dto, req.user.sub);
  }

  @Post("payments/:provider/test-webhook")
  @Roles("super_admin")
  testPaymentWebhook(
    @Param("provider") provider: PaymentProvider,
    @Body() dto: TestPaymentWebhookDto,
    @Req() req: { user: AdminRequestUser },
  ) {
    return this.webhookLogAdmin.sendTestPaymentWebhook(provider, dto.paymentId, req.user.sub);
  }

  @Get("webhooks")
  @Roles("super_admin")
  listWebhookEvents(@Query("limit") limit?: string) {
    const parsed = limit ? Number.parseInt(limit, 10) : 50;
    return this.webhookLogAdmin.listEvents(Number.isFinite(parsed) ? parsed : 50);
  }

  @Post("webhooks/payment/:eventId/retry")
  @Roles("super_admin")
  retryPaymentWebhook(@Param("eventId") eventId: string) {
    return this.webhookLogAdmin.retryPaymentWebhook(eventId);
  }
}
