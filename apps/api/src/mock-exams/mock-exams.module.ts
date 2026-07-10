import { Module } from "@nestjs/common";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { AuthModule } from "../auth/auth.module";
import { EntitlementsModule } from "../entitlements/entitlements.module";
import { SettingsModule } from "../settings/settings.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { PrismaModule } from "../prisma/prisma.module";
import { MockExamsAdminController } from "./mock-exams-admin.controller";
import { MockExamAttemptsController } from "./mock-exam-attempts.controller";
import { MockExamAttemptsService } from "./mock-exam-attempts.service";
import { MockExamsController } from "./mock-exams.controller";
import { MockExamsService } from "./mock-exams.service";

@Module({
  imports: [PrismaModule, AdminAuthModule, AuthModule, EntitlementsModule, SubscriptionsModule, SettingsModule],
  controllers: [MockExamsAdminController, MockExamsController, MockExamAttemptsController],
  providers: [MockExamsService, MockExamAttemptsService],
  exports: [MockExamsService, MockExamAttemptsService],
})
export class MockExamsModule {}
