import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "../admin-auth/decorators/roles.decorator";
import type { AdminAuthPayload } from "../admin-auth/admin-auth.service";
import { AdminJwtGuard, type AdminRequestUser } from "../admin-auth/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../admin-auth/guards/admin-roles.guard";
import { AdminUsersService } from "./admin-users.service";
import {
  CreateAdminUserDto,
  ListAdminAuthAuditQueryDto,
  UpdateAdminUserDto,
} from "./dto/admin-users.dto";

@Controller("admin/admin-users")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("super_admin")
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  listStaff() {
    return this.adminUsersService.listStaff();
  }

  @Get("auth-audit")
  listAuthAudit(@Query() query: ListAdminAuthAuditQueryDto) {
    const limit = query.limit ? Number.parseInt(query.limit, 10) : 50;
    return this.adminUsersService.listAuthAudit(Number.isFinite(limit) ? limit : 50);
  }

  @Post()
  createStaff(
    @Body() dto: CreateAdminUserDto,
    @Req() req: { user: AdminRequestUser },
  ) {
    return this.adminUsersService.createStaff(dto, req.user as AdminAuthPayload);
  }

  @Patch(":id")
  updateStaff(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminUserDto,
    @Req() req: { user: AdminRequestUser },
  ) {
    return this.adminUsersService.updateStaff(id, dto, req.user as AdminAuthPayload);
  }
}
