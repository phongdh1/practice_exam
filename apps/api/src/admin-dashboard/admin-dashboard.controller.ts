import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { Roles } from "../admin-auth/decorators/roles.decorator";
import type { AdminAuthPayload } from "../admin-auth/admin-auth.service";
import { AdminJwtGuard, type AdminRequestUser } from "../admin-auth/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../admin-auth/guards/admin-roles.guard";
import { AdminDashboardService } from "./admin-dashboard.service";

@Controller("admin/dashboard")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("super_admin", "editor", "reviewer", "support", "finance")
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get("kpis")
  getKpis(@Req() req: { user: AdminRequestUser }) {
    return this.dashboardService.getKpis(req.user as AdminAuthPayload);
  }
}
