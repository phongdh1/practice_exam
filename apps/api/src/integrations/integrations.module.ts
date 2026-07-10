import { Module, forwardRef } from "@nestjs/common";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { PaymentsModule } from "../payments/payments.module";
import { PrismaModule } from "../prisma/prisma.module";
import { IntegrationsAdminController } from "./integrations-admin.controller";
import { IntegrationConfigService } from "./integration-config.service";
import { WebhookLogAdminService } from "./webhook-log-admin.service";
import { ZaloOAuthEventsService } from "./zalo-oauth-events.service";

@Module({
  imports: [PrismaModule, AdminAuthModule, forwardRef(() => PaymentsModule)],
  controllers: [IntegrationsAdminController],
  providers: [IntegrationConfigService, WebhookLogAdminService, ZaloOAuthEventsService],
  exports: [IntegrationConfigService, ZaloOAuthEventsService],
})
export class IntegrationsModule {}
