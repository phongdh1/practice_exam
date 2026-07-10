import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { SubjectsModule } from "./subjects/subjects.module";
import { EntitlementsModule } from "./entitlements/entitlements.module";
import { SettingsModule } from "./settings/settings.module";
import { ContentComplianceModule } from "./content-compliance/content-compliance.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { PaymentsModule } from "./payments/payments.module";
import { AdminAuthModule } from "./admin-auth/admin-auth.module";
import { QuestionsModule } from "./questions/questions.module";
import { ContentModule } from "./content/content.module";
import { PracticeModule } from "./practice/practice.module";
import { MockExamsModule } from "./mock-exams/mock-exams.module";
import { UsersModule } from "./users/users.module";
import { ProgressModule } from "./progress/progress.module";
import { IntegrationsModule } from "./integrations/integrations.module";
import { PaymentsAdminModule } from "./payments-admin/payments-admin.module";
import { AdminUsersModule } from "./admin-users/admin-users.module";
import { AdminDashboardModule } from "./admin-dashboard/admin-dashboard.module";
import { CoursesModule } from "./courses/courses.module";
import { StudyModule } from "./study/study.module";

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    AdminAuthModule,
    SubjectsModule,
    EntitlementsModule,
    SettingsModule,
    ContentComplianceModule,
    SubscriptionsModule,
    PaymentsModule,
    PaymentsAdminModule,
    QuestionsModule,
    ContentModule,
    PracticeModule,
    MockExamsModule,
    UsersModule,
    ProgressModule,
    IntegrationsModule,
    AdminUsersModule,
    AdminDashboardModule,
    CoursesModule,
    StudyModule,
  ],
})
export class AppModule {}
