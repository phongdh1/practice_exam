import { Module } from "@nestjs/common";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { PaymentsAdminModule } from "../payments-admin/payments-admin.module";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminDashboardController } from "./admin-dashboard.controller";
import { AdminDashboardService } from "./admin-dashboard.service";

@Module({
  imports: [PrismaModule, AdminAuthModule, PaymentsAdminModule],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
})
export class AdminDashboardModule {}
