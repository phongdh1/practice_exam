import {
  Body,
  Controller,
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
@Roles("super_admin")
export class SubjectsAdminController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  list() {
    return this.subjectsService.listAdminCatalog();
  }

  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.subjectsService.createSubject(dto);
  }

  @Patch("reorder")
  reorder(@Body() dto: ReorderSubjectsDto) {
    return this.subjectsService.reorderSubjects(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateSubjectDto) {
    return this.subjectsService.updateSubject(id, dto);
  }

  @Post(":id/archive")
  archive(@Param("id") id: string) {
    return this.subjectsService.archiveSubject(id);
  }

  @Post(":id/activate")
  activate(@Param("id") id: string) {
    return this.subjectsService.activateSubject(id);
  }

  @Patch(":id/blueprint")
  updateBlueprint(@Param("id") id: string, @Body() dto: SubjectBlueprintDto) {
    return this.subjectsService.updateBlueprint(id, dto);
  }

  @Get(":id/go-live-status")
  goLiveStatus(@Param("id") id: string) {
    return this.subjectsService.getGoLiveStatus(id);
  }
}
