import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { Roles } from "../admin-auth/decorators/roles.decorator";
import type { AdminAuthPayload } from "../admin-auth/admin-auth.service";
import { AdminJwtGuard, type AdminRequestUser } from "../admin-auth/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../admin-auth/guards/admin-roles.guard";
import { AdminNotificationsService } from "./admin-notifications.service";
import { RecentNotificationsQueryDto } from "./dto/recent-notifications.dto";

@Controller("admin/notifications")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("super_admin", "support", "finance")
export class AdminNotificationsController {
  constructor(private readonly notificationsService: AdminNotificationsService) {}

  @Get("recent")
  listRecent(
    @Req() req: { user: AdminRequestUser },
    @Query() query: RecentNotificationsQueryDto,
  ) {
    return this.notificationsService.listRecent(req.user as AdminAuthPayload, query.since);
  }
}
