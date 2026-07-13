import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../admin-auth/decorators/roles.decorator";
import { AdminJwtGuard } from "../admin-auth/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../admin-auth/guards/admin-roles.guard";
import { CoursesService } from "./courses.service";
import { CreateCourseDto, ReorderCoursesDto, UpdateCourseDto } from "./dto/admin-course.dto";

@Controller("admin/courses")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("super_admin")
export class CoursesAdminController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  list() {
    return this.coursesService.listAdminCourses();
  }

  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.createCourse(dto);
  }

  @Patch("reorder")
  reorder(@Body() dto: ReorderCoursesDto) {
    return this.coursesService.reorderCourses(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.updateCourse(id, dto);
  }

  @Post(":id/archive")
  archive(@Param("id") id: string) {
    return this.coursesService.archiveCourse(id);
  }

  @Post(":id/activate")
  activate(@Param("id") id: string) {
    return this.coursesService.activateCourse(id);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.coursesService.deleteCourse(id);
  }
}
