import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../admin-auth/decorators/roles.decorator";
import { AdminJwtGuard } from "../admin-auth/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../admin-auth/guards/admin-roles.guard";
import { CoursesService } from "./courses.service";
import { CreateCourseDto, ReorderCoursesDto, UpdateCourseDto } from "./dto/admin-course.dto";

@Controller("admin/courses")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
export class CoursesAdminController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @Roles("super_admin", "editor", "reviewer")
  list() {
    return this.coursesService.listAdminCourses();
  }

  @Post()
  @Roles("super_admin")
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.createCourse(dto);
  }

  @Patch("reorder")
  @Roles("super_admin")
  reorder(@Body() dto: ReorderCoursesDto) {
    return this.coursesService.reorderCourses(dto);
  }

  @Patch(":id")
  @Roles("super_admin")
  update(@Param("id") id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.updateCourse(id, dto);
  }

  @Post(":id/archive")
  @Roles("super_admin")
  archive(@Param("id") id: string) {
    return this.coursesService.archiveCourse(id);
  }

  @Post(":id/activate")
  @Roles("super_admin")
  activate(@Param("id") id: string) {
    return this.coursesService.activateCourse(id);
  }

  @Delete(":id")
  @Roles("super_admin")
  delete(@Param("id") id: string) {
    return this.coursesService.deleteCourse(id);
  }
}
