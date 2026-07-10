import { BadRequestException, Injectable } from "@nestjs/common";
import type { AdminRole } from "@prisma/client";
import type {
  AdminNotificationItem,
  AdminNotificationsRecentResponse,
} from "@practice-exam/types";
import type { AdminAuthPayload } from "../admin-auth/admin-auth.service";
import { PrismaService } from "../prisma/prisma.service";

const DEFAULT_LOOKBACK_MS = 24 * 60 * 60 * 1000;
const MAX_EVENTS = 50;

@Injectable()
export class AdminNotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listRecent(
    admin: AdminAuthPayload,
    since?: string,
  ): Promise<AdminNotificationsRecentResponse> {
    const sinceDate = this.parseSince(since);
    const generatedAt = new Date();
    const role = admin.role as AdminRole;
    const canSeeRegistrations = role === "super_admin" || role === "support";
    const canSeePayments = role === "super_admin" || role === "finance";

    const items: AdminNotificationItem[] = [];

    if (canSeeRegistrations) {
      const users = await this.prisma.user.findMany({
        where: { createdAt: { gte: sinceDate } },
        orderBy: { createdAt: "desc" },
        take: MAX_EVENTS,
        select: {
          id: true,
          displayName: true,
          createdAt: true,
        },
      });

      for (const user of users) {
        items.push({
          id: `registration:${user.id}`,
          type: "registration",
          title: "Người dùng mới đăng ký",
          occurredAt: user.createdAt.toISOString(),
          href: `/users/${user.id}`,
          metadata: {
            userId: user.id,
            userDisplayName: user.displayName,
          },
        });
      }
    }

    if (canSeePayments) {
      const payments = await this.prisma.payment.findMany({
        where: {
          status: "paid",
          paidAt: { gte: sinceDate },
        },
        orderBy: { paidAt: "desc" },
        take: MAX_EVENTS,
        include: {
          user: { select: { id: true, displayName: true } },
        },
      });

      const subjectIds = [...new Set(payments.map((payment) => payment.subjectId))];
      const subjects =
        subjectIds.length > 0
          ? await this.prisma.subject.findMany({
              where: { id: { in: subjectIds } },
              select: { id: true, name: true },
            })
          : [];
      const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));

      for (const payment of payments) {
        if (!payment.paidAt) continue;
        const subject = subjectById.get(payment.subjectId);
        items.push({
          id: `payment:${payment.id}`,
          type: "payment",
          title: "Thanh toán mới",
          occurredAt: payment.paidAt.toISOString(),
          href: "/payments",
          metadata: {
            userId: payment.user.id,
            userDisplayName: payment.user.displayName,
            amountVnd: payment.amountVnd,
            subjectName: subject?.name,
          },
        });
      }
    }

    items.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

    return {
      items: items.slice(0, MAX_EVENTS),
      since: sinceDate.toISOString(),
      generatedAt: generatedAt.toISOString(),
    };
  }

  private parseSince(since?: string): Date {
    if (!since) {
      return new Date(Date.now() - DEFAULT_LOOKBACK_MS);
    }
    const parsed = new Date(since);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException({
        code: "INVALID_SINCE",
        message: "Tham số since phải là ISO-8601 hợp lệ.",
      });
    }
    return parsed;
  }
}
