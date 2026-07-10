import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import { Roles } from "../admin-auth/decorators/roles.decorator";
import type { AdminAuthPayload } from "../admin-auth/admin-auth.service";
import { AdminJwtGuard, type AdminRequestUser } from "../admin-auth/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../admin-auth/guards/admin-roles.guard";
import { UpdateSystemSettingsDto } from "./dto/update-system-settings.dto";
import { SettingsService } from "./settings.service";

@Controller("admin/system-settings")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("super_admin")
export class AdminSystemSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getAdminSystemSettings();
  }

  @Patch()
  updateSettings(
    @Body() dto: UpdateSystemSettingsDto,
    @Req() req: { user: AdminRequestUser },
  ) {
    return this.settingsService.updateAdminSystemSettings(dto, req.user as AdminAuthPayload);
  }
}
