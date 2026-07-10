import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { SubscriptionSummary } from "@practice-exam/types";
import type { SubjectSubscriptionView } from "@practice-exam/utils";
import { PrismaService } from "../prisma/prisma.service";
import { addOneMonth, daysUntilExpiry } from "./subscription-period";

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string): Promise<SubscriptionSummary[]> {
    await this.expireStaleSubscriptions(userId);
    const rows = await this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { periodEnd: "desc" },
    });
    return rows.map((row) => this.toSummary(row));
  }

  async getForSubject(userId: string, subjectId: string): Promise<SubscriptionSummary | null> {
    await this.expireStaleSubscriptions(userId);
    const row = await this.prisma.subscription.findFirst({
      where: { userId, subjectId, status: "active" },
      orderBy: { periodEnd: "desc" },
    });
    if (!row) return null;
    return this.toSummary(row);
  }

  async getSubjectSubscriptionView(
    userId: string,
    subjectId: string,
  ): Promise<SubjectSubscriptionView | null> {
    const summary = await this.getForSubject(userId, subjectId);
    if (!summary) return null;
    return {
      status: summary.status,
      expiresAt: summary.periodEnd,
    };
  }

  async assertUserNotSuspended(userId: string): Promise<void> {
    if (await this.isUserSuspended(userId)) {
      throw new ForbiddenException({
        code: "ACCOUNT_SUSPENDED",
        message: "Tài khoản của bạn đã bị tạm khóa.",
      });
    }
  }

  async isUserSuspended(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isSuspended: true },
    });
    return user?.isSuspended ?? false;
  }

  async hasActiveSubscription(userId: string, subjectId: string): Promise<boolean> {
    if (await this.isUserSuspended(userId)) return false;
    const view = await this.getSubjectSubscriptionView(userId, subjectId);
    return view?.status === "active" || view?.status === "expiring";
  }

  async manualGrant(input: {
    userId: string;
    subjectId: string;
  }): Promise<SubscriptionSummary> {
    if (await this.isUserSuspended(input.userId)) {
      throw new BadRequestException({
        code: "USER_SUSPENDED",
        message: "Không thể cấp gói cho tài khoản đang bị tạm khóa.",
      });
    }

    await this.assertSubjectExists(input.subjectId);
    await this.expireStaleSubscriptions(input.userId);
    const now = new Date();
    const periodEnd = addOneMonth(now);

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.subscription.findFirst({
        where: {
          userId: input.userId,
          subjectId: input.subjectId,
          status: "active",
          periodEnd: { gt: now },
        },
      });
      if (existing) {
        throw new BadRequestException({
          code: "SUBSCRIPTION_ALREADY_ACTIVE",
          message: "Người dùng đã có gói đăng ký đang hoạt động cho môn học này.",
        });
      }

      const row = await tx.subscription.create({
        data: {
          userId: input.userId,
          subjectId: input.subjectId,
          status: "active",
          periodStart: now,
          periodEnd,
          channel: "admin",
        },
      });
      return this.toSummary(row);
    });
  }

  async manualRevoke(userId: string, subscriptionId: string): Promise<SubscriptionSummary> {
    const row = await this.prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
    });
    if (!row) {
      throw new NotFoundException({
        code: "SUBSCRIPTION_NOT_FOUND",
        message: "Không tìm thấy gói đăng ký.",
      });
    }
    if (row.status !== "active") {
      throw new BadRequestException({
        code: "SUBSCRIPTION_NOT_REVOKABLE",
        message: "Chỉ có thể thu hồi gói đang hoạt động.",
      });
    }

    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: "revoked" },
    });
    return this.toSummary(updated);
  }

  async activateOrRenewFromPayment(
    input: {
      userId: string;
      subjectId: string;
      channel: string;
      paymentId: string;
      paidAt: Date;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<{ subscriptionId: string; periodStart: Date; periodEnd: Date }> {
    const run = async (db: Prisma.TransactionClient) => {
      const existing = await db.subscription.findFirst({
        where: {
          userId: input.userId,
          subjectId: input.subjectId,
          status: "active",
          periodEnd: { gt: input.paidAt },
        },
        orderBy: { periodEnd: "desc" },
      });

      if (existing) {
        const periodStart = existing.periodEnd;
        const periodEnd = addOneMonth(periodStart);
        const updated = await db.subscription.update({
          where: { id: existing.id },
          data: {
            periodEnd,
            channel: input.channel,
            paymentId: input.paymentId,
          },
        });
        return {
          subscriptionId: updated.id,
          periodStart,
          periodEnd,
        };
      }

      const periodStart = input.paidAt;
      const periodEnd = addOneMonth(periodStart);
      const created = await db.subscription.create({
        data: {
          userId: input.userId,
          subjectId: input.subjectId,
          status: "active",
          periodStart,
          periodEnd,
          channel: input.channel,
          paymentId: input.paymentId,
        },
      });
      return {
        subscriptionId: created.id,
        periodStart,
        periodEnd,
      };
    };

    return tx ? run(tx) : this.prisma.$transaction(run);
  }

  async expireStaleSubscriptions(userId?: string): Promise<number> {
    const now = new Date();
    const result = await this.prisma.subscription.updateMany({
      where: {
        status: "active",
        periodEnd: { lte: now },
        ...(userId ? { userId } : {}),
      },
      data: { status: "expired" },
    });
    return result.count;
  }

  resolveDisplayStatus(periodEnd: Date, status: string, now = new Date()): SubjectSubscriptionView["status"] {
    if (status !== "active") return "expired";
    if (periodEnd <= now) return "expired";
    if (daysUntilExpiry(periodEnd, now) <= 3) return "expiring";
    return "active";
  }

  private toSummary(row: {
    id: string;
    subjectId: string;
    status: string;
    periodStart: Date;
    periodEnd: Date;
    channel: string;
  }): SubscriptionSummary {
    const displayStatus = this.resolveDisplayStatus(row.periodEnd, row.status);
    return {
      id: row.id,
      subjectId: row.subjectId,
      status: displayStatus,
      periodStart: row.periodStart.toISOString(),
      periodEnd: row.periodEnd.toISOString(),
      channel: row.channel,
      daysUntilExpiry: daysUntilExpiry(row.periodEnd),
    };
  }

  async assertSubjectExists(subjectId: string): Promise<{ monthlyAmountVnd: number; name: string }> {
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
    return { monthlyAmountVnd: subject.pricing.monthlyAmountVnd, name: subject.name };
  }
}
