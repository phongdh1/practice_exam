import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { EntitlementsModule } from "../entitlements/entitlements.module";
import { SettingsModule } from "../settings/settings.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { PrismaModule } from "../prisma/prisma.module";
import { PracticeController } from "./practice.controller";
import { PracticeService } from "./practice.service";

@Module({
  imports: [PrismaModule, AuthModule, EntitlementsModule, SubscriptionsModule, SettingsModule],
  controllers: [PracticeController],
  providers: [PracticeService],
  exports: [PracticeService],
})
export class PracticeModule {}
