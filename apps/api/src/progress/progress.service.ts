import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

/** Maximum attempt history items returned per request (newest first). */
export const MAX_ATTEMPT_HISTORY_ITEMS = 100;
import type {
  AttemptHistoryItem,
  AttemptHistoryList,
  PracticeSessionDetailView,
  ProgressSummaryResponse,
  QuestionOption,
} from "@practice-exam/types";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async listAttemptHistory(userId: string): Promise<AttemptHistoryList> {
    await this.subscriptionsService.assertUserNotSuspended(userId);

    const [practiceSessions, mockAttempts] = await Promise.all([
      this.prisma.practiceSession.findMany({
        where: {
          userId,
          status: { in: ["completed", "expired"] },
          answeredCount: { gt: 0 },
        },
        orderBy: { completedAt: "desc" },
        take: MAX_ATTEMPT_HISTORY_ITEMS,
        include: { subject: { select: { name: true } } },
      }),
      this.prisma.mockExamAttempt.findMany({
        where: { userId, status: "completed" },
        orderBy: { completedAt: "desc" },
        take: MAX_ATTEMPT_HISTORY_ITEMS,
        include: {
          template: {
            select: { name: true, subjectId: true, subject: { select: { name: true } } },
          },
        },
      }),
    ]);

    const practiceItems: AttemptHistoryItem[] = practiceSessions.map((session) => ({
      id: session.id,
      type: "practice",
      subjectId: session.subjectId,
      subjectName: session.subject.name,
      date: (session.completedAt ?? session.createdAt).toISOString(),
      scorePercent:
        session.answeredCount > 0
          ? Math.round((session.correctCount / session.answeredCount) * 100)
          : null,
      label: "Luyện tập",
    }));

    const mockItems: AttemptHistoryItem[] = mockAttempts.map((attempt) => ({
      id: attempt.id,
      type: "mock",
      subjectId: attempt.template.subjectId,
      subjectName: attempt.template.subject.name,
      date: (attempt.completedAt ?? attempt.startedAt).toISOString(),
      scorePercent: attempt.scorePercent,
      label: attempt.template.name,
    }));

    const items = [...practiceItems, ...mockItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, MAX_ATTEMPT_HISTORY_ITEMS);

    return { items };
  }

  async getSubjectSummaries(userId: string, days: 30 | 90): Promise<ProgressSummaryResponse> {
    await this.subscriptionsService.assertUserNotSuspended(userId);

    const since = new Date();
    since.setDate(since.getDate() - days);

    const subjects = await this.prisma.subject.findMany({
      where: { visibility: "active" },
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true, code: true },
    });

    const subjectIds = subjects.map((subject) => subject.id);

    const [practiceSessions, mockAttempts] = await Promise.all([
      this.prisma.practiceSession.findMany({
        where: {
          userId,
          subjectId: { in: subjectIds },
          status: { in: ["completed", "expired"] },
          OR: [
            { completedAt: { gte: since } },
            { completedAt: null, createdAt: { gte: since } },
          ],
        },
        include: { answers: true },
      }),
      this.prisma.mockExamAttempt.findMany({
        where: {
          userId,
          status: "completed",
          completedAt: { gte: since },
          template: { subjectId: { in: subjectIds } },
        },
        select: {
          scorePercent: true,
          completedAt: true,
          template: { select: { subjectId: true } },
        },
        orderBy: { completedAt: "desc" },
      }),
    ]);

    const practiceBySubject = new Map<string, typeof practiceSessions>();
    for (const session of practiceSessions) {
      const existing = practiceBySubject.get(session.subjectId) ?? [];
      existing.push(session);
      practiceBySubject.set(session.subjectId, existing);
    }

    const mockBySubject = new Map<string, typeof mockAttempts>();
    for (const attempt of mockAttempts) {
      const subjectId = attempt.template.subjectId;
      const existing = mockBySubject.get(subjectId) ?? [];
      existing.push(attempt);
      mockBySubject.set(subjectId, existing);
    }

    const summaries = subjects.map((subject) => {
      const subjectPracticeSessions = practiceBySubject.get(subject.id) ?? [];

      let questionsAttempted = 0;
      let correctCount = 0;
      for (const session of subjectPracticeSessions) {
        for (const answer of session.answers) {
          questionsAttempted += 1;
          if (answer.isCorrect) correctCount += 1;
        }
      }

      const subjectMockAttempts = mockBySubject.get(subject.id) ?? [];
      const mockScores = subjectMockAttempts
        .map((attempt) => attempt.scorePercent)
        .filter((score): score is number => score !== null);
      const averageMockScore =
        mockScores.length > 0
          ? Math.round(mockScores.reduce((sum, score) => sum + score, 0) / mockScores.length)
          : null;

      const correctnessRate =
        questionsAttempted > 0 ? Math.round((correctCount / questionsAttempted) * 100) : 0;

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        subjectCode: subject.code,
        questionsAttempted,
        correctCount,
        correctnessRate,
        mockAttemptsCount: mockScores.length,
        averageMockScore,
        latestMockScore: subjectMockAttempts[0]?.scorePercent ?? null,
        hasAttempts: questionsAttempted > 0 || subjectMockAttempts.length > 0,
      };
    });

    return { days, subjects: summaries };
  }

  async getPracticeSessionDetail(
    userId: string,
    sessionId: string,
  ): Promise<PracticeSessionDetailView> {
    await this.subscriptionsService.assertUserNotSuspended(userId);

    const session = await this.prisma.practiceSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        subject: { select: { name: true } },
        answers: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!session) {
      throw new NotFoundException({
        code: "SESSION_NOT_FOUND",
        message: "Không tìm thấy phiên luyện tập.",
      });
    }

    if (session.status === "in_progress") {
      throw new BadRequestException({
        code: "SESSION_IN_PROGRESS",
        message: "Phiên luyện tập chưa kết thúc.",
      });
    }

    if (session.answers.length === 0) {
      throw new BadRequestException({
        code: "SESSION_EMPTY",
        message: "Phiên luyện tập không có câu trả lời.",
      });
    }

    const questionIds = session.answers.map((answer) => answer.questionId);
    const questions = await this.prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: {
        id: true,
        stem: true,
        options: true,
        questionType: true,
        explanation: true,
        correctOptionKeys: true,
      },
    });
    const questionMap = new Map(questions.map((question) => [question.id, question]));

    const reviews = session.answers.map((answer, index) => {
      const question = questionMap.get(answer.questionId);
      if (!question) {
        throw new NotFoundException({
          code: "QUESTION_NOT_FOUND",
          message: "Không tìm thấy câu hỏi.",
        });
      }
      const options = question.options as unknown as QuestionOption[];
      const correctOptionKeys = question.correctOptionKeys as string[];
      const selectedKeys = answer.selectedKeys as string[];

      return {
        questionId: question.id,
        questionNumber: index + 1,
        stem: question.stem,
        questionType: question.questionType as PracticeSessionDetailView["questions"][0]["questionType"],
        options,
        selectedKeys,
        correctOptionKeys,
        isCorrect: answer.isCorrect,
        explanation: question.explanation,
      };
    });

    const scorePercent =
      session.answeredCount > 0
        ? Math.round((session.correctCount / session.answeredCount) * 100)
        : 0;

    return {
      sessionId: session.id,
      subjectId: session.subjectId,
      subjectName: session.subject.name,
      scorePercent,
      answeredCount: session.answeredCount,
      correctCount: session.correctCount,
      completedAt: (session.completedAt ?? session.createdAt).toISOString(),
      questions: reviews,
    };
  }
}
