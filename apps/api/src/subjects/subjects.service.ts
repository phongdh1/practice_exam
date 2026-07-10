import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, type SubjectVisibility } from "@prisma/client";
import type { SubjectCatalogItem } from "@practice-exam/types";
import { scanProhibitedClaims } from "@practice-exam/utils";
import { ContentComplianceService } from "../content-compliance/content-compliance.service";
import { PrismaService } from "../prisma/prisma.service";
import {
  DEFAULT_FREE_TIER_LIMIT,
  DEFAULT_MIN_APPROVED_TEMPLATES_FOR_GO_LIVE,
  DEFAULT_MIN_PUBLISHED_QUESTIONS_FOR_GO_LIVE,
  DEFAULT_STUDY_TIER_LIMIT,
  MIN_SUBJECT_PRICE_VND,
} from "./subject.constants";
import type {
  CreateSubjectDto,
  ReorderSubjectsDto,
  SubjectBlueprintDto,
  UpdateSubjectDto,
} from "./dto/admin-subject.dto";

export interface SubjectGoLiveStatus {
  publishedQuestionCount: number;
  approvedTemplateCount: number;
  canActivate: boolean;
  requirements: {
    minPublishedQuestions: number;
    minApprovedTemplates: number;
  };
}

export interface AdminSubjectView {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  code: string;
  name: string;
  description: string | null;
  visibility: SubjectVisibility;
  displayOrder: number;
  topicTags: string[];
  monthlyAmountVnd: number | null;
  freeTierLimit: number | null;
  studyTierLimit: number | null;
  goLive: SubjectGoLiveStatus;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class SubjectsService {
  private readonly logger = new Logger(SubjectsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly contentCompliance: ContentComplianceService,
  ) {}

  async listActiveCatalog(): Promise<SubjectCatalogItem[]> {
    const subjects = await this.prisma.subject.findMany({
      where: { visibility: "active", course: { visibility: "active" } },
      include: { pricing: true, course: true },
      orderBy: [{ course: { displayOrder: "asc" } }, { displayOrder: "asc" }, { name: "asc" }],
    });

    const missingPricing = subjects.filter((subject) => subject.pricing === null);
    for (const subject of missingPricing) {
      this.logger.warn(
        `Active subject "${subject.code}" (${subject.id}) has no SubjectPricing row — excluded from candidate catalog`,
      );
    }

    return subjects
      .filter((subject) => subject.pricing !== null)
      .filter((subject) =>
        scanProhibitedClaims(subject.name, subject.description).ok,
      )
      .map((subject) => ({
        id: subject.id,
        courseId: subject.courseId,
        courseCode: subject.course.code,
        courseName: subject.course.name,
        code: subject.code,
        name: subject.name,
        description: subject.description,
        monthlyPriceVnd: subject.pricing!.monthlyAmountVnd,
        freeTierLimit: subject.pricing!.freeTierLimit,
      }));
  }

  async listAdminCatalog(): Promise<AdminSubjectView[]> {
    const subjects = await this.prisma.subject.findMany({
      include: { pricing: true, course: true },
      orderBy: [{ course: { displayOrder: "asc" } }, { displayOrder: "asc" }, { name: "asc" }],
    });

    const goLiveBySubject = await this.buildGoLiveStatusMap(subjects.map((s) => s.id));

    return subjects.map((subject) => ({
      id: subject.id,
      courseId: subject.courseId,
      courseCode: subject.course.code,
      courseName: subject.course.name,
      code: subject.code,
      name: subject.name,
      description: subject.description,
      visibility: subject.visibility,
      displayOrder: subject.displayOrder,
      topicTags: subject.topicTags,
      monthlyAmountVnd: subject.pricing?.monthlyAmountVnd ?? null,
      freeTierLimit: subject.pricing?.freeTierLimit ?? null,
      studyTierLimit: subject.pricing?.studyTierLimit ?? null,
      goLive: goLiveBySubject.get(subject.id)!,
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString(),
    }));
  }

  async createSubject(dto: CreateSubjectDto) {
    const studyTierLimit = dto.studyTierLimit ?? DEFAULT_STUDY_TIER_LIMIT;
    this.assertValidPricing(dto.monthlyAmountVnd, dto.freeTierLimit, studyTierLimit);
    await this.assertCourseExists(dto.courseId);
    this.contentCompliance.assertCompliant(dto.name, dto.description);

    try {
      return await this.prisma.subject.create({
        data: {
          courseId: dto.courseId,
          code: dto.code,
          name: dto.name,
          description: dto.description,
          displayOrder: dto.displayOrder ?? 0,
          visibility: "archived",
          topicTags: dto.topicTags ?? [],
          minPublishedQuestionsForGoLive:
            dto.minPublishedQuestionsForGoLive ?? DEFAULT_MIN_PUBLISHED_QUESTIONS_FOR_GO_LIVE,
          minApprovedTemplatesForGoLive:
            dto.minApprovedTemplatesForGoLive ?? DEFAULT_MIN_APPROVED_TEMPLATES_FOR_GO_LIVE,
          pricing: {
            create: {
              monthlyAmountVnd: dto.monthlyAmountVnd,
              freeTierLimit: dto.freeTierLimit,
              studyTierLimit,
            },
          },
        },
        include: { pricing: true, course: true },
      });
    } catch (error) {
      this.rethrowUniqueCodeConflict(error);
      throw error;
    }
  }

  async updateSubject(id: string, dto: UpdateSubjectDto) {
    const existing = await this.prisma.subject.findUnique({
      where: { id },
      include: { pricing: true },
    });

    if (!existing) {
      throw new NotFoundException({
        code: "SUBJECT_NOT_FOUND",
        message: "Không tìm thấy môn học.",
      });
    }

    if (dto.courseId !== undefined) {
      const course = await this.assertCourseExists(dto.courseId);
      if (existing.visibility === "active" && course.visibility === "archived") {
        throw new BadRequestException({
          code: "COURSE_ARCHIVED",
          message: "Không thể chuyển môn đang hoạt động sang Course đã lưu trữ.",
        });
      }
    }

    if (
      dto.monthlyAmountVnd !== undefined ||
      dto.freeTierLimit !== undefined ||
      dto.studyTierLimit !== undefined
    ) {
      this.assertValidPricing(
        dto.monthlyAmountVnd ?? existing.pricing?.monthlyAmountVnd ?? MIN_SUBJECT_PRICE_VND,
        dto.freeTierLimit ?? existing.pricing?.freeTierLimit ?? DEFAULT_FREE_TIER_LIMIT,
        dto.studyTierLimit ?? existing.pricing?.studyTierLimit ?? DEFAULT_STUDY_TIER_LIMIT,
      );
    }

    const nextCourseId = dto.courseId ?? existing.courseId;
    const isActivating =
      dto.visibility === "active" && existing.visibility !== "active";
    if (isActivating) {
      await this.assertCourseActive(nextCourseId);
      await this.assertGoLiveGateWithThresholds(
        id,
        dto.minPublishedQuestionsForGoLive ?? existing.minPublishedQuestionsForGoLive,
        dto.minApprovedTemplatesForGoLive ?? existing.minApprovedTemplatesForGoLive,
      );
    }

    const nextName = dto.name ?? existing.name;
    const nextDescription = dto.description !== undefined ? dto.description : existing.description;
    this.contentCompliance.assertCompliant(nextName, nextDescription);

    try {
      return await this.prisma.subject.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.courseId !== undefined && { courseId: dto.courseId }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
          ...(dto.visibility !== undefined && { visibility: dto.visibility }),
          ...(dto.topicTags !== undefined && { topicTags: dto.topicTags }),
          ...(dto.minPublishedQuestionsForGoLive !== undefined && {
            minPublishedQuestionsForGoLive: dto.minPublishedQuestionsForGoLive,
          }),
          ...(dto.minApprovedTemplatesForGoLive !== undefined && {
            minApprovedTemplatesForGoLive: dto.minApprovedTemplatesForGoLive,
          }),
          ...(dto.monthlyAmountVnd !== undefined ||
          dto.freeTierLimit !== undefined ||
          dto.studyTierLimit !== undefined
            ? {
                pricing: {
                  upsert: {
                    create: {
                      monthlyAmountVnd: dto.monthlyAmountVnd ?? MIN_SUBJECT_PRICE_VND,
                      freeTierLimit: dto.freeTierLimit ?? DEFAULT_FREE_TIER_LIMIT,
                      studyTierLimit: dto.studyTierLimit ?? DEFAULT_STUDY_TIER_LIMIT,
                    },
                    update: {
                      ...(dto.monthlyAmountVnd !== undefined && {
                        monthlyAmountVnd: dto.monthlyAmountVnd,
                      }),
                      ...(dto.freeTierLimit !== undefined && { freeTierLimit: dto.freeTierLimit }),
                      ...(dto.studyTierLimit !== undefined && {
                        studyTierLimit: dto.studyTierLimit,
                      }),
                    },
                  },
                },
              }
            : {}),
        },
        include: { pricing: true, course: true },
      });
    } catch (error) {
      this.rethrowUniqueCodeConflict(error);
      throw error;
    }
  }

  async archiveSubject(id: string) {
    const existing = await this.prisma.subject.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        code: "SUBJECT_NOT_FOUND",
        message: "Không tìm thấy môn học.",
      });
    }

    return this.prisma.subject.update({
      where: { id },
      data: { visibility: "archived" },
      include: { pricing: true, course: true },
    });
  }

  async activateSubject(id: string) {
    const existing = await this.prisma.subject.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        code: "SUBJECT_NOT_FOUND",
        message: "Không tìm thấy môn học.",
      });
    }

    await this.assertCourseActive(existing.courseId);
    await this.assertGoLiveGate(id);
    return this.prisma.subject.update({
      where: { id },
      data: { visibility: "active" },
      include: { pricing: true, course: true },
    });
  }

  async reorderSubjects(dto: ReorderSubjectsDto) {
    const allSubjects = await this.prisma.subject.findMany({ select: { id: true } });
    const subjects = await this.prisma.subject.findMany({
      where: { id: { in: dto.orderedIds } },
      select: { id: true },
    });

    if (subjects.length !== dto.orderedIds.length) {
      throw new BadRequestException({
        code: "INVALID_REORDER",
        message: "Danh sách môn học không hợp lệ.",
      });
    }

    if (dto.orderedIds.length !== allSubjects.length) {
      throw new BadRequestException({
        code: "INCOMPLETE_SUBJECT_REORDER",
        message: "Phải gửi đầy đủ danh sách môn học theo thứ tự mới.",
        details: { expectedCount: allSubjects.length, receivedCount: dto.orderedIds.length },
      });
    }

    await this.prisma.$transaction(
      dto.orderedIds.map((subjectId, index) =>
        this.prisma.subject.update({
          where: { id: subjectId },
          data: { displayOrder: index },
        }),
      ),
    );

    return { orderedIds: dto.orderedIds };
  }

  async updateBlueprint(id: string, dto: SubjectBlueprintDto) {
    const existing = await this.prisma.subject.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        code: "SUBJECT_NOT_FOUND",
        message: "Không tìm thấy môn học.",
      });
    }

    return this.prisma.subject.update({
      where: { id },
      data: { topicTags: dto.topicTags },
      include: { pricing: true, course: true },
    });
  }

  async getGoLiveStatus(subjectId: string): Promise<SubjectGoLiveStatus> {
    const existing = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!existing) {
      throw new NotFoundException({
        code: "SUBJECT_NOT_FOUND",
        message: "Không tìm thấy môn học.",
      });
    }

    const map = await this.buildGoLiveStatusMap([subjectId]);
    return map.get(subjectId)!;
  }

  private assertValidPricing(
    monthlyAmountVnd: number,
    freeTierLimit: number,
    studyTierLimit: number,
  ) {
    if (monthlyAmountVnd < MIN_SUBJECT_PRICE_VND) {
      throw new BadRequestException({
        code: "PRICE_BELOW_MINIMUM",
        message: `Giá tối thiểu là ${MIN_SUBJECT_PRICE_VND.toLocaleString("vi-VN")} VND.`,
        details: { minimumVnd: MIN_SUBJECT_PRICE_VND },
      });
    }
    if (freeTierLimit < 1) {
      throw new BadRequestException({
        code: "INVALID_FREE_TIER_LIMIT",
        message: "Giới hạn Free Tier phải lớn hơn 0.",
      });
    }
    if (studyTierLimit < 1) {
      throw new BadRequestException({
        code: "INVALID_STUDY_TIER_LIMIT",
        message: "Giới hạn Study Tier phải lớn hơn 0.",
      });
    }
  }

  private async assertCourseExists(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, visibility: true },
    });
    if (!course) {
      throw new BadRequestException({
        code: "COURSE_NOT_FOUND",
        message: "Khóa học không hợp lệ.",
      });
    }
    return course;
  }

  private async assertCourseActive(courseId: string) {
    const course = await this.assertCourseExists(courseId);
    if (course.visibility !== "active") {
      throw new BadRequestException({
        code: "COURSE_NOT_ACTIVE",
        message: "Môn học chỉ có thể kích hoạt khi Course cha đang hoạt động.",
      });
    }
  }

  private rethrowUniqueCodeConflict(error: unknown): void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ConflictException({
        code: "SUBJECT_CODE_EXISTS",
        message: "Mã môn học đã tồn tại.",
      });
    }
  }

  private async assertGoLiveGate(subjectId: string) {
    const existing = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!existing) {
      throw new NotFoundException({
        code: "SUBJECT_NOT_FOUND",
        message: "Không tìm thấy môn học.",
      });
    }
    await this.assertGoLiveGateWithThresholds(
      subjectId,
      existing.minPublishedQuestionsForGoLive,
      existing.minApprovedTemplatesForGoLive,
    );
  }

  private async assertGoLiveGateWithThresholds(
    subjectId: string,
    minPublishedQuestions: number,
    minApprovedTemplates: number,
  ) {
    const map = await this.buildGoLiveStatusMap([subjectId]);
    const status = map.get(subjectId);
    if (!status) {
      throw new NotFoundException({
        code: "SUBJECT_NOT_FOUND",
        message: "Không tìm thấy môn học.",
      });
    }
    const canActivate = this.evaluateGoLiveGate(
      status.publishedQuestionCount,
      status.approvedTemplateCount,
      minPublishedQuestions,
      minApprovedTemplates,
    );
    if (!canActivate) {
      const requirements = { minPublishedQuestions, minApprovedTemplates };
      const parts: string[] = [];
      if (minPublishedQuestions > 0) {
        parts.push(`ít nhất ${minPublishedQuestions} câu hỏi Published`);
      }
      if (minApprovedTemplates > 0) {
        parts.push(
          `${minApprovedTemplates} Mock Exam Template đã duyệt`,
        );
      }
      const requirementText =
        parts.length > 0 ? parts.join(" và ") : "đủ điều kiện go-live";
      throw new BadRequestException({
        code: "SUBJECT_GO_LIVE_BLOCKED",
        message: `Môn học chưa đủ điều kiện kích hoạt. Cần ${requirementText}.`,
        details: {
          ...status,
          requirements,
          canActivate: false,
        },
      });
    }
  }

  private evaluateGoLiveGate(
    publishedQuestionCount: number,
    approvedTemplateCount: number,
    minPublishedQuestions: number,
    minApprovedTemplates: number,
  ): boolean {
    const questionsMet =
      minPublishedQuestions === 0 || publishedQuestionCount >= minPublishedQuestions;
    const templatesMet =
      minApprovedTemplates === 0 || approvedTemplateCount >= minApprovedTemplates;
    return questionsMet && templatesMet;
  }

  private async buildGoLiveStatusMap(
    subjectIds: string[],
  ): Promise<Map<string, SubjectGoLiveStatus>> {
    if (subjectIds.length === 0) return new Map();

    const subjects = await this.prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: {
        id: true,
        minPublishedQuestionsForGoLive: true,
        minApprovedTemplatesForGoLive: true,
      },
    });
    const minsBySubject = new Map(
      subjects.map((subject) => [
        subject.id,
        {
          minPublishedQuestions: subject.minPublishedQuestionsForGoLive,
          minApprovedTemplates: subject.minApprovedTemplatesForGoLive,
        },
      ]),
    );

    const publishedCounts = await this.prisma.question.groupBy({
      by: ["subjectId"],
      where: { subjectId: { in: subjectIds }, status: "published" },
      _count: { _all: true },
    });
    const publishedBySubject = new Map(
      publishedCounts.map((row) => [row.subjectId, row._count._all]),
    );

    const approvedCounts = await this.prisma.mockExamTemplate.groupBy({
      by: ["subjectId"],
      where: { subjectId: { in: subjectIds }, status: "approved" },
      _count: { _all: true },
    });
    const approvedBySubject = new Map(
      approvedCounts.map((row) => [row.subjectId, row._count._all]),
    );

    const result = new Map<string, SubjectGoLiveStatus>();
    for (const subjectId of subjectIds) {
      const publishedQuestionCount = publishedBySubject.get(subjectId) ?? 0;
      const approvedTemplateCount = approvedBySubject.get(subjectId) ?? 0;
      const requirements = minsBySubject.get(subjectId) ?? {
        minPublishedQuestions: DEFAULT_MIN_PUBLISHED_QUESTIONS_FOR_GO_LIVE,
        minApprovedTemplates: DEFAULT_MIN_APPROVED_TEMPLATES_FOR_GO_LIVE,
      };
      result.set(subjectId, {
        publishedQuestionCount,
        approvedTemplateCount,
        canActivate: this.evaluateGoLiveGate(
          publishedQuestionCount,
          approvedTemplateCount,
          requirements.minPublishedQuestions,
          requirements.minApprovedTemplates,
        ),
        requirements,
      });
    }
    return result;
  }
}
