import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { QuestionFlagItem } from "@practice-exam/types";
import { PrismaService } from "../prisma/prisma.service";
import { ContentService } from "./content.service";

@Injectable()
export class QuestionFlagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contentService: ContentService,
  ) {}

  async createFlag(userId: string, questionId: string, comment?: string) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question || question.status !== "published") {
      throw new NotFoundException({
        code: "QUESTION_NOT_FOUND",
        message: "Không tìm thấy câu hỏi.",
      });
    }

    return this.prisma.questionFlag.create({
      data: {
        questionId,
        userId,
        comment: comment?.trim() ?? null,
        status: "open",
      },
    });
  }

  async listQueue(status?: string): Promise<QuestionFlagItem[]> {
    const where = status ? { status: status as "open" | "assigned" | "resolved" | "escalated" } : {};
    const flags = await this.prisma.questionFlag.findMany({
      where,
      include: {
        question: { select: { stem: true } },
        user: { select: { displayName: true } },
        assignee: { select: { displayName: true, username: true } },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return flags.map((f) => ({
      id: f.id,
      questionId: f.questionId,
      questionStem: f.question.stem,
      userId: f.userId,
      userDisplayName: f.user.displayName,
      comment: f.comment,
      status: f.status,
      assigneeId: f.assigneeId,
      assigneeName: f.assignee?.displayName ?? f.assignee?.username ?? null,
      createdAt: f.createdAt.toISOString(),
      resolvedAt: f.resolvedAt?.toISOString() ?? null,
    }));
  }

  async assign(flagId: string, assigneeId: string) {
    const flag = await this.getOpenFlag(flagId);
    return this.prisma.questionFlag.update({
      where: { id: flag.id },
      data: { status: "assigned", assigneeId },
    });
  }

  async resolve(flagId: string, resolverId: string, resolutionNote: string) {
    if (!resolutionNote?.trim()) {
      throw new BadRequestException({
        code: "RESOLUTION_NOTE_REQUIRED",
        message: "Phải nhập ghi chú xử lý.",
      });
    }

    const flag = await this.prisma.questionFlag.findUnique({ where: { id: flagId } });
    if (!flag || flag.status === "resolved") {
      throw new NotFoundException({
        code: "FLAG_NOT_FOUND",
        message: "Không tìm thấy báo cáo.",
      });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.contentAuditLog.create({
        data: {
          questionId: flag.questionId,
          actorId: resolverId,
          action: "flag_resolved",
          reason: resolutionNote.trim(),
          details: { flagId },
        },
      });
      return tx.questionFlag.update({
        where: { id: flagId },
        data: {
          status: "resolved",
          resolutionNote: resolutionNote.trim(),
          resolvedAt: new Date(),
          resolvedById: resolverId,
        },
      });
    });
  }

  async escalate(flagId: string, actorId: string) {
    const flag = await this.getOpenFlag(flagId);

    await this.prisma.$transaction(async (tx) => {
      await tx.contentReview.create({
        data: {
          questionId: flag.questionId,
          reviewerId: actorId,
          action: "escalate",
          comment: flag.comment,
        },
      });
      await tx.questionFlag.update({
        where: { id: flagId },
        data: { status: "escalated" },
      });
      await tx.question.update({
        where: { id: flag.questionId },
        data: { status: "in_review", submittedAt: new Date() },
      });
    });

    return this.contentService.listReviewQueue({});
  }

  private async getOpenFlag(flagId: string) {
    const flag = await this.prisma.questionFlag.findUnique({ where: { id: flagId } });
    if (!flag || flag.status === "resolved") {
      throw new NotFoundException({
        code: "FLAG_NOT_FOUND",
        message: "Không tìm thấy báo cáo.",
      });
    }
    return flag;
  }
}
