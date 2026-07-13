import { Module } from "@nestjs/common";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminNotificationsController } from "./admin-notifications.controller";
import { AdminNotificationsService } from "./admin-notifications.service";

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [AdminNotificationsController],
  providers: [AdminNotificationsService],
})
export class AdminNotificationsModule {}
