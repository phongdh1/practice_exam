import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { MockExamAttempt, Prisma } from "@prisma/client";
import type {
  MockExamAttemptView,
  MockExamCandidateTemplateView,
  MockExamQuestionView,
  MockExamQuestionReview,
  MockExamResultsView,
  MockExamReviewItem,
  MockExamSectionScoreView,
  QuestionOption,
} from "@practice-exam/types";
import { getIctPeriodKey, isPracticeAnswerCorrect } from "@practice-exam/utils";
import { EntitlementsService } from "../entitlements/entitlements.service";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import type { MockExamAttemptQuestionPlan } from "./mock-exam-attempt.types";
import { MockExamsService } from "./mock-exams.service";

type AttemptWithTemplate = MockExamAttempt & {
  template: {
    id: string;
    subjectId: string;
    name: string;
    passingScorePercent: number;
    totalDurationMinutes: number;
    sections: Array<{
      sectionOrder: number;
      subjectId: string;
      questionCount: number;
      timeLimitMinutes: number;
      weightPercent: number;
    }>;
  };
};

@Injectable()
export class MockExamAttemptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mockExamsService: MockExamsService,
    private readonly entitlementsService: EntitlementsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async listCandidateTemplates(
    userId: string,
    subjectId: string,
  ): Promise<MockExamCandidateTemplateView[]> {
    const access = await this.entitlementsService.getMockExamAccess(userId, subjectId);
    const templates = await this.mockExamsService.listBySubject(subjectId);

    return Promise.all(
      templates.map(async (template) => {
        const attempts = await this.mockExamsService.getAttemptStatus(userId, template.id);
        const totalQuestions = template.sections.reduce((sum, s) => sum + s.questionCount, 0);
        const subjectIds = [...new Set(template.sections.map((s) => s.subjectId))];
        return {
          id: template.id,
          subjectId: template.subjectId,
          name: template.name,
          description: template.description,
          totalDurationMinutes: template.totalDurationMinutes,
          passingScorePercent: template.passingScorePercent,
          totalQuestions,
          subjectIds,
          sections: template.sections.map((s) => ({
            sectionOrder: s.sectionOrder,
            subjectId: s.subjectId,
            questionCount: s.questionCount,
            timeLimitMinutes: s.timeLimitMinutes,
            weightPercent: s.weightPercent,
          })),
          attempts,
          canStart: access.allowed && attempts.remaining > 0,
          accessDeniedReason: access.allowed ? undefined : access.reason,
          attemptsExhausted: attempts.remaining <= 0,
        };
      }),
    );
  }

  async getActiveAttempt(userId: string, templateId: string): Promise<MockExamAttemptView | null> {
    await this.subscriptionsService.assertUserNotSuspended(userId);
    const attempt = await this.prisma.mockExamAttempt.findFirst({
      where: { userId, templateId, status: "in_progress" },
      include: {
        template: {
          include: { sections: { orderBy: { sectionOrder: "asc" } } },
        },
      },
      orderBy: { startedAt: "desc" },
    });
    if (!attempt) return null;
    await this.syncTimer(attempt);
    const refreshed = await this.getOwnedAttempt(userId, attempt.id);
    return this.toAttemptView(refreshed);
  }

  async startAttempt(userId: string, templateId: string): Promise<MockExamAttemptView> {
    await this.subscriptionsService.assertUserNotSuspended(userId);
    const template = await this.mockExamsService.findApprovedForCandidate(templateId);
    const access = await this.entitlementsService.getMockExamAccess(userId, template.subjectId);
    if (!access.allowed) {
      throw new ForbiddenException({
        code: access.reason ?? "NO_SUBSCRIPTION",
        message: "Bạn cần đăng ký để thi thử.",
        details: { subjectId: template.subjectId },
      });
    }

    await this.mockExamsService.assertCanStartAttempt(userId, templateId);

    const existing = await this.prisma.mockExamAttempt.findFirst({
      where: { userId, templateId, status: "in_progress" },
    });
    if (existing) {
      const owned = await this.getOwnedAttempt(userId, existing.id);
      return this.toAttemptView(owned);
    }

    const plan = await this.mockExamsService.buildAttemptQuestionPlan(templateId);
    const firstSection = plan.sections[0];
    if (!firstSection) {
      throw new BadRequestException({
        code: "MOCK_EXAM_NO_SECTIONS",
        message: "Đề thi thử không có phần thi.",
      });
    }

    const attempt = await this.prisma.mockExamAttempt.create({
      data: {
        templateId,
        userId,
        periodKey: getIctPeriodKey(),
        questionIds: plan as unknown as Prisma.InputJsonValue,
        sectionEndsAt: this.sectionEndsAt(firstSection.timeLimitMinutes),
        currentSectionIndex: 0,
        currentQuestionIndex: 0,
        phase: "in_section",
      },
      include: {
        template: {
          include: { sections: { orderBy: { sectionOrder: "asc" } } },
        },
      },
    });

    return this.toAttemptView(attempt);
  }

  async getAttempt(userId: string, attemptId: string): Promise<MockExamAttemptView> {
    const attempt = await this.getOwnedAttempt(userId, attemptId);
    await this.syncTimer(attempt);
    const refreshed = await this.getOwnedAttempt(userId, attemptId);
    return this.toAttemptView(refreshed);
  }

  async getQuestion(
    userId: string,
    attemptId: string,
    questionId?: string,
  ): Promise<MockExamQuestionView | null> {
    const attempt = await this.assertActiveAttempt(userId, attemptId);
    const plan = this.parsePlan(attempt.questionIds);
    const answers = await this.loadAnswers(attemptId);

    let targetQuestionId = questionId;
    if (!targetQuestionId) {
      if (attempt.phase === "review") {
        return null;
      }
      const section = plan.sections[attempt.currentSectionIndex];
      if (!section) return null;
      targetQuestionId = section.questionIds[attempt.currentQuestionIndex];
      if (!targetQuestionId) return null;
    }

    const location = this.findQuestionLocation(plan, targetQuestionId);
    if (!location) {
      throw new BadRequestException({
        code: "QUESTION_NOT_IN_ATTEMPT",
        message: "Câu hỏi không thuộc đề thi này.",
      });
    }

    if (attempt.phase === "in_section") {
      if (location.sectionIndex < attempt.currentSectionIndex) {
        throw new BadRequestException({
          code: "SECTION_LOCKED",
          message: "Không thể quay lại phần thi trước.",
        });
      }
      if (location.sectionIndex > attempt.currentSectionIndex) {
        throw new BadRequestException({
          code: "SECTION_NOT_REACHED",
          message: "Chưa đến phần thi này.",
        });
      }
      if (location.questionIndex > attempt.currentQuestionIndex && !answers.has(targetQuestionId)) {
        throw new BadRequestException({
          code: "FORWARD_ONLY",
          message: "Chỉ được đi tiếp trong phần thi hiện tại.",
        });
      }
    }

    const question = await this.prisma.question.findFirst({
      where: { id: targetQuestionId, status: "published" },
    });
    if (!question) {
      throw new NotFoundException({
        code: "QUESTION_NOT_FOUND",
        message: "Không tìm thấy câu hỏi.",
      });
    }

    const saved = answers.get(targetQuestionId);
    return {
      id: question.id,
      stem: question.stem,
      questionType: question.questionType,
      options: question.options as unknown as QuestionOption[],
      imageUrls: question.imageUrls,
      sectionIndex: location.sectionIndex,
      questionIndex: location.questionIndex,
      globalQuestionNumber: this.globalQuestionNumber(plan, location),
      selectedKeys: saved?.selectedKeys ?? [],
      canEdit: attempt.phase === "review" || location.sectionIndex === attempt.currentSectionIndex,
    };
  }

  async saveAnswer(
    userId: string,
    attemptId: string,
    questionId: string,
    selectedKeys: string[],
  ): Promise<{ saved: true; attempt: MockExamAttemptView }> {
    const attempt = await this.assertActiveAttempt(userId, attemptId);
    const plan = this.parsePlan(attempt.questionIds);
    const location = this.findQuestionLocation(plan, questionId);
    if (!location) {
      throw new BadRequestException({
        code: "QUESTION_NOT_IN_ATTEMPT",
        message: "Câu hỏi không thuộc đề thi này.",
      });
    }

    if (attempt.phase === "in_section") {
      if (location.sectionIndex !== attempt.currentSectionIndex) {
        throw new BadRequestException({
          code: "SECTION_LOCKED",
          message: "Chỉ được trả lời câu hỏi trong phần thi hiện tại.",
        });
      }
    }

    const question = await this.prisma.question.findFirst({
      where: { id: questionId, status: "published" },
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

    await this.prisma.mockExamAnswer.upsert({
      where: { attemptId_questionId: { attemptId, questionId } },
      create: {
        attemptId,
        questionId,
        sectionIndex: location.sectionIndex,
        questionIndex: location.questionIndex,
        selectedKeys,
      },
      update: {
        selectedKeys,
        answeredAt: new Date(),
      },
    });

    if (attempt.phase === "in_section" && location.questionIndex === attempt.currentQuestionIndex) {
      const section = plan.sections[attempt.currentSectionIndex];
      const isLastInSection =
        section && attempt.currentQuestionIndex >= section.questionIds.length - 1;
      if (!isLastInSection) {
        await this.prisma.mockExamAttempt.update({
          where: { id: attemptId },
          data: { currentQuestionIndex: { increment: 1 } },
        });
      }
    }

    const refreshed = await this.getOwnedAttempt(userId, attemptId);
    return { saved: true, attempt: this.toAttemptView(refreshed) };
  }

  async advanceSection(userId: string, attemptId: string): Promise<MockExamAttemptView> {
    const attempt = await this.assertActiveAttempt(userId, attemptId);
    if (attempt.phase !== "in_section") {
      throw new BadRequestException({
        code: "INVALID_PHASE",
        message: "Không thể chuyển phần thi ở giai đoạn hiện tại.",
      });
    }

    const plan = this.parsePlan(attempt.questionIds);
    const section = plan.sections[attempt.currentSectionIndex];
    if (!section) {
      throw new BadRequestException({
        code: "SECTION_NOT_FOUND",
        message: "Không tìm thấy phần thi.",
      });
    }

    const answers = await this.loadAnswers(attemptId);
    const unanswered = section.questionIds.filter((id) => !answers.has(id));
    if (unanswered.length > 0) {
      throw new BadRequestException({
        code: "SECTION_INCOMPLETE",
        message: "Vui lòng trả lời tất cả câu hỏi trong phần thi trước khi tiếp tục.",
        details: { unansweredCount: unanswered.length },
      });
    }

    const nextSectionIndex = attempt.currentSectionIndex + 1;
    if (nextSectionIndex >= plan.sections.length) {
      await this.prisma.mockExamAttempt.update({
        where: { id: attemptId },
        data: {
          phase: "review",
          sectionEndsAt: null,
          currentQuestionIndex: 0,
        },
      });
    } else {
      const nextSection = plan.sections[nextSectionIndex];
      await this.prisma.mockExamAttempt.update({
        where: { id: attemptId },
        data: {
          currentSectionIndex: nextSectionIndex,
          currentQuestionIndex: 0,
          sectionEndsAt: this.sectionEndsAt(nextSection.timeLimitMinutes),
        },
      });
    }

    const refreshed = await this.getOwnedAttempt(userId, attemptId);
    return this.toAttemptView(refreshed);
  }

  async getReviewGrid(userId: string, attemptId: string): Promise<MockExamReviewItem[]> {
    const attempt = await this.assertActiveAttempt(userId, attemptId);
    if (attempt.phase !== "review") {
      throw new BadRequestException({
        code: "NOT_IN_REVIEW",
        message: "Chưa đến giai đoạn xem lại bài thi.",
      });
    }

    const plan = this.parsePlan(attempt.questionIds);
    const answers = await this.loadAnswers(attemptId);
    const items: MockExamReviewItem[] = [];

    for (let sectionIndex = 0; sectionIndex < plan.sections.length; sectionIndex += 1) {
      const section = plan.sections[sectionIndex];
      for (let questionIndex = 0; questionIndex < section.questionIds.length; questionIndex += 1) {
        const questionId = section.questionIds[questionIndex];
        const answer = answers.get(questionId);
        items.push({
          questionId,
          sectionIndex,
          questionIndex,
          globalQuestionNumber: this.globalQuestionNumber(plan, { sectionIndex, questionIndex }),
          answered: Boolean(answer),
        });
      }
    }

    return items;
  }

  async submitAttempt(userId: string, attemptId: string): Promise<MockExamResultsView> {
    const attempt = await this.assertActiveAttempt(userId, attemptId);
    if (attempt.phase !== "review") {
      throw new BadRequestException({
        code: "NOT_IN_REVIEW",
        message: "Chỉ có thể nộp bài ở giai đoạn xem lại.",
      });
    }

    const results = await this.scoreAttempt(attempt);
    await this.prisma.mockExamAttempt.update({
      where: { id: attemptId },
      data: {
        status: "completed",
        phase: "completed",
        scorePercent: results.scorePercent,
        passed: results.passed,
        sectionScores: results.sectionBreakdown as unknown as Prisma.InputJsonValue,
        completedAt: new Date(),
        sectionEndsAt: null,
      },
    });

    return results;
  }

  async getResults(userId: string, attemptId: string): Promise<MockExamResultsView> {
    const attempt = await this.getOwnedAttempt(userId, attemptId);
    if (attempt.status !== "completed") {
      throw new BadRequestException({
        code: "ATTEMPT_NOT_COMPLETED",
        message: "Bài thi chưa hoàn thành.",
      });
    }

    return {
      attemptId: attempt.id,
      templateId: attempt.templateId,
      templateName: attempt.template.name,
      scorePercent: attempt.scorePercent ?? 0,
      passingScorePercent: attempt.template.passingScorePercent,
      passed: attempt.passed ?? false,
      sectionBreakdown: this.parseSectionScores(attempt.sectionScores),
      questionReviews: await this.buildQuestionReviews(attempt),
      completedAt: attempt.completedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private async scoreAttempt(
    attempt: AttemptWithTemplate,
    includeExplanations = false,
  ): Promise<MockExamResultsView> {
    const plan = this.parsePlan(attempt.questionIds);
    const answers = await this.loadAnswers(attempt.id);
    const questionIds = plan.sections.flatMap((s) => s.questionIds);
    const questions = await this.prisma.question.findMany({
      where: { id: { in: questionIds }, status: "published" },
    });
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    const sectionBreakdown: MockExamSectionScoreView[] = [];
    let weightedTotal = 0;

    for (let sectionIndex = 0; sectionIndex < plan.sections.length; sectionIndex += 1) {
      const section = plan.sections[sectionIndex];
      let correctCount = 0;
      for (const questionId of section.questionIds) {
        const question = questionMap.get(questionId);
        const answer = answers.get(questionId);
        if (!question || !answer) continue;
        const correctKeys = question.correctOptionKeys as string[];
        if (isPracticeAnswerCorrect(answer.selectedKeys, correctKeys)) {
          correctCount += 1;
        }
      }
      const totalCount = section.questionIds.length;
      const scorePercent = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
      const weightedScore = (scorePercent * section.weightPercent) / 100;
      weightedTotal += weightedScore;
      sectionBreakdown.push({
        sectionIndex,
        sectionOrder: section.sectionOrder,
        subjectId: section.subjectId,
        weightPercent: section.weightPercent,
        correctCount,
        totalCount,
        scorePercent,
        weightedScore,
      });
    }

    const scorePercent = Math.round(weightedTotal);
    const passed = scorePercent >= attempt.template.passingScorePercent;

    const questionReviews = includeExplanations
      ? plan.sections.flatMap((section, sectionIndex) =>
          section.questionIds.flatMap((questionId, questionIndex) => {
            const question = questionMap.get(questionId);
            if (!question) return [];
            const answer = answers.get(questionId);
            const correctKeys = question.correctOptionKeys as string[];
            const selectedKeys = answer?.selectedKeys ?? [];
            return [{
              questionId,
              sectionIndex,
              questionIndex,
              globalQuestionNumber: this.globalQuestionNumber(plan, { sectionIndex, questionIndex }),
              stem: question.stem,
              questionType: question.questionType,
              options: question.options as unknown as QuestionOption[],
              selectedKeys,
              correctOptionKeys: correctKeys,
              isCorrect: isPracticeAnswerCorrect(selectedKeys, correctKeys),
              explanation: question.explanation,
            }];
          }),
        )
      : undefined;

    return {
      attemptId: attempt.id,
      templateId: attempt.templateId,
      templateName: attempt.template.name,
      scorePercent,
      passingScorePercent: attempt.template.passingScorePercent,
      passed,
      sectionBreakdown,
      questionReviews,
      completedAt: attempt.completedAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  private parseSectionScores(sectionScores: Prisma.JsonValue): MockExamSectionScoreView[] {
    return Array.isArray(sectionScores)
      ? (sectionScores as unknown as MockExamSectionScoreView[])
      : [];
  }

  private async buildQuestionReviews(attempt: AttemptWithTemplate): Promise<MockExamQuestionReview[]> {
    const plan = this.parsePlan(attempt.questionIds);
    const answers = await this.loadAnswers(attempt.id);
    const questionIds = plan.sections.flatMap((s) => s.questionIds);
    const questions = await this.prisma.question.findMany({
      where: { id: { in: questionIds }, status: "published" },
    });
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    return plan.sections.flatMap((section, sectionIndex) =>
      section.questionIds.flatMap((questionId, questionIndex) => {
        const question = questionMap.get(questionId);
        if (!question) return [];
        const answer = answers.get(questionId);
        const correctKeys = question.correctOptionKeys as string[];
        const selectedKeys = answer?.selectedKeys ?? [];
        return [{
          questionId,
          sectionIndex,
          questionIndex,
          globalQuestionNumber: this.globalQuestionNumber(plan, { sectionIndex, questionIndex }),
          stem: question.stem,
          questionType: question.questionType,
          options: question.options as unknown as QuestionOption[],
          selectedKeys,
          correctOptionKeys: correctKeys,
          isCorrect: isPracticeAnswerCorrect(selectedKeys, correctKeys),
          explanation: question.explanation,
        }];
      }),
    );
  }

  private async syncTimer(attempt: AttemptWithTemplate): Promise<void> {
    if (attempt.status !== "in_progress" || attempt.phase !== "in_section" || !attempt.sectionEndsAt) {
      return;
    }
    if (attempt.sectionEndsAt > new Date()) return;

    const plan = this.parsePlan(attempt.questionIds);
    const nextSectionIndex = attempt.currentSectionIndex + 1;
    if (nextSectionIndex >= plan.sections.length) {
      await this.prisma.mockExamAttempt.update({
        where: { id: attempt.id },
        data: { phase: "review", sectionEndsAt: null, currentQuestionIndex: 0 },
      });
      return;
    }

    const nextSection = plan.sections[nextSectionIndex];
    await this.prisma.mockExamAttempt.update({
      where: { id: attempt.id },
      data: {
        currentSectionIndex: nextSectionIndex,
        currentQuestionIndex: 0,
        sectionEndsAt: this.sectionEndsAt(nextSection.timeLimitMinutes),
      },
    });
  }

  private async assertActiveAttempt(userId: string, attemptId: string): Promise<AttemptWithTemplate> {
    await this.subscriptionsService.assertUserNotSuspended(userId);
    const attempt = await this.getOwnedAttempt(userId, attemptId);
    if (attempt.status !== "in_progress") {
      throw new BadRequestException({
        code: "ATTEMPT_NOT_ACTIVE",
        message: "Phiên thi thử đã kết thúc.",
      });
    }
    await this.syncTimer(attempt);
    return this.getOwnedAttempt(userId, attemptId);
  }

  private async getOwnedAttempt(userId: string, attemptId: string): Promise<AttemptWithTemplate> {
    const attempt = await this.prisma.mockExamAttempt.findFirst({
      where: { id: attemptId, userId },
      include: {
        template: {
          include: { sections: { orderBy: { sectionOrder: "asc" } } },
        },
      },
    });
    if (!attempt) {
      throw new NotFoundException({
        code: "ATTEMPT_NOT_FOUND",
        message: "Không tìm thấy phiên thi thử.",
      });
    }
    return attempt;
  }

  private async loadAnswers(attemptId: string) {
    const rows = await this.prisma.mockExamAnswer.findMany({ where: { attemptId } });
    return new Map(
      rows.map((row) => [row.questionId, { selectedKeys: row.selectedKeys as string[] }]),
    );
  }

  private parsePlan(questionIds: Prisma.JsonValue): MockExamAttemptQuestionPlan {
    return questionIds as unknown as MockExamAttemptQuestionPlan;
  }

  private findQuestionLocation(plan: MockExamAttemptQuestionPlan, questionId: string) {
    for (let sectionIndex = 0; sectionIndex < plan.sections.length; sectionIndex += 1) {
      const questionIndex = plan.sections[sectionIndex].questionIds.indexOf(questionId);
      if (questionIndex >= 0) {
        return { sectionIndex, questionIndex };
      }
    }
    return null;
  }

  private globalQuestionNumber(
    plan: MockExamAttemptQuestionPlan,
    location: { sectionIndex: number; questionIndex: number },
  ) {
    let number = 0;
    for (let i = 0; i < location.sectionIndex; i += 1) {
      number += plan.sections[i].questionIds.length;
    }
    return number + location.questionIndex + 1;
  }

  private sectionEndsAt(minutes: number): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  private toAttemptView(attempt: AttemptWithTemplate): MockExamAttemptView {
    const plan = this.parsePlan(attempt.questionIds);
    const totalQuestions = plan.sections.reduce((sum, s) => sum + s.questionIds.length, 0);
    const sectionRemainingMs =
      attempt.sectionEndsAt && attempt.phase === "in_section"
        ? Math.max(0, attempt.sectionEndsAt.getTime() - Date.now())
        : null;

    return {
      id: attempt.id,
      templateId: attempt.templateId,
      templateName: attempt.template.name,
      subjectId: attempt.template.subjectId,
      status: attempt.status,
      phase: attempt.phase,
      passingScorePercent: attempt.template.passingScorePercent,
      totalDurationMinutes: attempt.template.totalDurationMinutes,
      totalQuestions,
      currentSectionIndex: attempt.currentSectionIndex,
      currentQuestionIndex: attempt.currentQuestionIndex,
      sectionCount: plan.sections.length,
      sectionRemainingMs,
      sections: plan.sections.map((s, index) => ({
        sectionIndex: index,
        sectionOrder: s.sectionOrder,
        subjectId: s.subjectId,
        questionCount: s.questionIds.length,
        timeLimitMinutes: s.timeLimitMinutes,
        weightPercent: s.weightPercent,
      })),
      startedAt: attempt.startedAt.toISOString(),
      completedAt: attempt.completedAt?.toISOString() ?? null,
    };
  }

  private validateSelectedKeys(
    questionType: string,
    selectedKeys: string[],
    options: QuestionOption[],
  ) {
    const validKeys = new Set(options.map((o) => o.key));
    for (const key of selectedKeys) {
      if (!validKeys.has(key)) {
        throw new BadRequestException({
          code: "INVALID_OPTION_KEY",
          message: "Lựa chọn không hợp lệ.",
        });
      }
    }
    if (selectedKeys.length === 0) {
      throw new BadRequestException({
        code: "NO_SELECTION",
        message: "Vui lòng chọn đáp án.",
      });
    }
    if (questionType === "single_choice" || questionType === "true_false") {
      if (selectedKeys.length !== 1) {
        throw new BadRequestException({
          code: "SINGLE_CHOICE_REQUIRED",
          message: "Chỉ được chọn một đáp án.",
        });
      }
    }
    if (questionType === "multiple_choice" && new Set(selectedKeys).size !== selectedKeys.length) {
      throw new BadRequestException({
        code: "DUPLICATE_SELECTION",
        message: "Không được chọn trùng đáp án.",
      });
    }
  }
}
