import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type {
  AdminUserExportData,
  AdminUserProfile,
  AdminUserSearchResult,
  AdminUserTimelineEvent,
} from "@practice-exam/types";
import type { AdminAuthPayload } from "../admin-auth/admin-auth.service";
import { UserMergeService } from "../auth/user-merge.service";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import type {
  ForceMergeDto,
  GrantSubscriptionDto,
  RevokeSubscriptionDto,
} from "./dto/users-admin.dto";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class UsersAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly userMergeService: UserMergeService,
  ) {}

  async searchUsers(query: string, admin: AdminAuthPayload): Promise<AdminUserSearchResult[]> {
    const q = query.trim();
    if (!q) return [];

    let results: AdminUserSearchResult[];

    if (UUID_RE.test(q)) {
      const user = await this.prisma.user.findUnique({
        where: { id: q },
        include: { identities: true },
      });
      results = user ? [this.toSearchResult(user)] : [];
    } else {
      const identities = await this.prisma.authIdentity.findMany({
        where: {
          OR: [
            { externalId: { contains: q, mode: "insensitive" } },
            { user: { displayName: { contains: q, mode: "insensitive" } } },
          ],
        },
        include: { user: { include: { identities: true } } },
        take: 50,
      });

      const byUserId = new Map<string, AdminUserSearchResult>();
      for (const identity of identities) {
        if (!byUserId.has(identity.userId)) {
          byUserId.set(identity.userId, this.toSearchResult(identity.user));
        }
      }
      results = [...byUserId.values()];
    }

    if (results.length > 0) {
      await this.logAdminAction(admin, null, "admin.search_users", {
        query: q,
        resultCount: results.length,
        resultUserIds: results.map((r) => r.id),
      });
    }

    return results;
  }

  async getProfile(userId: string, admin: AdminAuthPayload): Promise<AdminUserProfile> {
    const user = await this.findUserOrThrow(userId);
    await this.logAdminAction(admin, userId, "admin.view_user_profile");

    const [subscriptions, practiceSessions, mockExamAttempts, timeline] = await Promise.all([
      this.subscriptionsService.listForUser(userId),
      this.prisma.practiceSession.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { subject: { select: { name: true, code: true } } },
      }),
      this.prisma.mockExamAttempt.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
        take: 20,
        include: { template: { select: { name: true } } },
      }),
      this.loadTimeline(userId),
    ]);

    return {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      isSuspended: user.isSuspended,
      createdAt: user.createdAt.toISOString(),
      identities: user.identities.map((identity) => ({
        provider: identity.provider,
        externalId: identity.externalId,
        linkedAt: identity.createdAt.toISOString(),
      })),
      subscriptions,
      practiceSessions: practiceSessions.map((session) => ({
        id: session.id,
        subjectId: session.subjectId,
        subjectName: session.subject.name,
        subjectCode: session.subject.code,
        status: session.status,
        answeredCount: session.answeredCount,
        correctCount: session.correctCount,
        createdAt: session.createdAt.toISOString(),
        completedAt: session.completedAt?.toISOString() ?? null,
      })),
      mockExamAttempts: mockExamAttempts.map((attempt) => ({
        id: attempt.id,
        templateId: attempt.templateId,
        templateName: attempt.template.name,
        status: attempt.status,
        scorePercent: attempt.scorePercent,
        startedAt: attempt.startedAt.toISOString(),
        completedAt: attempt.completedAt?.toISOString() ?? null,
      })),
      timeline,
    };
  }

  async grantSubscription(
    userId: string,
    dto: GrantSubscriptionDto,
    admin: AdminAuthPayload,
  ) {
    await this.findUserOrThrow(userId);
    const subscription = await this.subscriptionsService.manualGrant({
      userId,
      subjectId: dto.subjectId,
    });
    await this.logAdminAction(admin, userId, "admin.subscription.grant", {
      reason: dto.reason,
      subjectId: dto.subjectId,
      subscriptionId: subscription.id,
    });
    return subscription;
  }

  async revokeSubscription(
    userId: string,
    subscriptionId: string,
    dto: RevokeSubscriptionDto,
    admin: AdminAuthPayload,
  ) {
    await this.findUserOrThrow(userId);
    const subscription = await this.subscriptionsService.manualRevoke(userId, subscriptionId);
    await this.logAdminAction(admin, userId, "admin.subscription.revoke", {
      reason: dto.reason,
      subscriptionId,
    });
    return subscription;
  }

  async previewMerge(survivorId: string, duplicateId: string, admin: AdminAuthPayload) {
    if (survivorId === duplicateId) {
      throw new BadRequestException({
        code: "MERGE_SAME_USER",
        message: "Không thể gộp tài khoản với chính nó.",
      });
    }
    const [survivor, duplicate] = await Promise.all([
      this.findUserOrThrow(survivorId),
      this.findUserOrThrow(duplicateId),
    ]);

    const [survivorActiveSubs, duplicateSubs, duplicateSessions, duplicateAttempts] = await Promise.all([
      this.prisma.subscription.findMany({ where: { userId: survivorId, status: "active" } }),
      this.prisma.subscription.findMany({ where: { userId: duplicateId, status: "active" } }),
      this.prisma.practiceSession.count({ where: { userId: duplicateId } }),
      this.prisma.mockExamAttempt.count({ where: { userId: duplicateId } }),
    ]);

    const overlappingSubjects = duplicateSubs.filter((dup) =>
      survivorActiveSubs.some((s) => s.subjectId === dup.subjectId),
    );

    await this.logAdminAction(admin, survivorId, "admin.merge.preview", {
      survivorId,
      duplicateId,
    });

    return {
      survivor: {
        id: survivor.id,
        displayName: survivor.displayName,
        identityCount: survivor.identities.length,
        activeSubscriptions: survivorActiveSubs.length,
      },
      duplicate: {
        id: duplicate.id,
        displayName: duplicate.displayName,
        identityCount: duplicate.identities.length,
        activeSubscriptions: duplicateSubs.length,
      },
      summary: {
        subscriptionsToMerge: duplicateSubs.length,
        duplicateSubscriptionsResolved: overlappingSubjects.length,
        practiceSessionsToMerge: duplicateSessions,
        mockExamAttemptsToMerge: duplicateAttempts,
        identitiesToMerge: duplicate.identities.length,
      },
    };
  }

  async forceMerge(dto: ForceMergeDto, admin: AdminAuthPayload) {
    if (dto.survivorId === dto.duplicateId) {
      throw new BadRequestException({
        code: "MERGE_SAME_USER",
        message: "Không thể gộp tài khoản với chính nó.",
      });
    }
    await Promise.all([
      this.findUserOrThrow(dto.survivorId),
      this.findUserOrThrow(dto.duplicateId),
    ]);

    const summary = await this.prisma.$transaction(async (tx) => {
      const mergeSummary = await this.userMergeService.mergeUsers(
        dto.survivorId,
        dto.duplicateId,
        tx,
      );
      await this.userMergeService.logAudit(
        dto.survivorId,
        "admin.account.force_merge",
        {
          adminId: admin.sub,
          adminRole: admin.role,
          ticketReference: dto.ticketReference,
          survivorId: dto.survivorId,
          duplicateId: dto.duplicateId,
          summary: mergeSummary,
        },
        tx,
      );
      return mergeSummary;
    });

    return summary;
  }

  async exportUserData(
    userId: string,
    format: "json" | "csv",
    admin: AdminAuthPayload,
  ): Promise<{ content: string; contentType: string; filename: string }> {
    const user = await this.findUserOrThrow(userId);

    const [subscriptions, practiceSessions, mockExamAttempts] = await Promise.all([
      this.subscriptionsService.listForUser(userId),
      this.prisma.practiceSession.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { subject: { select: { name: true, code: true } } },
      }),
      this.prisma.mockExamAttempt.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
        include: { template: { select: { name: true } } },
      }),
    ]);

    await this.logAdminAction(admin, userId, "admin.user.export", { format });

    const exportData: AdminUserExportData = {
      profile: {
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isSuspended: user.isSuspended,
        createdAt: user.createdAt.toISOString(),
      },
      identities: user.identities.map((identity) => ({
        provider: identity.provider,
        externalId: identity.externalId,
        linkedAt: identity.createdAt.toISOString(),
      })),
      subscriptions,
      practiceSessions: practiceSessions.map((session) => ({
        id: session.id,
        subjectId: session.subjectId,
        subjectName: session.subject.name,
        subjectCode: session.subject.code,
        status: session.status,
        answeredCount: session.answeredCount,
        correctCount: session.correctCount,
        createdAt: session.createdAt.toISOString(),
        completedAt: session.completedAt?.toISOString() ?? null,
      })),
      mockExamAttempts: mockExamAttempts.map((attempt) => ({
        id: attempt.id,
        templateId: attempt.templateId,
        templateName: attempt.template.name,
        status: attempt.status,
        scorePercent: attempt.scorePercent,
        startedAt: attempt.startedAt.toISOString(),
        completedAt: attempt.completedAt?.toISOString() ?? null,
      })),
    };

    if (format === "csv") {
      return {
        content: this.toCsv(exportData),
        contentType: "text/csv; charset=utf-8",
        filename: `user-${userId}-export.csv`,
      };
    }

    return {
      content: JSON.stringify(exportData, null, 2),
      contentType: "application/json; charset=utf-8",
      filename: `user-${userId}-export.json`,
    };
  }

  async suspendUser(userId: string, reason: string, admin: AdminAuthPayload) {
    const user = await this.findUserOrThrow(userId);
    if (user.isSuspended) {
      throw new BadRequestException({
        code: "ALREADY_SUSPENDED",
        message: "Tài khoản đã bị tạm khóa.",
      });
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { isSuspended: true },
      }),
      this.prisma.refreshToken.deleteMany({ where: { userId } }),
    ]);

    await this.logAdminAction(admin, userId, "admin.account.suspend", { reason });
    return { id: userId, isSuspended: true };
  }

  async unsuspendUser(userId: string, reason: string, admin: AdminAuthPayload) {
    const user = await this.findUserOrThrow(userId);
    if (!user.isSuspended) {
      throw new BadRequestException({
        code: "NOT_SUSPENDED",
        message: "Tài khoản không ở trạng thái tạm khóa.",
      });
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: false },
    });

    await this.logAdminAction(admin, userId, "admin.account.unsuspend", { reason });
    return { id: userId, isSuspended: false };
  }

  private async findUserOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { identities: true, subscriptions: true },
    });
    if (!user) {
      throw new NotFoundException({
        code: "USER_NOT_FOUND",
        message: "Không tìm thấy người dùng.",
      });
    }
    return user;
  }

  private toSearchResult(user: {
    id: string;
    displayName: string | null;
    isSuspended: boolean;
    createdAt: Date;
    identities: Array<{ provider: string; externalId: string }>;
  }): AdminUserSearchResult {
    const emailIdentity = user.identities.find((i) => i.provider === "email");
    const zaloIdentity = user.identities.find((i) => i.provider === "zalo");
    return {
      id: user.id,
      displayName: user.displayName,
      isSuspended: user.isSuspended,
      createdAt: user.createdAt.toISOString(),
      email: emailIdentity?.externalId ?? null,
      zaloId: zaloIdentity?.externalId ?? null,
      identityCount: user.identities.length,
    };
  }

  private async loadTimeline(userId: string): Promise<AdminUserTimelineEvent[]> {
    const logs = await this.prisma.authAuditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      details: (log.details as Record<string, unknown> | null) ?? null,
      createdAt: log.createdAt.toISOString(),
    }));
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

  private toCsv(data: AdminUserExportData): string {
    const lines: string[] = [];
    lines.push("section,field,value");
    lines.push(`profile,id,${this.csvEscape(data.profile.id)}`);
    lines.push(`profile,displayName,${this.csvEscape(data.profile.displayName ?? "")}`);
    lines.push(`profile,isSuspended,${data.profile.isSuspended}`);
    lines.push(`profile,createdAt,${this.csvEscape(data.profile.createdAt)}`);

    for (const identity of data.identities) {
      lines.push(
        `identity,${identity.provider},${this.csvEscape(`${identity.externalId} (${identity.linkedAt})`)}`,
      );
    }
    for (const sub of data.subscriptions) {
      lines.push(
        `subscription,${sub.subjectId},${this.csvEscape(`${sub.status} ${sub.periodStart}–${sub.periodEnd}`)}`,
      );
    }
    for (const session of data.practiceSessions) {
      lines.push(
        `practice,${session.id},${this.csvEscape(`${session.subjectName} ${session.status} ${session.answeredCount}/${session.correctCount}`)}`,
      );
    }
    for (const attempt of data.mockExamAttempts) {
      lines.push(
        `mock_exam,${attempt.id},${this.csvEscape(`${attempt.templateName} ${attempt.status} score=${attempt.scorePercent ?? "n/a"}`)}`,
      );
    }
    return lines.join("\n");
  }

  private csvEscape(value: string): string {
    const neutralized =
      value.startsWith("=") || value.startsWith("+") || value.startsWith("-") || value.startsWith("@")
        ? `'${value}`
        : value;
    if (neutralized.includes(",") || neutralized.includes('"') || neutralized.includes("\n")) {
      return `"${neutralized.replace(/"/g, '""')}"`;
    }
    return neutralized;
  }
}
