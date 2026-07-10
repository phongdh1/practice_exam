import { Controller, Get, UseGuards } from "@nestjs/common";
import { Roles } from "../decorators/roles.decorator";
import { AdminJwtGuard } from "../guards/admin-jwt.guard";
import { AdminRolesGuard } from "../guards/admin-roles.guard";
import { getPermissionMatrixView } from "./permission-matrix";

@Controller("admin/rbac")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
export class RbacAdminController {
  @Get("permission-matrix")
  @Roles("super_admin")
  getPermissionMatrix() {
    return getPermissionMatrixView();
  }
}
