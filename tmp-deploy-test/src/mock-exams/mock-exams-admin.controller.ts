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
import {
  CreateMockExamTemplateDto,
  UpdateMockExamTemplateDto,
} from "./dto/mock-exam.dto";
import { MockExamsService } from "./mock-exams.service";

@Controller("admin/mock-exam-templates")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("super_admin")
export class MockExamsAdminController {
  constructor(private readonly mockExamsService: MockExamsService) {}

  @Get()
  list(@Query("subjectId") subjectId?: string) {
    return this.mockExamsService.listAdmin(subjectId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.mockExamsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateMockExamTemplateDto) {
    return this.mockExamsService.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateMockExamTemplateDto) {
    return this.mockExamsService.update(id, dto);
  }

  @Post(":id/approve")
  approve(@Param("id") id: string) {
    return this.mockExamsService.approve(id);
  }

  @Post(":id/archive")
  archive(@Param("id") id: string) {
    return this.mockExamsService.archive(id);
  }

  @Get(":id/preview")
  preview(@Param("id") id: string) {
    return this.mockExamsService.generatePreview(id);
  }
}
