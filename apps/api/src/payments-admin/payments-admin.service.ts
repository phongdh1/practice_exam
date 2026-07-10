import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  PaymentChannel,
  PaymentProvider,
  PaymentStatus,
  Prisma,
} from "@prisma/client";
import type {
  AdminPaymentTransaction,
  AdminPromoCode,
  AdminReconciliationDay,
  AdminRevenueReport,
  PaginatedResult,
} from "@practice-exam/types";
import type { AdminAuthPayload } from "../admin-auth/admin-auth.service";
import { UserMergeService } from "../auth/user-merge.service";
import { PrismaService } from "../prisma/prisma.service";
import type {
  CreatePromoCodeDto,
  InitiateRefundDto,
  ListTransactionsQueryDto,
  ReconciliationQueryDto,
  RevenueReportQueryDto,
  UpdatePromoCodeDto,
} from "./dto/payments-admin.dto";

const ICT_OFFSET_MS = 7 * 60 * 60 * 1000;

function startOfIctDay(date: Date): Date {
  const ict = new Date(date.getTime() + ICT_OFFSET_MS);
  ict.setUTCHours(0, 0, 0, 0);
  return new Date(ict.getTime() - ICT_OFFSET_MS);
}

function endOfIctDay(date: Date): Date {
  const start = startOfIctDay(date);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

function formatIctDateKey(date: Date): string {
  const ict = new Date(date.getTime() + ICT_OFFSET_MS);
  const y = ict.getUTCFullYear();
  const m = String(ict.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ict.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function defaultReconciliationRange(): { from: Date; to: Date } {
  const now = new Date();
  const to = endOfIctDay(now);
  const from = startOfIctDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
  return { from, to };
}

function parseDateRange(
  from?: string,
  to?: string,
  fallback?: { from: Date; to: Date },
): { from: Date; to: Date } {
  if (!from && !to && fallback) return fallback;
  const range = fallback ?? { from: new Date(0), to: new Date() };
  const fromDate = from ? startOfIctDay(new Date(from)) : range.from;
  const toDate = to ? endOfIctDay(new Date(to)) : range.to;
  if (fromDate > toDate) {
    throw new BadRequestException({
      code: "INVALID_DATE_RANGE",
      message: "Khoảng thời gian không hợp lệ.",
    });
  }
  return { from: fromDate, to: toDate };
}

@Injectable()
export class PaymentsAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userMergeService: UserMergeService,
  ) {}

  async listTransactions(
    query: ListTransactionsQueryDto,
  ): Promise<PaginatedResult<AdminPaymentTransaction>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.PaymentWhereInput = {};

    if (query.provider) where.provider = query.provider;
    if (query.status) where.status = query.status;
    if (query.from || query.to) {
      const { from, to } = parseDateRange(query.from, query.to);
      where.createdAt = { gte: from, lte: to };
    }

    const [total, rows] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        include: {
          user: { select: { id: true, displayName: true } },
          subscription: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const subjectIds = [...new Set(rows.map((r) => r.subjectId))];
    const subjects = await this.prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, name: true, code: true },
    });
    const subjectById = new Map(subjects.map((s) => [s.id, s]));

    return {
      items: rows.map((row) => {
        const subject = subjectById.get(row.subjectId);
        return {
          id: row.id,
          userId: row.userId,
          userDisplayName: row.user.displayName,
          subjectId: row.subjectId,
          subjectName: subject?.name ?? row.subjectId,
          subjectCode: subject?.code ?? "",
          amountVnd: row.amountVnd,
          provider: row.provider,
          channel: row.channel,
          status: row.status,
          externalRef: row.externalRef,
          promoCode: row.promoCode,
          paidAt: row.paidAt?.toISOString() ?? null,
          createdAt: row.createdAt.toISOString(),
          subscriptionId: row.subscription?.id ?? null,
          subscriptionStatus: row.subscription?.status ?? null,
        };
      }),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getReconciliation(query: ReconciliationQueryDto): Promise<AdminReconciliationDay[]> {
    const { from, to } = parseDateRange(query.from, query.to, defaultReconciliationRange());
    const providers: PaymentProvider[] = query.provider ? [query.provider] : ["payos", "sepay"];

    const payments = await this.prisma.payment.findMany({
      where: {
        provider: query.provider ? query.provider : undefined,
        OR: [
          { paidAt: { gte: from, lte: to } },
          { paidAt: null, createdAt: { gte: from, lte: to } },
        ],
      },
      include: {
        webhookEvents: {
          where: { status: "processed" },
          select: { id: true, status: true },
        },
      },
    });

    const webhookEvents = await this.prisma.paymentWebhookEvent.findMany({
      where: {
        provider: query.provider ? query.provider : undefined,
        createdAt: { gte: from, lte: to },
      },
      select: {
        id: true,
        provider: true,
        status: true,
        paymentId: true,
        createdAt: true,
      },
    });

    const bucket = new Map<string, AdminReconciliationDay>();

    for (const provider of providers) {
      let cursor = startOfIctDay(from);
      while (cursor <= to) {
        const key = `${provider}:${formatIctDateKey(cursor)}`;
        bucket.set(key, {
          date: formatIctDateKey(cursor),
          provider,
          transactionCount: 0,
          grossRevenueVnd: 0,
          failedCount: 0,
          pendingCount: 0,
          discrepancyCount: 0,
        });
        cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
      }
    }

    for (const payment of payments) {
      const bucketDate =
        payment.status === "paid" && payment.paidAt ? payment.paidAt : payment.createdAt;
      const key = `${payment.provider}:${formatIctDateKey(bucketDate)}`;
      const entry = bucket.get(key);
      if (!entry) continue;

      entry.transactionCount += 1;
      if (payment.status === "paid") {
        entry.grossRevenueVnd += payment.amountVnd;
      } else if (payment.status === "failed" || payment.status === "cancelled") {
        entry.failedCount += 1;
      } else if (payment.status === "pending") {
        entry.pendingCount += 1;
      }

      if (!payment.isTest && payment.status !== "pending") {
        const hasProcessedWebhook = payment.webhookEvents.length > 0;
        const webhookSaysPaid = payment.status === "paid";
        if ((hasProcessedWebhook && !webhookSaysPaid) || (!hasProcessedWebhook && webhookSaysPaid)) {
          entry.discrepancyCount += 1;
        }
      }
    }

    for (const event of webhookEvents) {
      if (event.status === "processed" && !event.paymentId) {
        const key = `${event.provider}:${formatIctDateKey(event.createdAt)}`;
        const entry = bucket.get(key);
        if (entry) entry.discrepancyCount += 1;
      }
    }

    return [...bucket.values()].sort((a, b) =>
      a.date === b.date ? a.provider.localeCompare(b.provider) : a.date.localeCompare(b.date),
    );
  }

  async initiateRefund(
    paymentId: string,
    dto: InitiateRefundDto,
    admin: AdminAuthPayload,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { subscription: true, refunds: { where: { status: { in: ["pending", "confirmed"] } } } },
    });
    if (!payment) {
      throw new NotFoundException({
        code: "PAYMENT_NOT_FOUND",
        message: "Không tìm thấy giao dịch thanh toán.",
      });
    }
    if (payment.status !== "paid") {
      throw new BadRequestException({
        code: "PAYMENT_NOT_REFUNDABLE",
        message: "Chỉ có thể hoàn tiền giao dịch đã thanh toán.",
      });
    }
    if (payment.refunds.length > 0) {
      throw new BadRequestException({
        code: "REFUND_ALREADY_EXISTS",
        message: "Giao dịch đã có yêu cầu hoàn tiền.",
      });
    }

    const refund = await this.prisma.$transaction(async (tx) => {
      const created = await tx.paymentRefund.create({
        data: {
          paymentId: payment.id,
          amountVnd: payment.amountVnd,
          reason: dto.reason.trim(),
          status: "pending",
          adminId: admin.sub,
        },
      });

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "refunded" },
      });

      const subscription =
        payment.subscription ??
        (await tx.subscription.findFirst({
          where: {
            userId: payment.userId,
            subjectId: payment.subjectId,
            status: "active",
          },
          orderBy: { periodEnd: "desc" },
        }));

      if (subscription) {
        await this.revokeSubscriptionForRefund(subscription.id, payment.paidAt, tx);
      }

      if (payment.promoCode) {
        await this.decrementPromoUsage(payment.promoCode, tx);
      }

      // MVP: mock provider refund — real PayOS/SePay refund API deferred to post-MVP.
      const confirmed = await tx.paymentRefund.update({
        where: { id: created.id },
        data: {
          status: "confirmed",
          providerRef: `mock-refund-${payment.provider}-${payment.id}`,
          processedAt: new Date(),
        },
      });

      return confirmed;
    });

    await this.logAdminAction(admin, payment.userId, "admin.payment_refund", {
      paymentId: payment.id,
      refundId: refund.id,
      amountVnd: refund.amountVnd,
      reason: dto.reason,
    });

    return {
      id: refund.id,
      paymentId: refund.paymentId,
      amountVnd: refund.amountVnd,
      status: refund.status,
      reason: refund.reason,
      providerRef: refund.providerRef,
      createdAt: refund.createdAt.toISOString(),
      processedAt: refund.processedAt?.toISOString() ?? null,
    };
  }

  async getRevenueReport(query: RevenueReportQueryDto): Promise<AdminRevenueReport> {
    const { from, to } = parseDateRange(query.from, query.to, defaultReconciliationRange());

    const payments = await this.prisma.payment.findMany({
      where: {
        status: "paid",
        paidAt: { gte: from, lte: to },
      },
      select: {
        subjectId: true,
        channel: true,
        amountVnd: true,
        paidAt: true,
      },
    });

    const refunds = await this.prisma.paymentRefund.findMany({
      where: {
        status: "confirmed",
        processedAt: { gte: from, lte: to },
      },
      include: {
        payment: { select: { subjectId: true, channel: true, amountVnd: true } },
      },
    });

    const subjectIds = [...new Set(payments.map((p) => p.subjectId))];
    const subjects = await this.prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, name: true, code: true },
    });
    const subjectById = new Map(subjects.map((s) => [s.id, s]));

    const bySubject = new Map<string, { subjectId: string; subjectName: string; revenueVnd: number; count: number }>();
    const byChannel = new Map<PaymentChannel, { channel: PaymentChannel; revenueVnd: number; count: number }>();

    let totalRevenueVnd = 0;
    let totalCount = 0;

    for (const payment of payments) {
      totalRevenueVnd += payment.amountVnd;
      totalCount += 1;

      const subject = subjectById.get(payment.subjectId);
      const subjectKey = payment.subjectId;
      const subjectEntry = bySubject.get(subjectKey) ?? {
        subjectId: payment.subjectId,
        subjectName: subject?.name ?? payment.subjectId,
        revenueVnd: 0,
        count: 0,
      };
      subjectEntry.revenueVnd += payment.amountVnd;
      subjectEntry.count += 1;
      bySubject.set(subjectKey, subjectEntry);

      const channelEntry = byChannel.get(payment.channel) ?? {
        channel: payment.channel,
        revenueVnd: 0,
        count: 0,
      };
      channelEntry.revenueVnd += payment.amountVnd;
      channelEntry.count += 1;
      byChannel.set(payment.channel, channelEntry);
    }

    for (const refund of refunds) {
      const amount = refund.amountVnd;
      totalRevenueVnd -= amount;

      const subject = subjectById.get(refund.payment.subjectId);
      const subjectKey = refund.payment.subjectId;
      const subjectEntry = bySubject.get(subjectKey) ?? {
        subjectId: refund.payment.subjectId,
        subjectName: subject?.name ?? refund.payment.subjectId,
        revenueVnd: 0,
        count: 0,
      };
      subjectEntry.revenueVnd -= amount;
      bySubject.set(subjectKey, subjectEntry);

      const channelEntry = byChannel.get(refund.payment.channel) ?? {
        channel: refund.payment.channel,
        revenueVnd: 0,
        count: 0,
      };
      channelEntry.revenueVnd -= amount;
      byChannel.set(refund.payment.channel, channelEntry);
    }

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      totalRevenueVnd,
      totalCount,
      bySubject: [...bySubject.values()].sort((a, b) => b.revenueVnd - a.revenueVnd),
      byChannel: [...byChannel.values()],
    };
  }

  revenueReportToCsv(report: AdminRevenueReport): string {
    const lines = ["section,key,revenue_vnd,count"];
    lines.push(`total,,${report.totalRevenueVnd},${report.totalCount}`);
    for (const row of report.bySubject) {
      lines.push(`subject,${this.csvEscape(row.subjectName)},${row.revenueVnd},${row.count}`);
    }
    for (const row of report.byChannel) {
      lines.push(`channel,${row.channel},${row.revenueVnd},${row.count}`);
    }
    return lines.join("\n");
  }

  async listPromoCodes(): Promise<AdminPromoCode[]> {
    const rows = await this.prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((row) => this.toPromoCode(row));
  }

  async createPromoCode(dto: CreatePromoCodeDto, admin: AdminAuthPayload): Promise<AdminPromoCode> {
    if (dto.discountType === "percentage" && dto.discountValue > 100) {
      throw new BadRequestException({
        code: "INVALID_DISCOUNT",
        message: "Giảm giá phần trăm không được vượt quá 100.",
      });
    }

    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.promoCode.findUnique({ where: { code } });
    if (existing) {
      throw new BadRequestException({
        code: "PROMO_CODE_EXISTS",
        message: "Mã khuyến mãi đã tồn tại.",
      });
    }

    const row = await this.prisma.promoCode.create({
      data: {
        code,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        expiresAt: new Date(dto.expiresAt),
        usageLimit: dto.usageLimit,
        subjectIds: dto.subjectIds ?? [],
      },
    });

    await this.logAdminAction(admin, null, "admin.promo_code_create", { promoCodeId: row.id, code });

    return this.toPromoCode(row);
  }

  async updatePromoCode(
    id: string,
    dto: UpdatePromoCodeDto,
    admin: AdminAuthPayload,
  ): Promise<AdminPromoCode> {
    const existing = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        code: "PROMO_CODE_NOT_FOUND",
        message: "Không tìm thấy mã khuyến mãi.",
      });
    }

    const row = await this.prisma.promoCode.update({
      where: { id },
      data: {
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        usageLimit: dto.usageLimit,
        subjectIds: dto.subjectIds,
        isActive: dto.isActive,
      },
    });

    await this.logAdminAction(admin, null, "admin.promo_code_update", { promoCodeId: row.id });

    return this.toPromoCode(row);
  }

  async validatePromoForCheckout(input: {
    code: string;
    subjectId: string;
    amountVnd: number;
  }): Promise<{ discountedAmountVnd: number; promoCode: string }> {
    const code = input.code.trim().toUpperCase();
    const promo = await this.prisma.promoCode.findUnique({ where: { code } });
    if (!promo || !promo.isActive) {
      throw new BadRequestException({
        code: "PROMO_CODE_INVALID",
        message: "Mã khuyến mãi không hợp lệ.",
      });
    }
    if (promo.expiresAt < new Date()) {
      throw new BadRequestException({
        code: "PROMO_CODE_EXPIRED",
        message: "Mã khuyến mãi đã hết hạn.",
      });
    }
    if (promo.usageCount >= promo.usageLimit) {
      throw new BadRequestException({
        code: "PROMO_CODE_EXHAUSTED",
        message: "Mã khuyến mãi đã hết lượt sử dụng.",
      });
    }
    if (promo.subjectIds.length > 0 && !promo.subjectIds.includes(input.subjectId)) {
      throw new BadRequestException({
        code: "PROMO_CODE_NOT_APPLICABLE",
        message: "Mã khuyến mãi không áp dụng cho môn học này.",
      });
    }

    let discounted = input.amountVnd;
    if (promo.discountType === "percentage") {
      discounted = Math.max(0, Math.round(input.amountVnd * (1 - promo.discountValue / 100)));
    } else {
      discounted = Math.max(0, input.amountVnd - promo.discountValue);
    }

    return { discountedAmountVnd: discounted, promoCode: code };
  }

  async reservePromoUsage(code: string, tx: Prisma.TransactionClient): Promise<void> {
    const promo = await tx.promoCode.findUnique({ where: { code } });
    if (!promo || !promo.isActive || promo.expiresAt < new Date() || promo.usageCount >= promo.usageLimit) {
      throw new BadRequestException({
        code: "PROMO_CODE_EXHAUSTED",
        message: "Mã khuyến mãi đã hết lượt sử dụng.",
      });
    }

    const updated = await tx.promoCode.updateMany({
      where: { code, usageCount: promo.usageCount },
      data: { usageCount: { increment: 1 } },
    });
    if (updated.count === 0) {
      throw new BadRequestException({
        code: "PROMO_CODE_EXHAUSTED",
        message: "Mã khuyến mãi đã hết lượt sử dụng.",
      });
    }
  }

  async incrementPromoUsage(code: string, tx?: Prisma.TransactionClient): Promise<void> {
    const db = tx ?? this.prisma;
    await db.promoCode.update({
      where: { code },
      data: { usageCount: { increment: 1 } },
    });
  }

  async decrementPromoUsage(code: string, tx?: Prisma.TransactionClient): Promise<void> {
    const db = tx ?? this.prisma;
    const promo = await db.promoCode.findUnique({ where: { code } });
    if (!promo || promo.usageCount <= 0) return;
    await db.promoCode.update({
      where: { code },
      data: { usageCount: { decrement: 1 } },
    });
  }

  private async revokeSubscriptionForRefund(
    subscriptionId: string,
    paidAt: Date | null,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const subscription = await tx.subscription.findUnique({ where: { id: subscriptionId } });
    if (!subscription || subscription.status !== "active") return;

    const now = new Date();
    if (!paidAt) {
      await tx.subscription.update({
        where: { id: subscriptionId },
        data: { status: "revoked" },
      });
      return;
    }

    const totalMs = subscription.periodEnd.getTime() - subscription.periodStart.getTime();
    const elapsedMs = Math.max(0, now.getTime() - paidAt.getTime());
    const ratio = totalMs > 0 ? Math.min(1, elapsedMs / totalMs) : 1;
    const remainingMs = Math.max(0, Math.round(totalMs * (1 - ratio)));
    const newEnd = new Date(subscription.periodStart.getTime() + remainingMs);

    if (newEnd <= now || remainingMs === 0) {
      await tx.subscription.update({
        where: { id: subscriptionId },
        data: { status: "revoked" },
      });
    } else {
      await tx.subscription.update({
        where: { id: subscriptionId },
        data: { periodEnd: newEnd },
      });
    }
  }

  private toPromoCode(row: {
    id: string;
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    expiresAt: Date;
    usageLimit: number;
    usageCount: number;
    subjectIds: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): AdminPromoCode {
    return {
      id: row.id,
      code: row.code,
      discountType: row.discountType,
      discountValue: row.discountValue,
      expiresAt: row.expiresAt.toISOString(),
      usageLimit: row.usageLimit,
      usageCount: row.usageCount,
      subjectIds: row.subjectIds,
      isActive: row.isActive,
      isExpired: row.expiresAt < new Date(),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private async logAdminAction(
    admin: AdminAuthPayload,
    userId: string | null,
    action: string,
    details?: Record<string, unknown>,
  ): Promise<void> {
    await this.userMergeService.logAudit(userId, action, {
      adminId: admin.sub,
      adminUsername: admin.username,
      adminRole: admin.role,
      ...details,
    });
  }

  private csvEscape(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
