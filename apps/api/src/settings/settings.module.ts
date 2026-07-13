import { Module } from "@nestjs/common";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminSystemSettingsController } from "./admin-system-settings.controller";
import {
  AdminLandingContentController,
  PublicLandingAssetsController,
} from "./admin-landing-content.controller";
import { MaintenanceGuard } from "./guards/maintenance.guard";
import { LocalDiskLandingAssetStorage } from "./landing-asset.storage";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [
    SettingsController,
    AdminSystemSettingsController,
    AdminLandingContentController,
    PublicLandingAssetsController,
  ],
  providers: [SettingsService, MaintenanceGuard, LocalDiskLandingAssetStorage],
  exports: [SettingsService, MaintenanceGuard],
})
export class SettingsModule {}
