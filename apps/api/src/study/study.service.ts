import { Injectable, NotFoundException } from "@nestjs/common";
import type { QuestionOption, StudyQuestionDetail, StudyQuestionListItem, StudyQuestionListResult } from "@practice-exam/types";
import { getIctPeriodKey } from "@practice-exam/utils";
import { EntitlementsService } from "../entitlements/entitlements.service";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { DEFAULT_PAGE_SIZE, ListStudyQuestionsDto, MAX_PAGE_SIZE } from "./dto/study.dto";

type PublishedQuestionRow = {
  id: string;
  stem: string;
  questionType: string;
  difficulty: string;
  tags: string[];
  imageUrls: string[];
  options: unknown;
  correctOptionKeys: unknown;
  explanation: string | null;
};

@Injectable()
export class StudyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlementsService: EntitlementsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async listQuestions(
    userId: string,
    subjectId: string,
    query: ListStudyQuestionsDto,
  ): Promise<StudyQuestionListResult> {
    await this.subscriptionsService.assertUserNotSuspended(userId);
    await this.assertActiveSubject(subjectId);

    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(query.pageSize) || DEFAULT_PAGE_SIZE));
    const studyTier = await this.entitlementsService.getStudyTierStatus(userId, subjectId);
    const periodKey = getIctPeriodKey();
    const viewedLogs = await this.prisma.studyViewLog.findMany({
      where: { userId, subjectId, periodKey },
      select: { questionId: true },
    });
    const viewedSet = new Set(viewedLogs.map((log) => log.questionId));

    const where = {
      subjectId,
      status: "published" as const,
    };

    const [rows, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          stem: true,
          questionType: true,
          difficulty: true,
          tags: true,
          imageUrls: true,
        },
      }),
      this.prisma.question.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        ...this.toListItem(row),
        viewedThisPeriod: viewedSet.has(row.id),
      })),
      total,
      page,
      pageSize,
      studyTier,
    };
  }

  async getQuestionDetail(
    userId: string,
    subjectId: string,
    questionId: string,
  ): Promise<StudyQuestionDetail> {
    await this.subscriptionsService.assertUserNotSuspended(userId);
    await this.assertActiveSubject(subjectId);

    const question = await this.loadPublishedQuestion(questionId, subjectId);
    if (!question) {
      throw new NotFoundException({
        code: "QUESTION_NOT_FOUND",
        message: "Không tìm thấy câu hỏi.",
      });
    }

    const hasActiveSubscription = await this.subscriptionsService.hasActiveSubscription(
      userId,
      subjectId,
    );

    let studyTier;
    if (hasActiveSubscription) {
      studyTier = await this.entitlementsService.getStudyTierStatus(userId, subjectId);
    } else {
      const periodKey = getIctPeriodKey();
      const existingView = await this.prisma.studyViewLog.findUnique({
        where: {
          userId_subjectId_questionId_periodKey: {
            userId,
            subjectId,
            questionId,
            periodKey,
          },
        },
      });

      studyTier = existingView
        ? await this.entitlementsService.getStudyTierStatus(userId, subjectId)
        : await this.entitlementsService.consumeStudyView(userId, subjectId, questionId);
    }

    return this.toDetail(question, studyTier);
  }

  async getStudyTierStatus(userId: string, subjectId: string) {
    await this.subscriptionsService.assertUserNotSuspended(userId);
    await this.assertActiveSubject(subjectId);
    return this.entitlementsService.getStudyTierStatus(userId, subjectId);
  }

  private async assertActiveSubject(subjectId: string): Promise<void> {
    const subject = await this.prisma.subject.findFirst({
      where: { id: subjectId, visibility: "active" },
    });
    if (!subject) {
      throw new NotFoundException({
        code: "SUBJECT_NOT_FOUND",
        message: "Không tìm thấy môn học.",
      });
    }
  }

  private async loadPublishedQuestion(
    questionId: string,
    subjectId: string,
  ): Promise<PublishedQuestionRow | null> {
    return this.prisma.question.findFirst({
      where: {
        id: questionId,
        subjectId,
        status: "published",
      },
      select: {
        id: true,
        stem: true,
        questionType: true,
        difficulty: true,
        tags: true,
        imageUrls: true,
        options: true,
        correctOptionKeys: true,
        explanation: true,
      },
    });
  }

  private toListItem(row: {
    id: string;
    stem: string;
    questionType: string;
    difficulty: string;
    tags: string[];
    imageUrls: string[];
  }): Omit<StudyQuestionListItem, "viewedThisPeriod"> {
    return {
      id: row.id,
      stem: row.stem,
      questionType: row.questionType as StudyQuestionListItem["questionType"],
      difficulty: row.difficulty as StudyQuestionListItem["difficulty"],
      tags: row.tags,
      imageUrls: row.imageUrls,
    };
  }

  private toDetail(
    row: PublishedQuestionRow,
    studyTier: StudyQuestionDetail["studyTier"],
  ): StudyQuestionDetail {
    return {
      id: row.id,
      stem: row.stem,
      questionType: row.questionType as StudyQuestionDetail["questionType"],
      difficulty: row.difficulty as StudyQuestionDetail["difficulty"],
      tags: row.tags,
      imageUrls: row.imageUrls,
      options: row.options as QuestionOption[],
      correctOptionKeys: row.correctOptionKeys as string[],
      explanation: row.explanation,
      studyTier,
    };
  }
}
