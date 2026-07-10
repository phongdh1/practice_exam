import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { SettingsModule } from "../settings/settings.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { EntitlementsController } from "./entitlements.controller";
import { EntitlementsService } from "./entitlements.service";

@Module({
  imports: [PrismaModule, AuthModule, SubscriptionsModule, SettingsModule],
  controllers: [EntitlementsController],
  providers: [EntitlementsService],
  exports: [EntitlementsService],
})
export class EntitlementsModule {}
