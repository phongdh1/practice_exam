import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { Prisma as PrismaTypes } from "@prisma/client";
import type { FreeTierStatus, FreeTierUsageSummary, MockExamAccess, StudyTierStatus } from "@practice-exam/types";
import { getIctPeriodKey } from "@practice-exam/utils";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";

@Injectable()
export class EntitlementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async listFreeTierUsage(userId: string): Promise<FreeTierUsageSummary> {
    const periodKey = getIctPeriodKey();
    const subjects = await this.prisma.subject.findMany({
      where: { visibility: "active" },
      include: { pricing: true },
    });

    const usageRows = await this.prisma.freeTierUsage.findMany({
      where: { userId, periodKey },
    });
    const usageBySubjectId = new Map(usageRows.map((row) => [row.subjectId, row.usedCount]));

    const activeSubjectIds = await this.getActiveSubscriptionSubjectIds(userId);

    const items = subjects
      .filter((subject) => subject.pricing !== null)
      .map((subject) =>
        this.buildFreeTierStatus({
          subjectId: subject.id,
          limit: subject.pricing!.freeTierLimit,
          used: usageBySubjectId.get(subject.id) ?? 0,
          periodKey,
          hasActiveSubscription: activeSubjectIds.has(subject.id),
        }),
      );

    return { periodKey, items };
  }

  async getSubjectFreeTierStatus(userId: string, subjectId: string): Promise<FreeTierStatus> {
    const subject = await this.prisma.subject.findFirst({
      where: { id: subjectId, visibility: "active" },
      include: { pricing: true },
    });

    if (!subject?.pricing) {
      throw new NotFoundException({
        code: "SUBJECT_NOT_FOUND",
        message: "Không tìm thấy môn học.",
      });
    }

    const periodKey = getIctPeriodKey();
    const usage = await this.prisma.freeTierUsage.findUnique({
      where: {
        userId_subjectId_periodKey: { userId, subjectId, periodKey },
      },
    });
    const hasActiveSubscription = await this.hasActiveSubscription(userId, subjectId);

    return this.buildFreeTierStatus({
      subjectId,
      limit: subject.pricing.freeTierLimit,
      used: usage?.usedCount ?? 0,
      periodKey,
      hasActiveSubscription,
    });
  }

  async getStudyTierStatus(userId: string, subjectId: string): Promise<StudyTierStatus> {
    const subject = await this.prisma.subject.findFirst({
      where: { id: subjectId, visibility: "active" },
      include: { pricing: true },
    });

    if (!subject?.pricing) {
      throw new NotFoundException({
        code: "SUBJECT_NOT_FOUND",
        message: "Không tìm thấy môn học.",
      });
    }

    const periodKey = getIctPeriodKey();
    const usage = await this.prisma.studyTierUsage.findUnique({
      where: {
        userId_subjectId_periodKey: { userId, subjectId, periodKey },
      },
    });
    const hasActiveSubscription = await this.hasActiveSubscription(userId, subjectId);

    return this.buildStudyTierStatus({
      subjectId,
      limit: subject.pricing.studyTierLimit,
      used: usage?.viewedCount ?? 0,
      periodKey,
      hasActiveSubscription,
    });
  }

  async consumeFreeTierQuestion(userId: string, subjectId: string): Promise<FreeTierStatus> {
    if (await this.hasActiveSubscription(userId, subjectId)) {
      return this.getSubjectFreeTierStatus(userId, subjectId);
    }

    const subject = await this.prisma.subject.findFirst({
      where: { id: subjectId, visibility: "active" },
      include: { pricing: true },
    });

    if (!subject?.pricing) {
      throw new NotFoundException({
        code: "SUBJECT_NOT_FOUND",
        message: "Không tìm thấy môn học.",
      });
    }

    const periodKey = getIctPeriodKey();
    const limit = subject.pricing.freeTierLimit;

    return this.prisma.$transaction((tx) =>
      this.consumeFreeTierInTransaction(tx, userId, subjectId, periodKey, limit),
    );
  }

  async consumeStudyView(
    userId: string,
    subjectId: string,
    questionId: string,
  ): Promise<StudyTierStatus> {
    if (await this.hasActiveSubscription(userId, subjectId)) {
      return this.getStudyTierStatus(userId, subjectId);
    }

    const subject = await this.prisma.subject.findFirst({
      where: { id: subjectId, visibility: "active" },
      include: { pricing: true },
    });

    if (!subject?.pricing) {
      throw new NotFoundException({
        code: "SUBJECT_NOT_FOUND",
        message: "Không tìm thấy môn học.",
      });
    }

    const periodKey = getIctPeriodKey();
    const limit = subject.pricing.studyTierLimit;

    return this.prisma.$transaction((tx) =>
      this.consumeStudyViewInTransaction(tx, userId, subjectId, questionId, periodKey, limit),
    );
  }

  async consumeFreeTierQuestionInTransaction(
    tx: PrismaTypes.TransactionClient,
    userId: string,
    subjectId: string,
  ): Promise<FreeTierStatus> {
    if (await this.hasActiveSubscription(userId, subjectId)) {
      const subject = await tx.subject.findFirst({
        where: { id: subjectId, visibility: "active" },
        include: { pricing: true },
      });
      if (!subject?.pricing) {
        throw new NotFoundException({
          code: "SUBJECT_NOT_FOUND",
          message: "Không tìm thấy môn học.",
        });
      }
      const periodKey = getIctPeriodKey();
      const usage = await tx.freeTierUsage.findUnique({
        where: { userId_subjectId_periodKey: { userId, subjectId, periodKey } },
      });
      return this.buildFreeTierStatus({
        subjectId,
        limit: subject.pricing.freeTierLimit,
        used: usage?.usedCount ?? 0,
        periodKey,
        hasActiveSubscription: true,
      });
    }

    const subject = await tx.subject.findFirst({
      where: { id: subjectId, visibility: "active" },
      include: { pricing: true },
    });
    if (!subject?.pricing) {
      throw new NotFoundException({
        code: "SUBJECT_NOT_FOUND",
        message: "Không tìm thấy môn học.",
      });
    }

    const periodKey = getIctPeriodKey();
    return this.consumeFreeTierInTransaction(
      tx,
      userId,
      subjectId,
      periodKey,
      subject.pricing.freeTierLimit,
    );
  }

  private async consumeFreeTierInTransaction(
    tx: PrismaTypes.TransactionClient,
    userId: string,
    subjectId: string,
    periodKey: string,
    limit: number,
  ): Promise<FreeTierStatus> {
    const inserted = await tx.freeTierUsage.createMany({
      data: { userId, subjectId, periodKey, usedCount: 1 },
      skipDuplicates: true,
    });

    if (inserted.count === 1) {
      return this.buildFreeTierStatus({
        subjectId,
        limit,
        used: 1,
        periodKey,
        hasActiveSubscription: false,
      });
    }

    const updated = await tx.freeTierUsage.updateMany({
      where: {
        userId,
        subjectId,
        periodKey,
        usedCount: { lt: limit },
      },
      data: { usedCount: { increment: 1 } },
    });

    if (updated.count === 0) {
      const existing = await tx.freeTierUsage.findUnique({
        where: {
          userId_subjectId_periodKey: { userId, subjectId, periodKey },
        },
      });
      throw new ForbiddenException({
        code: "FREE_TIER_EXCEEDED",
        message: "Bạn đã dùng hết lượt miễn phí tháng này. Vui lòng đăng ký để tiếp tục luyện tập.",
        details: { subjectId, used: existing?.usedCount ?? limit, limit, periodKey },
      });
    }

    const row = await tx.freeTierUsage.findUniqueOrThrow({
      where: {
        userId_subjectId_periodKey: { userId, subjectId, periodKey },
      },
    });

    return this.buildFreeTierStatus({
      subjectId,
      limit,
      used: row.usedCount,
      periodKey,
      hasActiveSubscription: false,
    });
  }

  private async consumeStudyViewInTransaction(
    tx: PrismaTypes.TransactionClient,
    userId: string,
    subjectId: string,
    questionId: string,
    periodKey: string,
    limit: number,
  ): Promise<StudyTierStatus> {
    const existingView = await tx.studyViewLog.findUnique({
      where: {
        userId_subjectId_questionId_periodKey: { userId, subjectId, questionId, periodKey },
      },
    });
    if (existingView) {
      return this.fetchStudyTierStatusInTransaction(tx, userId, subjectId, periodKey, limit);
    }

    try {
      await tx.studyViewLog.create({
        data: { userId, subjectId, questionId, periodKey },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return this.fetchStudyTierStatusInTransaction(tx, userId, subjectId, periodKey, limit);
      }
      throw error;
    }

    const inserted = await tx.studyTierUsage.createMany({
      data: { userId, subjectId, periodKey, viewedCount: 1 },
      skipDuplicates: true,
    });

    if (inserted.count === 0) {
      const updated = await tx.studyTierUsage.updateMany({
        where: {
          userId,
          subjectId,
          periodKey,
          viewedCount: { lt: limit },
        },
        data: { viewedCount: { increment: 1 } },
      });

      if (updated.count === 0) {
        const existing = await tx.studyTierUsage.findUnique({
          where: {
            userId_subjectId_periodKey: { userId, subjectId, periodKey },
          },
        });
        throw new ForbiddenException({
          code: "STUDY_TIER_EXCEEDED",
          message: "Bạn đã dùng hết lượt xem Study Mode tháng này. Vui lòng đăng ký để tiếp tục.",
          details: {
            subjectId,
            used: existing?.viewedCount ?? limit,
            limit,
            periodKey,
            subscribeCta: { subjectId, action: "subscribe" },
          },
        });
      }
    }

    const row = await tx.studyTierUsage.findUniqueOrThrow({
      where: {
        userId_subjectId_periodKey: { userId, subjectId, periodKey },
      },
    });

    return this.buildStudyTierStatus({
      subjectId,
      limit,
      used: row.viewedCount,
      periodKey,
      hasActiveSubscription: false,
    });
  }

  private async fetchStudyTierStatusInTransaction(
    tx: PrismaTypes.TransactionClient,
    userId: string,
    subjectId: string,
    periodKey: string,
    limit: number,
  ): Promise<StudyTierStatus> {
    const row = await tx.studyTierUsage.findUnique({
      where: {
        userId_subjectId_periodKey: { userId, subjectId, periodKey },
      },
    });
    return this.buildStudyTierStatus({
      subjectId,
      limit,
      used: row?.viewedCount ?? 0,
      periodKey,
      hasActiveSubscription: false,
    });
  }

  async getMockExamAccess(userId: string, subjectId: string): Promise<MockExamAccess> {
    const allowed = await this.hasActiveSubscription(userId, subjectId);
    return allowed
      ? { allowed: true }
      : { allowed: false, reason: "NO_SUBSCRIPTION" };
  }

  async assertMockExamAccess(userId: string, subjectId: string): Promise<void> {
    const access = await this.getMockExamAccess(userId, subjectId);
    if (!access.allowed) {
      throw new ForbiddenException({
        code: "MOCK_EXAM_REQUIRES_SUBSCRIPTION",
        message: "Thi thử yêu cầu gói đăng ký. Free Tier không bao gồm thi thử.",
        details: { subjectId, reason: access.reason },
      });
    }
  }

  private async hasActiveSubscription(userId: string, subjectId: string): Promise<boolean> {
    return this.subscriptionsService.hasActiveSubscription(userId, subjectId);
  }

  private async getActiveSubscriptionSubjectIds(userId: string): Promise<Set<string>> {
    await this.subscriptionsService.expireStaleSubscriptions(userId);
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        userId,
        status: "active",
        periodEnd: { gt: new Date() },
      },
      select: { subjectId: true },
    });
    return new Set(subscriptions.map((sub) => sub.subjectId));
  }

  private buildFreeTierStatus(input: {
    subjectId: string;
    limit: number;
    used: number;
    periodKey: string;
    hasActiveSubscription: boolean;
  }): FreeTierStatus {
    const remaining = input.hasActiveSubscription
      ? input.limit
      : Math.max(0, input.limit - input.used);

    return {
      subjectId: input.subjectId,
      used: input.used,
      limit: input.limit,
      remaining: input.hasActiveSubscription ? input.limit : remaining,
      periodKey: input.periodKey,
      isAtLimit: !input.hasActiveSubscription && input.used >= input.limit,
      hasActiveSubscription: input.hasActiveSubscription,
    };
  }

  private buildStudyTierStatus(input: {
    subjectId: string;
    limit: number;
    used: number;
    periodKey: string;
    hasActiveSubscription: boolean;
  }): StudyTierStatus {
    const remaining = input.hasActiveSubscription
      ? input.limit
      : Math.max(0, input.limit - input.used);

    return {
      subjectId: input.subjectId,
      used: input.used,
      limit: input.limit,
      // Subscribed users have unlimited study access; UI should key off hasActiveSubscription.
      remaining: input.hasActiveSubscription ? input.limit : remaining,
      periodKey: input.periodKey,
      isAtLimit: !input.hasActiveSubscription && input.used >= input.limit,
      hasActiveSubscription: input.hasActiveSubscription,
    };
  }
}
