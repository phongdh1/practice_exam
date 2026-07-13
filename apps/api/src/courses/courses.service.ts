import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, type CourseVisibility } from "@prisma/client";
import type { AdminCourseView } from "@practice-exam/types";
import { ContentComplianceService } from "../content-compliance/content-compliance.service";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateCourseDto, ReorderCoursesDto, UpdateCourseDto } from "./dto/admin-course.dto";

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contentCompliance: ContentComplianceService,
  ) {}

  async listAdminCourses(): Promise<AdminCourseView[]> {
    const courses = await this.prisma.course.findMany({
      include: { _count: { select: { subjects: true } } },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });

    return courses.map((course) => this.toAdminCourseView(course));
  }

  async createCourse(dto: CreateCourseDto): Promise<AdminCourseView> {
    this.contentCompliance.assertCompliant(dto.name, dto.description);

    let course;
    try {
      course = await this.prisma.course.create({
        data: {
          code: dto.code,
          name: dto.name,
          description: dto.description,
          displayOrder: dto.displayOrder ?? 0,
          visibility: "archived",
        },
        include: { _count: { select: { subjects: true } } },
      });
    } catch (error) {
      this.rethrowUniqueCodeConflict(error);
      throw error;
    }

    return this.toAdminCourseView(course);
  }

  async updateCourse(id: string, dto: UpdateCourseDto): Promise<AdminCourseView> {
    const existing = await this.prisma.course.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        code: "COURSE_NOT_FOUND",
        message: "Không tìm thấy khóa học.",
      });
    }

    const nextName = dto.name ?? existing.name;
    const nextDescription = dto.description !== undefined ? dto.description : existing.description;
    this.contentCompliance.assertCompliant(nextName, nextDescription);

    let course;
    try {
      course = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.course.update({
          where: { id },
          data: {
            ...(dto.code !== undefined && { code: dto.code }),
            ...(dto.name !== undefined && { name: dto.name }),
            ...(dto.description !== undefined && { description: dto.description }),
            ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
            ...(dto.visibility !== undefined && { visibility: dto.visibility }),
          },
          include: { _count: { select: { subjects: true } } },
        });

        if (dto.visibility === "archived") {
          await tx.subject.updateMany({
            where: { courseId: id, visibility: "active" },
            data: { visibility: "archived" },
          });
        }

        return updated;
      });
    } catch (error) {
      this.rethrowUniqueCodeConflict(error);
      throw error;
    }

    return this.toAdminCourseView(course);
  }

  async archiveCourse(id: string): Promise<AdminCourseView> {
    return this.setCourseVisibility(id, "archived");
  }

  async activateCourse(id: string): Promise<AdminCourseView> {
    return this.setCourseVisibility(id, "active");
  }

  async deleteCourse(id: string): Promise<{ id: string; deleted: true }> {
    const existing = await this.prisma.course.findUnique({
      where: { id },
      include: { _count: { select: { subjects: true } } },
    });
    if (!existing) {
      throw new NotFoundException({
        code: "COURSE_NOT_FOUND",
        message: "Không tìm thấy khóa học.",
      });
    }
    if (existing._count.subjects > 0) {
      throw new BadRequestException({
        code: "COURSE_HAS_SUBJECTS",
        message: "Không thể xóa khóa học còn môn học. Hãy xóa hoặc chuyển các môn học trước.",
        details: { subjectCount: existing._count.subjects },
      });
    }

    await this.prisma.course.delete({ where: { id } });
    return { id, deleted: true };
  }

  async reorderCourses(dto: ReorderCoursesDto) {
    const allCourses = await this.prisma.course.findMany({ select: { id: true } });
    const courses = await this.prisma.course.findMany({
      where: { id: { in: dto.orderedIds } },
      select: { id: true },
    });

    if (courses.length !== dto.orderedIds.length) {
      throw new BadRequestException({
        code: "INVALID_COURSE_REORDER",
        message: "Danh sách khóa học không hợp lệ.",
      });
    }

    if (dto.orderedIds.length !== allCourses.length) {
      throw new BadRequestException({
        code: "INCOMPLETE_COURSE_REORDER",
        message: "Phải gửi đầy đủ danh sách khóa học theo thứ tự mới.",
        details: { expectedCount: allCourses.length, receivedCount: dto.orderedIds.length },
      });
    }

    await this.prisma.$transaction(
      dto.orderedIds.map((courseId, index) =>
        this.prisma.course.update({
          where: { id: courseId },
          data: { displayOrder: index },
        }),
      ),
    );

    return { orderedIds: dto.orderedIds };
  }

  private async setCourseVisibility(
    id: string,
    visibility: CourseVisibility,
  ): Promise<AdminCourseView> {
    const existing = await this.prisma.course.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        code: "COURSE_NOT_FOUND",
        message: "Không tìm thấy khóa học.",
      });
    }

    const course = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.course.update({
        where: { id },
        data: { visibility },
        include: { _count: { select: { subjects: true } } },
      });

      if (visibility === "archived") {
        await tx.subject.updateMany({
          where: { courseId: id, visibility: "active" },
          data: { visibility: "archived" },
        });
      }

      return updated;
    });

    return this.toAdminCourseView(course);
  }

  private rethrowUniqueCodeConflict(error: unknown): void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ConflictException({
        code: "COURSE_CODE_EXISTS",
        message: "Mã khóa học đã tồn tại.",
      });
    }
  }

  private toAdminCourseView(course: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    visibility: CourseVisibility;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
    _count: { subjects: number };
  }): AdminCourseView {
    return {
      id: course.id,
      code: course.code,
      name: course.name,
      description: course.description,
      visibility: course.visibility,
      displayOrder: course.displayOrder,
      subjectCount: course._count.subjects,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };
  }
}
