import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  PracticeAnswerFeedback,
  PracticeQuestionView,
  PracticeSessionSummary,
  PracticeSessionView,
  QuestionOption,
} from "@practice-exam/types";
import { isPracticeAnswerCorrect, practiceSessionExpiresAt } from "@practice-exam/utils";
import { EntitlementsService } from "../entitlements/entitlements.service";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";

type SessionWithSubject = {
  id: string;
  userId: string;
  subjectId: string;
  status: string;
  answeredCount: number;
  correctCount: number;
  currentQuestionId: string | null;
  expiresAt: Date;
  subject: { name: string };
};

@Injectable()
export class PracticeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlementsService: EntitlementsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async getActiveSession(userId: string, subjectId: string): Promise<PracticeSessionView | null> {
    await this.subscriptionsService.assertUserNotSuspended(userId);
    await this.expireStaleSessions(userId);
    const session = await this.prisma.practiceSession.findFirst({
      where: {
        userId,
        subjectId,
        status: "in_progress",
        expiresAt: { gt: new Date() },
      },
      include: { subject: { select: { name: true } } },
      orderBy: { lastActivityAt: "desc" },
    });

    if (!session) return null;
    const freeTierStatus = await this.entitlementsService.getSubjectFreeTierStatus(userId, subjectId);
    return this.toSessionView(session, freeTierStatus.isAtLimit, true);
  }

  async startOrResumeSession(
    userId: string,
    subjectId: string,
    forceNew = false,
  ): Promise<PracticeSessionView> {
    await this.subscriptionsService.assertUserNotSuspended(userId);
    const subject = await this.prisma.subject.findFirst({
      where: { id: subjectId, visibility: "active" },
    });
    if (!subject) {
      throw new NotFoundException({
        code: "SUBJECT_NOT_FOUND",
        message: "Không tìm thấy môn học.",
      });
    }

    await this.expireStaleSessions(userId);

    const existing = await this.prisma.practiceSession.findFirst({
      where: {
        userId,
        subjectId,
        status: "in_progress",
        expiresAt: { gt: new Date() },
      },
      include: { subject: { select: { name: true } } },
      orderBy: { lastActivityAt: "desc" },
    });

    const freeTierStatus = await this.entitlementsService.getSubjectFreeTierStatus(userId, subjectId);

    if (existing && !forceNew) {
      return this.toSessionView(existing, freeTierStatus.isAtLimit, true);
    }

    if (existing && forceNew) {
      await this.prisma.practiceSession.update({
        where: { id: existing.id },
        data: { status: "completed", completedAt: new Date(), currentQuestionId: null },
      });
    }

    try {
      const session = await this.prisma.practiceSession.create({
        data: {
          userId,
          subjectId,
          expiresAt: practiceSessionExpiresAt(),
        },
        include: { subject: { select: { name: true } } },
      });
      return this.toSessionView(session, freeTierStatus.isAtLimit, false);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const raced = await this.prisma.practiceSession.findFirst({
          where: {
            userId,
            subjectId,
            status: "in_progress",
            expiresAt: { gt: new Date() },
          },
          include: { subject: { select: { name: true } } },
          orderBy: { lastActivityAt: "desc" },
        });
        if (raced) {
          return this.toSessionView(raced, freeTierStatus.isAtLimit, true);
        }
      }
      throw error;
    }
  }

  async getSession(userId: string, sessionId: string): Promise<PracticeSessionView> {
    await this.subscriptionsService.assertUserNotSuspended(userId);
    await this.expireStaleSessions(userId);
    const session = await this.getOwnedSession(userId, sessionId);
    this.assertSessionNotExpired(session, sessionId);

    const freeTierStatus = await this.entitlementsService.getSubjectFreeTierStatus(
      userId,
      session.subjectId,
    );
    const resumable =
      session.status === "in_progress" && session.expiresAt > new Date();
    return this.toSessionView(session, freeTierStatus.isAtLimit, resumable);
  }

  async getCurrentQuestion(userId: string, sessionId: string): Promise<PracticeQuestionView | null> {
    const session = await this.assertActiveSession(userId, sessionId);
    const freeTierStatus = await this.entitlementsService.getSubjectFreeTierStatus(
      userId,
      session.subjectId,
    );

    if (freeTierStatus.isAtLimit) {
      throw new ForbiddenException({
        code: "FREE_TIER_EXCEEDED",
        message: "Bạn đã dùng hết lượt miễn phí tháng này. Vui lòng đăng ký để tiếp tục luyện tập.",
        details: { subjectId: session.subjectId },
      });
    }

    if (session.currentQuestionId) {
      const alreadyAnswered = await this.prisma.practiceAnswer.findUnique({
        where: {
          sessionId_questionId: {
            sessionId,
            questionId: session.currentQuestionId,
          },
        },
      });
      if (!alreadyAnswered) {
        const bound = await this.loadPublishedQuestion(
          session.currentQuestionId,
          session.subjectId,
        );
        if (bound) {
          return this.toPracticeQuestion(bound, session.answeredCount + 1);
        }
      }
    }

    const answeredIds = await this.getAnsweredQuestionIds(sessionId);
    const question = await this.selectNextQuestion(session.subjectId, answeredIds);
    if (!question) return null;

    await this.prisma.practiceSession.update({
      where: { id: sessionId },
      data: {
        currentQuestionId: question.id,
        lastActivityAt: new Date(),
        expiresAt: practiceSessionExpiresAt(),
      },
    });

    return this.toPracticeQuestion(question, session.answeredCount + 1);
  }

  async submitAnswer(
    userId: string,
    sessionId: string,
    questionId: string,
    selectedKeys: string[],
  ): Promise<PracticeAnswerFeedback> {
    await this.subscriptionsService.assertUserNotSuspended(userId);
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM practice_sessions WHERE id = ${sessionId}::uuid FOR UPDATE`;

      const session = await tx.practiceSession.findFirst({
        where: { id: sessionId, userId },
        include: { subject: { select: { name: true } } },
      });
      if (!session) {
        throw new NotFoundException({
          code: "SESSION_NOT_FOUND",
          message: "Không tìm thấy phiên luyện tập.",
        });
      }
      if (session.status !== "in_progress") {
        throw new BadRequestException({
          code: "SESSION_NOT_ACTIVE",
          message: "Phiên luyện tập đã kết thúc.",
        });
      }
      if (session.expiresAt <= new Date()) {
        await tx.practiceSession.update({
          where: { id: sessionId },
          data: { status: "expired", currentQuestionId: null },
        });
        throw new BadRequestException({
          code: "SESSION_EXPIRED",
          message: "Phiên luyện tập đã hết hạn. Vui lòng bắt đầu phiên mới.",
        });
      }

      if (!session.currentQuestionId || session.currentQuestionId !== questionId) {
        throw new BadRequestException({
          code: "WRONG_QUESTION",
          message: "Câu hỏi không khớp với phiên luyện tập hiện tại.",
        });
      }

      const existingAnswer = await tx.practiceAnswer.findUnique({
        where: { sessionId_questionId: { sessionId, questionId } },
      });
      if (existingAnswer) {
        throw new BadRequestException({
          code: "QUESTION_ALREADY_ANSWERED",
          message: "Câu hỏi này đã được trả lời.",
        });
      }

      const question = await tx.question.findFirst({
        where: {
          id: questionId,
          subjectId: session.subjectId,
          status: "published",
        },
      });
      if (!question) {
        throw new NotFoundException({
          code: "QUESTION_NOT_FOUND",
          message: "Không tìm thấy câu hỏi.",
        });
      }

      this.validateSelectedKeys(
        question.questionType,
        selectedKeys,
        question.options as unknown as QuestionOption[],
      );

      const correctKeys = question.correctOptionKeys as string[];
      const isCorrect = isPracticeAnswerCorrect(selectedKeys, correctKeys);

      const freeTierStatus = await this.entitlementsService.consumeFreeTierQuestionInTransaction(
        tx,
        userId,
        session.subjectId,
      );

      await tx.practiceAnswer.create({
        data: {
          sessionId,
          questionId,
          selectedKeys,
          isCorrect,
        },
      });

      const updated = await tx.practiceSession.update({
        where: { id: sessionId },
        data: {
          answeredCount: { increment: 1 },
          correctCount: isCorrect ? { increment: 1 } : undefined,
          currentQuestionId: null,
          lastActivityAt: new Date(),
          expiresAt: practiceSessionExpiresAt(),
        },
      });

      return {
        isCorrect,
        correctOptionKeys: correctKeys,
        explanation: question.explanation,
        freeTierStatus,
        answeredCount: updated.answeredCount,
        correctCount: updated.correctCount,
        freeTierAtLimit: freeTierStatus.isAtLimit,
      };
    });
  }

  async endSession(userId: string, sessionId: string): Promise<PracticeSessionSummary> {
    await this.subscriptionsService.assertUserNotSuspended(userId);
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM practice_sessions WHERE id = ${sessionId}::uuid FOR UPDATE`;

      const session = await tx.practiceSession.findFirst({
        where: { id: sessionId, userId },
        include: { subject: { select: { name: true } } },
      });
      if (!session) {
        throw new NotFoundException({
          code: "SESSION_NOT_FOUND",
          message: "Không tìm thấy phiên luyện tập.",
        });
      }

      const subjectName = session.subject.name;

      const finalSession =
        session.status === "in_progress"
          ? await tx.practiceSession.update({
              where: { id: sessionId },
              data: {
                status: "completed",
                completedAt: new Date(),
                lastActivityAt: new Date(),
                currentQuestionId: null,
              },
            })
          : session;

      return { ...finalSession, subject: { name: subjectName } };
    });

    const freeTierStatus = await this.entitlementsService.getSubjectFreeTierStatus(
      userId,
      result.subjectId,
    );

    const scorePercent =
      result.answeredCount > 0
        ? Math.round((result.correctCount / result.answeredCount) * 100)
        : 0;

    return {
      sessionId: result.id,
      subjectId: result.subjectId,
      subjectName: result.subject.name,
      answeredCount: result.answeredCount,
      correctCount: result.correctCount,
      scorePercent,
      endedAt: new Date().toISOString(),
      freeTierAtLimit: freeTierStatus.isAtLimit,
    };
  }

  private async expireStaleSessions(userId: string) {
    await this.prisma.practiceSession.updateMany({
      where: {
        userId,
        status: "in_progress",
        expiresAt: { lte: new Date() },
      },
      data: { status: "expired", currentQuestionId: null },
    });
  }

  private async getOwnedSession(userId: string, sessionId: string): Promise<SessionWithSubject> {
    const session = await this.prisma.practiceSession.findFirst({
      where: { id: sessionId, userId },
      include: { subject: { select: { name: true } } },
    });
    if (!session) {
      throw new NotFoundException({
        code: "SESSION_NOT_FOUND",
        message: "Không tìm thấy phiên luyện tập.",
      });
    }
    return session;
  }

  private async assertActiveSession(userId: string, sessionId: string): Promise<SessionWithSubject> {
    await this.subscriptionsService.assertUserNotSuspended(userId);
    const session = await this.getOwnedSession(userId, sessionId);
    if (session.status !== "in_progress") {
      throw new BadRequestException({
        code: "SESSION_NOT_ACTIVE",
        message: "Phiên luyện tập đã kết thúc.",
      });
    }
    this.assertSessionNotExpired(session, sessionId);
    return session;
  }

  private assertSessionNotExpired(session: SessionWithSubject, sessionId: string) {
    if (session.status === "in_progress" && session.expiresAt <= new Date()) {
      void this.prisma.practiceSession.update({
        where: { id: sessionId },
        data: { status: "expired", currentQuestionId: null },
      });
      throw new BadRequestException({
        code: "SESSION_EXPIRED",
        message: "Phiên luyện tập đã hết hạn. Vui lòng bắt đầu phiên mới.",
      });
    }
  }

  private async getAnsweredQuestionIds(sessionId: string): Promise<string[]> {
    const answers = await this.prisma.practiceAnswer.findMany({
      where: { sessionId },
      select: { questionId: true },
    });
    return answers.map((a) => a.questionId);
  }

  private async loadPublishedQuestion(questionId: string, subjectId: string) {
    return this.prisma.question.findFirst({
      where: { id: questionId, subjectId, status: "published" },
      select: {
        id: true,
        stem: true,
        options: true,
        imageUrls: true,
        questionType: true,
      },
    });
  }

  private async selectNextQuestion(subjectId: string, excludeIds: string[]) {
    const published = await this.prisma.question.findMany({
      where: {
        subjectId,
        status: "published",
        id: excludeIds.length > 0 ? { notIn: excludeIds } : undefined,
      },
      select: {
        id: true,
        stem: true,
        options: true,
        imageUrls: true,
        questionType: true,
      },
    });

    if (published.length === 0) return null;
    const index = Math.floor(Math.random() * published.length);
    return published[index]!;
  }

  private validateSelectedKeys(
    questionType: string,
    selectedKeys: string[],
    options: QuestionOption[],
  ) {
    if (new Set(selectedKeys).size !== selectedKeys.length) {
      throw new BadRequestException({
        code: "INVALID_SELECTION",
        message: "Không được chọn trùng đáp án.",
      });
    }

    const validKeys = new Set(options.map((o) => o.key));
    for (const key of selectedKeys) {
      if (!validKeys.has(key)) {
        throw new BadRequestException({
          code: "INVALID_OPTION",
          message: "Lựa chọn không hợp lệ.",
        });
      }
    }

    if (questionType === "single_choice" || questionType === "true_false") {
      if (selectedKeys.length !== 1) {
        throw new BadRequestException({
          code: "INVALID_SELECTION",
          message: "Chọn một đáp án.",
        });
      }
    } else if (questionType === "multiple_choice" && selectedKeys.length < 1) {
      throw new BadRequestException({
        code: "INVALID_SELECTION",
        message: "Chọn ít nhất một đáp án.",
      });
    }
  }

  private toPracticeQuestion(
    question: {
      id: string;
      stem: string;
      options: unknown;
      imageUrls: string[];
      questionType: string;
    },
    questionNumber: number,
  ): PracticeQuestionView {
    return {
      questionId: question.id,
      questionNumber,
      questionType: question.questionType as PracticeQuestionView["questionType"],
      stem: question.stem,
      options: question.options as QuestionOption[],
      imageUrls: question.imageUrls,
    };
  }

  private toSessionView(
    session: {
      id: string;
      subjectId: string;
      status: string;
      answeredCount: number;
      correctCount: number;
      expiresAt: Date;
      subject: { name: string };
    },
    freeTierAtLimit: boolean,
    resumable: boolean,
  ): PracticeSessionView {
    return {
      id: session.id,
      subjectId: session.subjectId,
      subjectName: session.subject.name,
      status: session.status as PracticeSessionView["status"],
      answeredCount: session.answeredCount,
      correctCount: session.correctCount,
      expiresAt: session.expiresAt.toISOString(),
      resumable,
      freeTierAtLimit,
    };
  }
}
