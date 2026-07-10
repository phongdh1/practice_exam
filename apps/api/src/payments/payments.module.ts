import { Module, forwardRef } from "@nestjs/common";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { IntegrationsModule } from "../integrations/integrations.module";
import { PaymentsAdminModule } from "../payments-admin/payments-admin.module";
import { PayosAdapter, SepayAdapter } from "./adapters/payment-adapters";
import { CheckoutService } from "./checkout.service";
import { PaymentProviderRegistry } from "./payment-provider.registry";
import { PaymentsController } from "./payments.controller";
import { WebhooksService } from "./webhooks.service";

@Module({
  imports: [SubscriptionsModule, forwardRef(() => PaymentsAdminModule), forwardRef(() => IntegrationsModule)],
  controllers: [PaymentsController],
  providers: [
    PayosAdapter,
    SepayAdapter,
    PaymentProviderRegistry,
    CheckoutService,
    WebhooksService,
  ],
  exports: [CheckoutService, WebhooksService],
})
export class PaymentsModule {}
