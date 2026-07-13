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
import {
  CreateQuestionDto,
  SearchQuestionsDto,
  UpdateQuestionDto,
} from "./dto/question.dto";
import { QuestionsService } from "./questions.service";

@Controller("admin/questions")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
export class QuestionsAdminController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @Roles("super_admin", "editor")
  create(@AdminUser() admin: AdminAuthPayload, @Body() dto: CreateQuestionDto) {
    return this.questionsService.create(admin.sub, dto);
  }

  @Get()
  @Roles("super_admin", "editor", "reviewer")
  search(@Query() query: SearchQuestionsDto) {
    return this.questionsService.search(query);
  }

  @Get(":id")
  @Roles("super_admin", "editor", "reviewer")
  findOne(@Param("id") id: string) {
    return this.questionsService.findById(id, true);
  }

  @Patch(":id")
  @Roles("super_admin", "editor")
  update(
    @AdminUser() admin: AdminAuthPayload,
    @Param("id") id: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(id, admin.sub, dto);
  }

  @Post(":id/submit-for-review")
  @Roles("super_admin", "editor")
  submitForReview(@AdminUser() admin: AdminAuthPayload, @Param("id") id: string) {
    return this.questionsService.submitForReview(id, admin.sub);
  }

  @Get(":id/preview")
  @Roles("super_admin", "editor", "reviewer")
  preview(@Param("id") id: string) {
    return this.questionsService.preview(id);
  }
}
