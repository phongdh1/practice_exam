import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { MockExamSection, Prisma, Question, QuestionDifficulty } from "@prisma/client";
import type { MockExamCandidateTemplateListItem } from "@practice-exam/types";
import { getIctPeriodKey } from "@practice-exam/utils";
import { PrismaService } from "../prisma/prisma.service";
import { DEFAULT_MONTHLY_ATTEMPT_LIMIT } from "./mock-exam.constants";
import type { MockExamAttemptQuestionPlan, MockExamAttemptSectionPlan } from "./mock-exam-attempt.types";
import type {
  CreateMockExamTemplateDto,
  DifficultyRulesDto,
  MockExamSectionDto,
  UpdateMockExamTemplateDto,
} from "./dto/mock-exam.dto";

export interface MockExamSectionView {
  id: string;
  subjectId: string;
  sectionOrder: number;
  questionCount: number;
  timeLimitMinutes: number;
  selectionMode: "fixed" | "randomized";
  weightPercent: number;
  fixedQuestionIds: string[] | null;
  difficultyRules: DifficultyRulesDto | null;
  topicTags: string[];
}

export interface MockExamTemplateView {
  id: string;
  subjectId: string;
  name: string;
  description: string | null;
  status: "draft" | "approved" | "archived";
  totalDurationMinutes: number;
  passingScorePercent: number;
  monthlyAttemptLimit: number;
  sections: MockExamSectionView[];
  createdAt: string;
  updatedAt: string;
}

export interface MockExamPreviewSection {
  sectionOrder: number;
  subjectId: string;
  questionCount: number;
  questions: Array<{
    id: string;
    stem: string;
    difficulty: QuestionDifficulty;
    tags: string[];
  }>;
}

export interface MockExamPreview {
  templateId: string;
  templateName: string;
  totalDurationMinutes: number;
  passingScorePercent: number;
  sections: MockExamPreviewSection[];
}

export interface MockExamAttemptStatus {
  templateId: string;
  periodKey: string;
  limit: number;
  used: number;
  remaining: number;
}

