import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma, Question } from "@prisma/client";
import type { QuestionSearchResult } from "@practice-exam/types";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateQuestionDto, SearchQuestionsDto, UpdateQuestionDto } from "./dto/question.dto";
import {
  buildQuestionSnapshot,
  normalizeStem,
  toQuestionDetail,
  toQuestionPreview,
  toQuestionSummary,
} from "./question.mapper";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(authorId: string, dto: CreateQuestionDto) {
    await this.assertSubjectExists(dto.subjectId);
    this.validateOptions(dto.options, dto.correctOptionKeys, dto.questionType);

    const question = await this.prisma.question.create({
      data: {
        subjectId: dto.subjectId,
        authorId,
        questionType: dto.questionType,
        difficulty: dto.difficulty,
        stem: dto.stem.trim(),
        explanation: dto.explanation?.trim() ?? null,
        options: dto.options as unknown as Prisma.InputJsonValue,
        correctOptionKeys: dto.correctOptionKeys as unknown as Prisma.InputJsonValue,
        tags: dto.tags ?? [],
        imageUrls: dto.imageUrls ?? [],
        sourceRef: dto.sourceRef?.trim() ?? null,
        status: "draft",
      },
      include: this.detailInclude,
    });

    const duplicateWarning = await this.findDuplicateStem(dto.subjectId, dto.stem, question.id);
    return toQuestionDetail(question, duplicateWarning);
  }

  async findById(id: string, includeSourceRef = true) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: this.detailInclude,
    });
    if (!question) {
      throw new NotFoundException({
        code: "QUESTION_NOT_FOUND",
        message: "Không tìm thấy câu hỏi.",
      });
    }
    const duplicateWarning =
      question.status === "draft"
        ? await this.findDuplicateStem(question.subjectId, question.stem, question.id)
        : null;
    return toQuestionDetail(question, duplicateWarning, includeSourceRef);
  }

  async update(id: string, authorId: string, dto: UpdateQuestionDto) {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        code: "QUESTION_NOT_FOUND",
        message: "Không tìm thấy câu hỏi.",
      });
    }

    if (existing.status === "published") {
      return this.createDraftVersionFromPublished(existing, authorId, dto);
    }

    if (existing.status === "archived") {
      throw new BadRequestException({
        code: "QUESTION_ARCHIVED",
        message: "Không thể chỉnh sửa câu hỏi đã lưu trữ.",
      });
    }

    if (existing.status === "in_review") {
      throw new BadRequestException({
        code: "QUESTION_IN_REVIEW",
        message: "Không thể chỉnh sửa câu hỏi đang chờ duyệt.",
      });
    }

    const nextOptions = dto.options ?? (existing.options as { key: string; text: string }[]);
    const nextCorrectKeys = dto.correctOptionKeys ?? (existing.correctOptionKeys as string[]);
    const nextType = dto.questionType ?? existing.questionType;
    this.validateOptions(nextOptions, nextCorrectKeys, nextType);

    const updated = await this.prisma.$transaction(async (tx) => {
      const nextVersion = existing.versionNumber + 1;
      await tx.questionVersion.create({
        data: {
          questionId: existing.id,
          versionNumber: existing.versionNumber,
          snapshot: buildQuestionSnapshot(existing),
          createdById: authorId,
        },
      });

      return tx.question.update({
        where: { id },
        data: {
          ...(dto.questionType !== undefined && { questionType: dto.questionType }),
          ...(dto.difficulty !== undefined && { difficulty: dto.difficulty }),
          ...(dto.stem !== undefined && { stem: dto.stem.trim() }),
          ...(dto.explanation !== undefined && { explanation: dto.explanation?.trim() ?? null }),
          ...(dto.options !== undefined && { options: dto.options as unknown as Prisma.InputJsonValue }),
          ...(dto.correctOptionKeys !== undefined && {
            correctOptionKeys: dto.correctOptionKeys as unknown as Prisma.InputJsonValue,
          }),
          ...(dto.tags !== undefined && { tags: dto.tags }),
          ...(dto.imageUrls !== undefined && { imageUrls: dto.imageUrls }),
          ...(dto.sourceRef !== undefined && { sourceRef: dto.sourceRef?.trim() ?? null }),
          versionNumber: nextVersion,
        },
        include: this.detailInclude,
      });
    });

    const duplicateWarning = await this.findDuplicateStem(updated.subjectId, updated.stem, updated.id);
    return toQuestionDetail(updated, duplicateWarning);
  }

  async submitForReview(id: string, authorId: string) {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) {
      throw new NotFoundException({
        code: "QUESTION_NOT_FOUND",
        message: "Không tìm thấy câu hỏi.",
      });
    }
    if (question.status !== "draft") {
      throw new BadRequestException({
        code: "INVALID_STATUS_TRANSITION",
        message: "Chỉ câu hỏi nháp mới có thể gửi duyệt.",
      });
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.contentReview.create({
        data: {
          questionId: id,
          reviewerId: authorId,
          action: "submit_for_review",
        },
      });
      return tx.question.update({
        where: { id },
        data: {
          status: "in_review",
          submittedAt: new Date(),
          reviewerId: null,
          assignedAt: null,
        },
        include: this.detailInclude,
      });
    });

    return toQuestionDetail(updated);
  }

  async search(query: SearchQuestionsDto): Promise<QuestionSearchResult> {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(query.pageSize) || DEFAULT_PAGE_SIZE));
    const where: Prisma.QuestionWhereInput = {};

    if (query.courseId) where.subject = { courseId: query.courseId };
    if (query.subjectId) where.subjectId = query.subjectId;
    if (query.status) where.status = query.status;
    if (query.difficulty) where.difficulty = query.difficulty;
    if (query.authorId) where.authorId = query.authorId;
    if (query.topic) where.tags = { has: query.topic };
    if (query.search?.trim()) {
      where.stem = { contains: query.search.trim(), mode: "insensitive" };
    }

    const [items, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        include: this.detailInclude,
        orderBy: [{ updatedAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.question.count({ where }),
    ]);

    return {
      items: items.map((q) => toQuestionSummary(q)),
      total,
      page,
      pageSize,
    };
  }

  async getStats() {
    const groups = await this.prisma.question.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    let published = 0;
    let inReview = 0;
    let draft = 0;
    let total = 0;

    for (const group of groups) {
      const count = group._count._all;
      total += count;
      if (group.status === "published") published = count;
      else if (group.status === "in_review") inReview = count;
      else if (group.status === "draft") draft = count;
    }

    return { total, published, inReview, draft };
  }

  async delete(id: string) {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) {
      throw new NotFoundException({
        code: "QUESTION_NOT_FOUND",
        message: "Không tìm thấy câu hỏi.",
      });
    }
    if (question.status === "published") {
      throw new BadRequestException({
        code: "QUESTION_PUBLISHED",
        message: "Không thể xóa câu hỏi đã xuất bản. Hãy gỡ xuất bản trước.",
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.question.deleteMany({ where: { parentQuestionId: id } });
      await tx.question.delete({ where: { id } });
    });

    return { id, deleted: true };
  }

  async preview(id: string) {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) {
      throw new NotFoundException({
        code: "QUESTION_NOT_FOUND",
        message: "Không tìm thấy câu hỏi.",
      });
    }
    return toQuestionPreview(question);
  }

  async listPublishedForSubject(subjectId: string, limit = 50) {
    return this.prisma.question.findMany({
      where: { subjectId, status: "published" },
      take: limit,
      orderBy: { publishedAt: "desc" },
    });
  }

  private async createDraftVersionFromPublished(
    existing: Question,
    authorId: string,
    dto: UpdateQuestionDto,
  ) {
    const nextOptions = dto.options ?? (existing.options as { key: string; text: string }[]);
    const nextCorrectKeys = dto.correctOptionKeys ?? (existing.correctOptionKeys as string[]);
    const nextType = dto.questionType ?? existing.questionType;
    this.validateOptions(nextOptions, nextCorrectKeys, nextType);

    const draft = await this.prisma.question.create({
      data: {
        subjectId: existing.subjectId,
        authorId,
        parentQuestionId: existing.id,
        questionType: nextType,
        difficulty: dto.difficulty ?? existing.difficulty,
        stem: (dto.stem ?? existing.stem).trim(),
        explanation: dto.explanation !== undefined ? dto.explanation?.trim() ?? null : existing.explanation,
        options: nextOptions as unknown as Prisma.InputJsonValue,
        correctOptionKeys: nextCorrectKeys as unknown as Prisma.InputJsonValue,
        tags: dto.tags ?? existing.tags,
        imageUrls: dto.imageUrls ?? existing.imageUrls,
        sourceRef: dto.sourceRef !== undefined ? dto.sourceRef?.trim() ?? null : existing.sourceRef,
        status: "draft",
        versionNumber: existing.versionNumber + 1,
      },
      include: this.detailInclude,
    });

    const duplicateWarning = await this.findDuplicateStem(draft.subjectId, draft.stem, draft.id);
    return toQuestionDetail(draft, duplicateWarning);
  }

  private async findDuplicateStem(subjectId: string, stem: string, excludeId: string) {
    const normalized = normalizeStem(stem);
    const candidates = await this.prisma.question.findMany({
      where: {
        subjectId,
        id: { not: excludeId },
        status: { not: "archived" },
      },
      select: { id: true, stem: true },
      take: 200,
    });

    const match = candidates.find((c) => normalizeStem(c.stem) === normalized);
    if (!match) return null;
    return { matchingQuestionId: match.id, stem: match.stem };
  }

  private validateOptions(
    options: { key: string; text: string }[],
    correctKeys: string[],
    questionType: string,
  ) {
    if (options.length < 2) {
      throw new BadRequestException({
        code: "INVALID_OPTIONS",
        message: "Câu hỏi phải có ít nhất 2 lựa chọn.",
      });
    }
    const optionKeys = new Set(options.map((o) => o.key));
    for (const key of correctKeys) {
      if (!optionKeys.has(key)) {
        throw new BadRequestException({
          code: "INVALID_CORRECT_KEY",
          message: `Đáp án đúng "${key}" không tồn tại trong các lựa chọn.`,
        });
      }
    }
    if (questionType === "single_choice" && correctKeys.length !== 1) {
      throw new BadRequestException({
        code: "INVALID_CORRECT_KEY",
        message: "Câu hỏi một lựa chọn phải có đúng 1 đáp án đúng.",
      });
    }
    if (questionType === "true_false" && options.length !== 2) {
      throw new BadRequestException({
        code: "INVALID_OPTIONS",
        message: "Câu hỏi đúng/sai phải có đúng 2 lựa chọn.",
      });
    }
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

  private readonly detailInclude = {
    subject: { select: { name: true } },
    author: { select: { displayName: true, username: true } },
    reviewer: { select: { displayName: true, username: true } },
  } as const;
}
