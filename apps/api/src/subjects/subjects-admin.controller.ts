import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AdminJwtGuard } from "../admin-auth/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../admin-auth/guards/admin-roles.guard";
import { Roles } from "../admin-auth/decorators/roles.decorator";
import {
  CreateSubjectDto,
  ReorderSubjectsDto,
  SubjectBlueprintDto,
  UpdateSubjectDto,
} from "./dto/admin-subject.dto";
import { SubjectsService } from "./subjects.service";

@Controller("admin/subjects")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
export class SubjectsAdminController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @Roles("super_admin", "editor", "reviewer")
  list() {
    return this.subjectsService.listAdminCatalog();
  }

  @Post()
  @Roles("super_admin")
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.createSubject(dto);
  }

  @Patch("reorder")
  @Roles("super_admin")
  reorder(@Body() dto: ReorderSubjectsDto) {
    return this.subjectsService.reorderSubjects(dto);
  }

  @Patch(":id")
  @Roles("super_admin")
  update(@Param("id") id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectsService.updateSubject(id, dto);
  }

  @Post(":id/archive")
  @Roles("super_admin")
  archive(@Param("id") id: string) {
    return this.subjectsService.archiveSubject(id);
  }

  @Post(":id/activate")
  @Roles("super_admin")
  activate(@Param("id") id: string) {
    return this.subjectsService.activateSubject(id);
  }

  @Patch(":id/blueprint")
  @Roles("super_admin")
  updateBlueprint(@Param("id") id: string, @Body() dto: SubjectBlueprintDto) {
    return this.subjectsService.updateBlueprint(id, dto);
  }

  @Get(":id/go-live-status")
  @Roles("super_admin")
  goLiveStatus(@Param("id") id: string) {
    return this.subjectsService.getGoLiveStatus(id);
  }

  @Delete(":id")
  @Roles("super_admin")
  delete(@Param("id") id: string) {
    return this.subjectsService.deleteSubject(id);
  }
}