@Injectable()
export class MockExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async listBySubject(subjectId: string): Promise<MockExamCandidateTemplateListItem[]> {
    const templates = await this.prisma.mockExamTemplate.findMany({
      where: { subjectId, status: "approved" },
      include: { sections: { orderBy: { sectionOrder: "asc" } } },
      orderBy: { name: "asc" },
    });
    return templates.map((template) => this.toCandidateTemplateView(template));
  }

  async findApprovedForCandidate(id: string): Promise<MockExamCandidateTemplateListItem> {
    const template = await this.prisma.mockExamTemplate.findUnique({
      where: { id },
      include: { sections: { orderBy: { sectionOrder: "asc" } } },
    });
    if (!template) {
      throw new NotFoundException({
        code: "MOCK_EXAM_TEMPLATE_NOT_FOUND",
        message: "Không tìm thấy Mock Exam Template.",
      });
    }
    if (template.status !== "approved") {
      throw new BadRequestException({
        code: "MOCK_EXAM_NOT_AVAILABLE",
        message: "Đề thi thử chưa sẵn sàng.",
      });
    }
    return this.toCandidateTemplateView(template);
  }

  async buildAttemptQuestionPlan(templateId: string): Promise<MockExamAttemptQuestionPlan> {
    const template = await this.prisma.mockExamTemplate.findUnique({
      where: { id: templateId },
      include: { sections: { orderBy: { sectionOrder: "asc" } } },
    });
    if (!template) {
      throw new NotFoundException({
        code: "MOCK_EXAM_TEMPLATE_NOT_FOUND",
        message: "Không tìm thấy Mock Exam Template.",
      });
    }
    if (template.status !== "approved") {
      throw new BadRequestException({
        code: "MOCK_EXAM_NOT_AVAILABLE",
        message: "Đề thi thử chưa sẵn sàng.",
      });
    }

    const sections: MockExamAttemptSectionPlan[] = [];
    for (const section of template.sections) {
      const questions = await this.selectQuestionsForSection(section);
      sections.push({
        sectionOrder: section.sectionOrder,
        subjectId: section.subjectId,
        questionIds: questions.map((q) => q.id),
        timeLimitMinutes: section.timeLimitMinutes,
        weightPercent: section.weightPercent,
      });
    }

    return { sections };
  }

  async listAdmin(subjectId?: string): Promise<MockExamTemplateView[]> {
    const templates = await this.prisma.mockExamTemplate.findMany({
      where: {
        ...(subjectId ? { subjectId } : {}),
        status: { not: "archived" },
      },
      include: { sections: { orderBy: { sectionOrder: "asc" } } },
      orderBy: [{ subjectId: "asc" }, { name: "asc" }],
    });
    return templates.map((template) => this.toTemplateView(template));
  }

  async findById(id: string): Promise<MockExamTemplateView> {
    const template = await this.prisma.mockExamTemplate.findUnique({
      where: { id },
      include: { sections: { orderBy: { sectionOrder: "asc" } } },
    });
    if (!template) {
      throw new NotFoundException({
        code: "MOCK_EXAM_TEMPLATE_NOT_FOUND",
        message: "Không tìm thấy Mock Exam Template.",
      });
    }
    return this.toTemplateView(template);
  }

  async create(dto: CreateMockExamTemplateDto): Promise<MockExamTemplateView> {
    await this.assertSubjectExists(dto.subjectId);
    this.validateSections(dto.sections);

    const template = await this.prisma.mockExamTemplate.create({
      data: {
        subjectId: dto.subjectId,
        name: dto.name,
        description: dto.description,
        totalDurationMinutes: dto.totalDurationMinutes,
        passingScorePercent: dto.passingScorePercent,
        monthlyAttemptLimit: dto.monthlyAttemptLimit ?? DEFAULT_MONTHLY_ATTEMPT_LIMIT,
        sections: {
          create: dto.sections.map((section) => this.sectionCreateData(section)),
        },
      },
      include: { sections: { orderBy: { sectionOrder: "asc" } } },
    });

    return this.toTemplateView(template);
  }

  async update(id: string, dto: UpdateMockExamTemplateDto): Promise<MockExamTemplateView> {
    const existing = await this.prisma.mockExamTemplate.findUnique({
      where: { id },
      include: { sections: true },
    });
    if (!existing) {
      throw new NotFoundException({
        code: "MOCK_EXAM_TEMPLATE_NOT_FOUND",
        message: "Không tìm thấy Mock Exam Template.",
      });
    }

    if (existing.status === "approved") {
      throw new BadRequestException({
        code: "MOCK_EXAM_TEMPLATE_APPROVED",
        message: "Không thể chỉnh sửa đề thi đã duyệt. Vui lòng tạo bản nháp mới.",
      });
    }

    if (dto.sections) {
      this.validateSections(dto.sections);
    }

    const template = await this.prisma.$transaction(async (tx) => {
      if (dto.sections) {
        await tx.mockExamSection.deleteMany({ where: { templateId: id } });
      }

      return tx.mockExamTemplate.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.totalDurationMinutes !== undefined && {
            totalDurationMinutes: dto.totalDurationMinutes,
          }),
          ...(dto.passingScorePercent !== undefined && {
            passingScorePercent: dto.passingScorePercent,
          }),
          ...(dto.monthlyAttemptLimit !== undefined && {
            monthlyAttemptLimit: dto.monthlyAttemptLimit,
          }),
          ...(dto.sections
            ? {
                sections: {
                  create: dto.sections.map((section) => this.sectionCreateData(section)),
                },
              }
            : {}),
        },
        include: { sections: { orderBy: { sectionOrder: "asc" } } },
      });
    });

    return this.toTemplateView(template);
  }

  async approve(id: string): Promise<MockExamTemplateView> {
    const template = await this.prisma.mockExamTemplate.findUnique({
      where: { id },
      include: { sections: { orderBy: { sectionOrder: "asc" } } },
    });
    if (!template) {
      throw new NotFoundException({
        code: "MOCK_EXAM_TEMPLATE_NOT_FOUND",
        message: "Không tìm thấy Mock Exam Template.",
      });
    }

    if (template.sections.length === 0) {
      throw new BadRequestException({
        code: "MOCK_EXAM_NO_SECTIONS",
        message: "Template phải có ít nhất một phần thi trước khi duyệt.",
      });
    }

    this.validateSections(template.sections.map((section) => this.toSectionDto(section)));
    await this.validatePoolForTemplate(template.id);

    const updated = await this.prisma.mockExamTemplate.update({
      where: { id },
      data: { status: "approved" },
      include: { sections: { orderBy: { sectionOrder: "asc" } } },
    });

    return this.toTemplateView(updated);
  }

  async archive(id: string): Promise<MockExamTemplateView> {
    const existing = await this.prisma.mockExamTemplate.findUnique({
      where: { id },
      include: { sections: { orderBy: { sectionOrder: "asc" } } },
    });
    if (!existing) {
      throw new NotFoundException({
        code: "MOCK_EXAM_TEMPLATE_NOT_FOUND",
        message: "Không tìm thấy Mock Exam Template.",
      });
    }

    const updated = await this.prisma.mockExamTemplate.update({
      where: { id },
      data: { status: "archived" },
      include: { sections: { orderBy: { sectionOrder: "asc" } } },
    });
    return this.toTemplateView(updated);
  }

  async generatePreview(templateId: string): Promise<MockExamPreview> {
    const template = await this.prisma.mockExamTemplate.findUnique({
      where: { id: templateId },
      include: { sections: { orderBy: { sectionOrder: "asc" } } },
    });
    if (!template) {
      throw new NotFoundException({
        code: "MOCK_EXAM_TEMPLATE_NOT_FOUND",
        message: "Không tìm thấy Mock Exam Template.",
      });
    }

    const sections: MockExamPreviewSection[] = [];
    for (const section of template.sections) {
      const questions = await this.selectQuestionsForSection(section);
      sections.push({
        sectionOrder: section.sectionOrder,
        subjectId: section.subjectId,
        questionCount: section.questionCount,
        questions: questions.map((q) => ({
          id: q.id,
          stem: q.stem,
          difficulty: q.difficulty,
          tags: q.tags,
        })),
      });
    }

    return {
      templateId: template.id,
      templateName: template.name,
      totalDurationMinutes: template.totalDurationMinutes,
      passingScorePercent: template.passingScorePercent,
      sections,
    };
  }

  async getAttemptStatus(userId: string, templateId: string): Promise<MockExamAttemptStatus> {
    const template = await this.prisma.mockExamTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) {
      throw new NotFoundException({
        code: "MOCK_EXAM_TEMPLATE_NOT_FOUND",
        message: "Không tìm thấy Mock Exam Template.",
      });
    }
    if (template.status !== "approved") {
      throw new BadRequestException({
        code: "MOCK_EXAM_NOT_AVAILABLE",
        message: "Đề thi thử chưa sẵn sàng.",
      });
    }

    const periodKey = getIctPeriodKey();
    const used = await this.prisma.mockExamAttempt.count({
      where: {
        userId,
        templateId,
        periodKey,
        status: { in: ["in_progress", "completed"] },
      },
    });

    const limit = template.monthlyAttemptLimit;
    return {
      templateId,
      periodKey,
      limit,
      used,
      remaining: Math.max(0, limit - used),
    };
  }

  async assertCanStartAttempt(userId: string, templateId: string): Promise<void> {
    const status = await this.getAttemptStatus(userId, templateId);
    if (status.remaining <= 0) {
      throw new BadRequestException({
        code: "MOCK_EXAM_ATTEMPTS_EXCEEDED",
        message: "Bạn đã hết lượt thi thử trong tháng này.",
        details: status,
      });
    }
  }

  private validateSections(sections: MockExamSectionDto[]) {
    if (sections.length === 0) {
      throw new BadRequestException({
        code: "MOCK_EXAM_NO_SECTIONS",
        message: "Template phải có ít nhất một phần thi.",
      });
    }

    const weightTotal = sections.reduce((sum, section) => sum + section.weightPercent, 0);
    if (weightTotal !== 100) {
      throw new BadRequestException({
        code: "SECTION_WEIGHTS_INVALID",
        message: "Tổng trọng số phần thi phải bằng 100%.",
        details: { weightTotal },
      });
    }

    for (const section of sections) {
      if (section.selectionMode === "fixed") {
        if (!section.fixedQuestionIds?.length) {
          throw new BadRequestException({
            code: "FIXED_SECTION_MISSING_QUESTIONS",
            message: "Phần thi cố định phải chỉ định danh sách câu hỏi.",
            details: { sectionOrder: section.sectionOrder },
          });
        }
        if (section.fixedQuestionIds.length !== section.questionCount) {
          throw new BadRequestException({
            code: "FIXED_SECTION_COUNT_MISMATCH",
            message: "Số câu hỏi cố định phải khớp với questionCount.",
            details: { sectionOrder: section.sectionOrder },
          });
        }
      }

      if (section.difficultyRules) {
        const total =
          (section.difficultyRules.easy ?? 0) +
          (section.difficultyRules.medium ?? 0) +
          (section.difficultyRules.hard ?? 0);
        if (total > 0 && total !== 100) {
          throw new BadRequestException({
            code: "DIFFICULTY_RULES_INVALID",
            message: "Tổng phân bổ độ khó phải bằng 100%.",
            details: { sectionOrder: section.sectionOrder, total },
          });
        }
      }
    }
  }

  private async validatePoolForTemplate(templateId: string) {
    const template = await this.prisma.mockExamTemplate.findUnique({
      where: { id: templateId },
      include: { sections: { orderBy: { sectionOrder: "asc" } } },
    });
    if (!template) return;

    for (const section of template.sections) {
      const available = await this.countAvailableQuestions(section);
      if (available < section.questionCount) {
        throw new BadRequestException({
          code: "INSUFFICIENT_QUESTION_POOL",
          message: `Không đủ câu hỏi Published cho phần thi ${section.sectionOrder + 1}. Cần ${section.questionCount}, có ${available}.`,
          details: {
            sectionOrder: section.sectionOrder,
            required: section.questionCount,
            available,
            subjectId: section.subjectId,
          },
        });
      }
    }
  }

  private async selectQuestionsForSection(section: MockExamSection): Promise<Question[]> {
    if (section.selectionMode === "fixed") {
      const ids = (section.fixedQuestionIds as string[] | null) ?? [];
      const questions = await this.prisma.question.findMany({
        where: {
          id: { in: ids },
          subjectId: section.subjectId,
          status: "published",
        },
      });
      const questionMap = new Map(questions.map((q) => [q.id, q]));
      const ordered = ids
        .map((id) => questionMap.get(id))
        .filter((q): q is Question => q !== undefined);
      if (ordered.length !== section.questionCount) {
        throw new BadRequestException({
          code: "INSUFFICIENT_QUESTION_POOL",
          message: `Không đủ câu hỏi Published cho phần thi cố định ${section.sectionOrder + 1}.`,
          details: {
            sectionOrder: section.sectionOrder,
            required: section.questionCount,
            available: ordered.length,
          },
        });
      }
      return ordered;
    }

    const pool = await this.findPublishedPool(section);
    if (pool.length < section.questionCount) {
      throw new BadRequestException({
        code: "INSUFFICIENT_QUESTION_POOL",
        message: `Không đủ câu hỏi Published cho phần thi ${section.sectionOrder + 1}. Cần ${section.questionCount}, có ${pool.length}.`,
        details: {
          sectionOrder: section.sectionOrder,
          required: section.questionCount,
          available: pool.length,
          subjectId: section.subjectId,
        },
      });
    }

    const rules = section.difficultyRules as DifficultyRulesDto | null;
    if (rules && this.hasDifficultyRules(rules)) {
      return this.selectByDifficulty(pool, section.questionCount, rules);
    }

    return this.shuffle(pool).slice(0, section.questionCount);
  }

  private async countAvailableQuestions(section: MockExamSection): Promise<number> {
    if (section.selectionMode === "fixed") {
      const ids = (section.fixedQuestionIds as string[] | null) ?? [];
      return this.prisma.question.count({
        where: {
          id: { in: ids },
          subjectId: section.subjectId,
          status: "published",
        },
      });
    }
    const pool = await this.findPublishedPool(section);
    return pool.length;
  }

  private async findPublishedPool(section: MockExamSection): Promise<Question[]> {
    const topicTags = section.topicTags.length > 0 ? section.topicTags : undefined;
    return this.prisma.question.findMany({
      where: {
        subjectId: section.subjectId,
        status: "published",
        ...(topicTags ? { tags: { hasSome: topicTags } } : {}),
      },
    });
  }

  private selectByDifficulty(
    pool: Question[],
    count: number,
    rules: DifficultyRulesDto,
  ): Question[] {
    const targets = {
      easy: Math.round((count * (rules.easy ?? 0)) / 100),
      medium: Math.round((count * (rules.medium ?? 0)) / 100),
      hard: count - Math.round((count * (rules.easy ?? 0)) / 100) - Math.round((count * (rules.medium ?? 0)) / 100),
    };

    const byDifficulty = {
      easy: this.shuffle(pool.filter((q) => q.difficulty === "easy")),
      medium: this.shuffle(pool.filter((q) => q.difficulty === "medium")),
      hard: this.shuffle(pool.filter((q) => q.difficulty === "hard")),
    };

    const selected: Question[] = [];
    for (const difficulty of ["easy", "medium", "hard"] as const) {
      const needed = targets[difficulty];
      const available = byDifficulty[difficulty];
      if (available.length < needed) {
        throw new BadRequestException({
          code: "INSUFFICIENT_QUESTION_POOL",
          message: `Không đủ câu hỏi ${difficulty} trong pool.`,
          details: { difficulty, required: needed, available: available.length },
        });
      }
      selected.push(...available.slice(0, needed));
    }

    return this.shuffle(selected);
  }

  private hasDifficultyRules(rules: DifficultyRulesDto): boolean {
    return (rules.easy ?? 0) + (rules.medium ?? 0) + (rules.hard ?? 0) > 0;
  }

  private shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private sectionCreateData(
    section: MockExamSectionDto,
  ): Prisma.MockExamSectionUncheckedCreateWithoutTemplateInput {
    return {
      subjectId: section.subjectId,
      sectionOrder: section.sectionOrder,
      questionCount: section.questionCount,
      timeLimitMinutes: section.timeLimitMinutes,
      selectionMode: section.selectionMode,
      weightPercent: section.weightPercent,
      fixedQuestionIds: section.fixedQuestionIds
        ? (section.fixedQuestionIds as Prisma.InputJsonValue)
        : undefined,
      difficultyRules: section.difficultyRules
        ? (section.difficultyRules as Prisma.InputJsonValue)
        : undefined,
      topicTags: section.topicTags ?? [],
    };
  }

  private toSectionDto(section: MockExamSection): MockExamSectionDto {
    return {
      subjectId: section.subjectId,
      sectionOrder: section.sectionOrder,
      questionCount: section.questionCount,
      timeLimitMinutes: section.timeLimitMinutes,
      selectionMode: section.selectionMode,
      weightPercent: section.weightPercent,
      fixedQuestionIds: (section.fixedQuestionIds as string[] | null) ?? undefined,
      difficultyRules: (section.difficultyRules as DifficultyRulesDto | null) ?? undefined,
      topicTags: section.topicTags,
    };
  }

  private toCandidateTemplateView(
    template: {
      id: string;
      subjectId: string;
      name: string;
      description: string | null;
      totalDurationMinutes: number;
      passingScorePercent: number;
      monthlyAttemptLimit: number;
      createdAt: Date;
      updatedAt: Date;
      sections: MockExamSection[];
    },
  ): MockExamCandidateTemplateListItem {
    return {
      id: template.id,
      subjectId: template.subjectId,
      name: template.name,
      description: template.description,
      totalDurationMinutes: template.totalDurationMinutes,
      passingScorePercent: template.passingScorePercent,
      monthlyAttemptLimit: template.monthlyAttemptLimit,
      sections: template.sections.map((section) => ({
        id: section.id,
        subjectId: section.subjectId,
        sectionOrder: section.sectionOrder,
        questionCount: section.questionCount,
        timeLimitMinutes: section.timeLimitMinutes,
        selectionMode: section.selectionMode,
        weightPercent: section.weightPercent,
        topicTags: section.topicTags,
      })),
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }

  private toTemplateView(
    template: {
      id: string;
      subjectId: string;
      name: string;
      description: string | null;
      status: "draft" | "approved" | "archived";
      totalDurationMinutes: number;
      passingScorePercent: number;
      monthlyAttemptLimit: number;
      createdAt: Date;
      updatedAt: Date;
      sections: MockExamSection[];
    },
  ): MockExamTemplateView {
    return {
      id: template.id,
      subjectId: template.subjectId,
      name: template.name,
      description: template.description,
      status: template.status,
      totalDurationMinutes: template.totalDurationMinutes,
      passingScorePercent: template.passingScorePercent,
      monthlyAttemptLimit: template.monthlyAttemptLimit,
      sections: template.sections.map((section) => ({
        id: section.id,
        subjectId: section.subjectId,
        sectionOrder: section.sectionOrder,
        questionCount: section.questionCount,
        timeLimitMinutes: section.timeLimitMinutes,
        selectionMode: section.selectionMode,
        weightPercent: section.weightPercent,
        fixedQuestionIds: (section.fixedQuestionIds as string[] | null) ?? null,
        difficultyRules: (section.difficultyRules as DifficultyRulesDto | null) ?? null,
        topicTags: section.topicTags,
      })),
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
    };
  }

  private async assertSubjectExists(subjectId: string) {
    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      throw new NotFoundException({
        code: "SUBJECT_NOT_FOUND",
        message: "Không tìm thấy môn học.",
      });
    }
  }
}
