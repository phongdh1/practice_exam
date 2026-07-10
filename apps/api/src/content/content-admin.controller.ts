import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminJwtGuard } from "../admin-auth/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../admin-auth/guards/admin-roles.guard";
import { Roles } from "../admin-auth/decorators/roles.decorator";
import { AdminUser } from "../admin-auth/decorators/admin-user.decorator";
import type { AdminAuthPayload } from "../admin-auth/admin-auth.service";
import { ContentService } from "./content.service";
import { QuestionFlagsService } from "./question-flags.service";

@Controller("admin/content")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
export class ContentAdminController {
  constructor(
    private readonly contentService: ContentService,
    private readonly flagsService: QuestionFlagsService,
  ) {}

  @Get("review-queue")
  @Roles("super_admin", "reviewer")
  listReviewQueue(
    @Query("subjectId") subjectId?: string,
    @Query("authorId") authorId?: string,
    @Query("maxAgeDays") maxAgeDays?: string,
  ) {
    return this.contentService.listReviewQueue({
      subjectId,
      authorId,
      maxAgeDays: maxAgeDays ? Number(maxAgeDays) : undefined,
    });
  }

  @Post("review-queue/:id/assign")
  @Roles("super_admin", "reviewer")
  assign(@AdminUser() admin: AdminAuthPayload, @Param("id") id: string) {
    return this.contentService.assignToSelf(id, admin.sub);
  }

  @Post("review-queue/:id/approve")
  @Roles("super_admin", "reviewer")
  approve(
    @AdminUser() admin: AdminAuthPayload,
    @Param("id") id: string,
    @Body("comment") comment?: string,
  ) {
    return this.contentService.approve(id, admin.sub, comment);
  }

  @Post("review-queue/:id/reject")
  @Roles("super_admin", "reviewer")
  reject(
    @AdminUser() admin: AdminAuthPayload,
    @Param("id") id: string,
    @Body("comment") comment: string,
  ) {
    return this.contentService.reject(id, admin.sub, comment);
  }

  @Post("questions/:id/unpublish")
  @Roles("super_admin")
  unpublish(
    @AdminUser() admin: AdminAuthPayload,
    @Param("id") id: string,
    @Body("reason") reason: string,
  ) {
    return this.contentService.unpublish(id, admin.sub, reason);
  }

  @Patch("questions/:id/source-ref")
  @Roles("super_admin", "editor")
  updateSourceRef(
    @Param("id") id: string,
    @Body("sourceRef") sourceRef: string | null,
  ) {
    return this.contentService.updateSourceRef(id, sourceRef);
  }

  @Get("flags")
  @Roles("super_admin", "reviewer")
  listFlags(@Query("status") status?: string) {
    return this.flagsService.listQueue(status);
  }

  @Post("flags/:id/assign")
  @Roles("super_admin", "reviewer")
  assignFlag(@AdminUser() admin: AdminAuthPayload, @Param("id") id: string) {
    return this.flagsService.assign(id, admin.sub);
  }

  @Post("flags/:id/resolve")
  @Roles("super_admin", "reviewer")
  resolveFlag(
    @AdminUser() admin: AdminAuthPayload,
    @Param("id") id: string,
    @Body("resolutionNote") resolutionNote: string,
  ) {
    return this.flagsService.resolve(id, admin.sub, resolutionNote);
  }

  @Post("flags/:id/escalate")
  @Roles("super_admin", "reviewer")
  escalateFlag(@AdminUser() admin: AdminAuthPayload, @Param("id") id: string) {
    return this.flagsService.escalate(id, admin.sub);
  }
}
