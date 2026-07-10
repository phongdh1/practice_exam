import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { EntitlementsModule } from "../entitlements/entitlements.module";
import { SettingsModule } from "../settings/settings.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { PrismaModule } from "../prisma/prisma.module";
import { StudyController } from "./study.controller";
import { StudyService } from "./study.service";

@Module({
  imports: [PrismaModule, AuthModule, EntitlementsModule, SubscriptionsModule, SettingsModule],
  controllers: [StudyController],
  providers: [StudyService],
  exports: [StudyService],
})
export class StudyModule {}
