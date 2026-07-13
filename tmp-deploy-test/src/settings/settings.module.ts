import { Module } from "@nestjs/common";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminSystemSettingsController } from "./admin-system-settings.controller";
import { MaintenanceGuard } from "./guards/maintenance.guard";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [SettingsController, AdminSystemSettingsController],
  providers: [SettingsService, MaintenanceGuard],
  exports: [SettingsService, MaintenanceGuard],
})
export class SettingsModule {}
