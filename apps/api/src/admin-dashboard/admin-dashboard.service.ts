import { Injectable } from "@nestjs/common";
import type { AdminRole } from "@prisma/client";
import type {
  AdminDashboardKpis,
  AdminDashboardSubscriptionRow,
} from "@practice-exam/types";
import type { AdminAuthPayload } from "../admin-auth/admin-auth.service";
import { roleHasCapability } from "../admin-auth/rbac/permission-matrix";
import { PaymentsAdminService } from "../payments-admin/payments-admin.service";
import { PrismaService } from "../prisma/prisma.service";

export const DASHBOARD_CACHE_TTL_MS = 5 * 60 * 1000;

const ICT_OFFSET_MS = 7 * 60 * 60 * 1000;

function startOfIctMonth(date: Date): Date {
  const ict = new Date(date.getTime() + ICT_OFFSET_MS);
  ict.setUTCDate(1);
  ict.setUTCHours(0, 0, 0, 0);
  return new Date(ict.getTime() - ICT_OFFSET_MS);
}

function endOfIctMonth(date: Date): Date {
  const ict = new Date(date.getTime() + ICT_OFFSET_MS);
  ict.setUTCMonth(ict.getUTCMonth() + 1, 0);
  ict.setUTCHours(23, 59, 59, 999);
  return new Date(ict.getTime() - ICT_OFFSET_MS);
}

type CachedAggregate<T> = { value: T; cachedAt: number; expiresAt: number };
type SectionResult<T> = { value: T; cachedAt: number };

@Injectable()
export class AdminDashboardService {
  private subscriptionsCache: CachedAggregate<AdminDashboardSubscriptionRow[]> | null = null;
  private revenueCache: CachedAggregate<NonNullable<AdminDashboardKpis["monthlyRevenue"]>> | null =
    null;
  private contentCache: CachedAggregate<NonNullable<AdminDashboardKpis["contentQueue"]>> | null =
    null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsAdminService: PaymentsAdminService,
  ) {}

  async getKpis(actor: AdminAuthPayload): Promise<AdminDashboardKpis> {
    const role = actor.role as AdminRole;
    const canViewSubscriptions = roleHasCapability(role, "manual_subscription_grant");
    const canViewRevenue = roleHasCapability(role, "payment_log_reconciliation");
    const canViewContent = roleHasCapability(role, "editorial_approve_reject");

    const cacheTimestamps: number[] = [];

    const subscriptionsBySubject = canViewSubscriptions
      ? await this.getSubscriptionsBySubject().then((section) => {
          cacheTimestamps.push(section.cachedAt);
          return section.value;
        })
      : null;

    const monthlyRevenue = canViewRevenue
      ? await this.getMonthlyRevenue().then((section) => {
          cacheTimestamps.push(section.cachedAt);
          return section.value;
        })
      : null;

    const contentQueue = canViewContent
      ? await this.getContentQueue().then((section) => {
          cacheTimestamps.push(section.cachedAt);
          return section.value;
        })
      : null;

    const generatedAtMs =
      cacheTimestamps.length > 0 ? Math.min(...cacheTimestamps) : Date.now();

    return {
      generatedAt: new Date(generatedAtMs).toISOString(),
      subscriptionsBySubject,
      monthlyRevenue,
      contentQueue,
    };
  }

  private async getSubscriptionsBySubject(): Promise<SectionResult<AdminDashboardSubscriptionRow[]>> {
    if (this.subscriptionsCache && this.subscriptionsCache.expiresAt > Date.now()) {
      return { value: this.subscriptionsCache.value, cachedAt: this.subscriptionsCache.cachedAt };
    }

    const now = new Date();
    const grouped = await this.prisma.subscription.groupBy({
      by: ["subjectId"],
      where: { status: "active", periodEnd: { gt: now } },
      _count: { _all: true },
    });

    const subjectIds = grouped.map((row) => row.subjectId);
    const subjects = await this.prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, name: true, code: true },
    });
    const subjectById = new Map(subjects.map((s) => [s.id, s]));

    const value = grouped
      .map((row) => ({
        subjectId: row.subjectId,
        subjectName: subjectById.get(row.subjectId)?.name ?? row.subjectId,
        subjectCode: subjectById.get(row.subjectId)?.code ?? "",
        activeCount: row._count._all,
      }))
      .sort((a, b) => b.activeCount - a.activeCount);

    const cachedAt = Date.now();
    this.subscriptionsCache = {
      value,
      cachedAt,
      expiresAt: cachedAt + DASHBOARD_CACHE_TTL_MS,
    };
    return { value, cachedAt };
  }

  private async getMonthlyRevenue(): Promise<
    SectionResult<NonNullable<AdminDashboardKpis["monthlyRevenue"]>>
  > {
    if (this.revenueCache && this.revenueCache.expiresAt > Date.now()) {
      return { value: this.revenueCache.value, cachedAt: this.revenueCache.cachedAt };
    }

    const now = new Date();
    const report = await this.paymentsAdminService.getRevenueReport({
      from: startOfIctMonth(now).toISOString(),
      to: endOfIctMonth(now).toISOString(),
    });

    const value = {
      from: report.from,
      to: report.to,
      totalRevenueVnd: report.totalRevenueVnd,
      totalCount: report.totalCount,
    };

    const cachedAt = Date.now();
    this.revenueCache = {
      value,
      cachedAt,
      expiresAt: cachedAt + DASHBOARD_CACHE_TTL_MS,
    };
    return { value, cachedAt };
  }

  private async getContentQueue(): Promise<
    SectionResult<NonNullable<AdminDashboardKpis["contentQueue"]>>
  > {
    if (this.contentCache && this.contentCache.expiresAt > Date.now()) {
      return { value: this.contentCache.value, cachedAt: this.contentCache.cachedAt };
    }

    const [editorialPending, flaggedOpen] = await Promise.all([
      this.prisma.question.count({ where: { status: "in_review" } }),
      this.prisma.questionFlag.count({ where: { status: { not: "resolved" } } }),
    ]);

    const value = { editorialPending, flaggedOpen };
    const cachedAt = Date.now();
    this.contentCache = {
      value,
      cachedAt,
      expiresAt: cachedAt + DASHBOARD_CACHE_TTL_MS,
    };
    return { value, cachedAt };
  }
}
