import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { EditorialQueueItem } from "@practice-exam/types";
import { PrismaService } from "../prisma/prisma.service";
import { toQuestionDetail } from "../questions/question.mapper";
import { QuestionsService } from "../questions/questions.service";

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly questionsService: QuestionsService,
  ) {}

  async listReviewQueue(filters: {
    subjectId?: string;
    authorId?: string;
    maxAgeDays?: number;
  }): Promise<EditorialQueueItem[]> {
    const where: {
      status: "in_review";
      subjectId?: string;
      authorId?: string;
      submittedAt?: { lte: Date };
    } = { status: "in_review" };

    if (filters.subjectId) where.subjectId = filters.subjectId;
    if (filters.authorId) where.authorId = filters.authorId;
    if (filters.maxAgeDays) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - filters.maxAgeDays);
      where.submittedAt = { lte: cutoff };
    }

    const items = await this.prisma.question.findMany({
      where,
      include: {
        subject: { select: { name: true } },
        author: { select: { displayName: true, username: true } },
        reviewer: { select: { displayName: true, username: true } },
      },
      orderBy: [{ submittedAt: "asc" }],
    });

    const now = Date.now();
    return items.map((q) => ({
      id: q.id,
      stem: q.stem,
      subjectId: q.subjectId,
      subjectName: q.subject.name,
      authorId: q.authorId,
      authorName: q.author.displayName ?? q.author.username,
      submittedAt: q.submittedAt?.toISOString() ?? q.createdAt.toISOString(),
      ageDays: q.submittedAt
        ? Math.floor((now - q.submittedAt.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      reviewerId: q.reviewerId,
      reviewerName: q.reviewer?.displayName ?? q.reviewer?.username ?? null,
    }));
  }

  async assignToSelf(questionId: string, reviewerId: string) {
    const question = await this.getInReviewQuestion(questionId);
    if (question.reviewerId && question.reviewerId !== reviewerId) {
      throw new BadRequestException({
        code: "ALREADY_ASSIGNED",
        message: "Câu hỏi đã được gán cho người duyệt khác.",
      });
    }

    await this.prisma.question.update({
      where: { id: questionId },
      data: { reviewerId, assignedAt: new Date() },
    });

    return this.questionsService.findById(questionId);
  }

  async approve(questionId: string, reviewerId: string, comment?: string) {
    const question = await this.getInReviewQuestion(questionId);

    const updated = await this.prisma.$transaction(async (tx) => {
      if (question.parentQuestionId) {
        await tx.question.update({
          where: { id: question.parentQuestionId },
          data: { status: "archived" },
        });
      }

      await tx.contentReview.create({
        data: {
          questionId,
          reviewerId,
          action: "approve",
          comment: comment?.trim() ?? null,
        },
      });

      return tx.question.update({
        where: { id: questionId },
        data: {
          status: "published",
          publishedAt: new Date(),
          reviewerId,
        },
        include: {
          subject: { select: { name: true } },
          author: { select: { displayName: true, username: true } },
        },
      });
    });

    return toQuestionDetail(updated);
  }

  async reject(questionId: string, reviewerId: string, comment: string) {
    if (!comment?.trim()) {
      throw new BadRequestException({
        code: "REJECTION_COMMENT_REQUIRED",
        message: "Phải nhập lý do từ chối.",
      });
    }

    await this.getInReviewQuestion(questionId);

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.contentReview.create({
        data: {
          questionId,
          reviewerId,
          action: "reject",
          comment: comment.trim(),
        },
      });

      return tx.question.update({
        where: { id: questionId },
        data: {
          status: "draft",
          reviewerId: null,
          assignedAt: null,
          submittedAt: null,
        },
        include: {
          subject: { select: { name: true } },
          author: { select: { displayName: true, username: true } },
        },
      });
    });

    return toQuestionDetail(updated);
  }

  async unpublish(questionId: string, actorId: string, reason: string) {
    if (!reason?.trim()) {
      throw new BadRequestException({
        code: "UNPUBLISH_REASON_REQUIRED",
        message: "Phải nhập lý do gỡ xuất bản.",
      });
    }

    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      throw new NotFoundException({
        code: "QUESTION_NOT_FOUND",
        message: "Không tìm thấy câu hỏi.",
      });
    }
    if (question.status !== "published") {
      throw new BadRequestException({
        code: "NOT_PUBLISHED",
        message: "Chỉ câu hỏi đã xuất bản mới có thể gỡ.",
      });
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.contentReview.create({
        data: {
          questionId,
          reviewerId: actorId,
          action: "unpublish",
          comment: reason.trim(),
        },
      });
      await tx.contentAuditLog.create({
        data: {
          questionId,
          actorId,
          action: "unpublish",
          reason: reason.trim(),
        },
      });
      return tx.question.update({
        where: { id: questionId },
        data: { status: "archived", publishedAt: null },
        include: {
          subject: { select: { name: true } },
          author: { select: { displayName: true, username: true } },
        },
      });
    });

    return toQuestionDetail(updated, null, true);
  }

  async updateSourceRef(questionId: string, sourceRef: string | null) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      throw new NotFoundException({
        code: "QUESTION_NOT_FOUND",
        message: "Không tìm thấy câu hỏi.",
      });
    }

    const updated = await this.prisma.question.update({
      where: { id: questionId },
      data: { sourceRef: sourceRef?.trim() ?? null },
      include: {
        subject: { select: { name: true } },
        author: { select: { displayName: true, username: true } },
      },
    });

    return toQuestionDetail(updated, null, true);
  }

  private async getInReviewQuestion(questionId: string) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      throw new NotFoundException({
        code: "QUESTION_NOT_FOUND",
        message: "Không tìm thấy câu hỏi.",
      });
    }
    if (question.status !== "in_review") {
      throw new BadRequestException({
        code: "NOT_IN_REVIEW",
        message: "Câu hỏi không ở trạng thái chờ duyệt.",
      });
    }
    return question;
  }
}
