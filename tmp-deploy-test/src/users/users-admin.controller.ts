import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { AdminJwtGuard, type AdminRequestUser } from "../admin-auth/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../admin-auth/guards/admin-roles.guard";
import { Roles } from "../admin-auth/decorators/roles.decorator";
import {
  ExportUserQueryDto,
  ForceMergeDto,
  GrantSubscriptionDto,
  MergePreviewQueryDto,
  RevokeSubscriptionDto,
  SearchUsersQueryDto,
  SuspendUserDto,
  UnsuspendUserDto,
} from "./dto/users-admin.dto";
import { UsersAdminService } from "./users-admin.service";

@Controller("admin/users")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
export class UsersAdminController {
  constructor(private readonly usersAdminService: UsersAdminService) {}

  @Get("search")
  @Roles("support", "super_admin")
  search(@Query() query: SearchUsersQueryDto, @Req() req: { user: AdminRequestUser }) {
    return this.usersAdminService.searchUsers(query.q, req.user);
  }

  @Get("merge/preview")
  @Roles("support", "super_admin")
  mergePreview(
    @Query() query: MergePreviewQueryDto,
    @Req() req: { user: AdminRequestUser },
  ) {
    return this.usersAdminService.previewMerge(query.survivorId, query.duplicateId, req.user);
  }

  @Post("merge")
  @Roles("support", "super_admin")
  forceMerge(@Body() dto: ForceMergeDto, @Req() req: { user: AdminRequestUser }) {
    return this.usersAdminService.forceMerge(dto, req.user);
  }

  @Get(":id/export")
  @Roles("support", "super_admin")
  async exportUser(
    @Param("id", ParseUUIDPipe) id: string,
    @Query() query: ExportUserQueryDto,
    @Req() req: { user: AdminRequestUser },
    @Res() res: Response,
  ) {
    const format = query.format ?? "json";
    const result = await this.usersAdminService.exportUserData(id, format, req.user);
    res.setHeader("Content-Type", result.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    res.send(result.content);
  }

  @Get(":id")
  @Roles("support", "super_admin")
  getProfile(@Param("id", ParseUUIDPipe) id: string, @Req() req: { user: AdminRequestUser }) {
    return this.usersAdminService.getProfile(id, req.user);
  }

  @Post(":id/subscriptions/grant")
  @Roles("support", "super_admin")
  grantSubscription(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GrantSubscriptionDto,
    @Req() req: { user: AdminRequestUser },
  ) {
    return this.usersAdminService.grantSubscription(id, dto, req.user);
  }

  @Post(":id/subscriptions/:subscriptionId/revoke")
  @Roles("support", "super_admin")
  revokeSubscription(
    @Param("id", ParseUUIDPipe) id: string,
    @Param("subscriptionId", ParseUUIDPipe) subscriptionId: string,
    @Body() dto: RevokeSubscriptionDto,
    @Req() req: { user: AdminRequestUser },
  ) {
    return this.usersAdminService.revokeSubscription(id, subscriptionId, dto, req.user);
  }

  @Post(":id/suspend")
  @Roles("support", "super_admin")
  suspend(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: SuspendUserDto,
    @Req() req: { user: AdminRequestUser },
  ) {
    return this.usersAdminService.suspendUser(id, dto.reason, req.user);
  }

  @Post(":id/unsuspend")
  @Roles("super_admin")
  unsuspend(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UnsuspendUserDto,
    @Req() req: { user: AdminRequestUser },
  ) {
    return this.usersAdminService.unsuspendUser(id, dto.reason, req.user);
  }
}
