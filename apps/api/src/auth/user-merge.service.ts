import { Injectable } from "@nestjs/common";
import { Prisma, AuthProvider } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface MergeSummary {
  mergedUserIds: string[];
  survivorUserId: string;
  subscriptionsMerged: number;
  practiceSessionsMerged: number;
  mockExamAttemptsMerged: number;
  duplicateSubscriptionsResolved: number;
}

@Injectable()
export class UserMergeService {
  constructor(private readonly prisma: PrismaService) {}

  async mergeUsers(
    survivorId: string,
    duplicateId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<MergeSummary> {
    if (survivorId === duplicateId) {
      return {
        mergedUserIds: [],
        survivorUserId: survivorId,
        subscriptionsMerged: 0,
        practiceSessionsMerged: 0,
        mockExamAttemptsMerged: 0,
        duplicateSubscriptionsResolved: 0,
      };
    }

    const run = async (db: Prisma.TransactionClient) => {
      const [survivorUser, duplicateUser] = await Promise.all([
        db.user.findUniqueOrThrow({ where: { id: survivorId } }),
        db.user.findUniqueOrThrow({ where: { id: duplicateId } }),
      ]);

      if (duplicateUser.isSuspended && !survivorUser.isSuspended) {
        await db.user.update({
          where: { id: survivorId },
          data: { isSuspended: true },
        });
      }

      await db.authAuditLog.updateMany({
        where: { userId: duplicateId },
        data: { userId: survivorId },
      });

      const duplicateSubs = await db.subscription.findMany({
        where: { userId: duplicateId, status: "active" },
      });
      const survivorSubs = await db.subscription.findMany({
        where: { userId: survivorId, status: "active" },
      });

      let duplicateResolved = 0;
      for (const dup of duplicateSubs) {
        const existing = survivorSubs.find((s) => s.subjectId === dup.subjectId);
        if (existing) {
          duplicateResolved += 1;
          if (dup.periodEnd > existing.periodEnd) {
            await db.subscription.update({
              where: { id: existing.id },
              data: {
                periodEnd: dup.periodEnd,
                periodStart:
                  dup.periodStart < existing.periodStart
                    ? dup.periodStart
                    : existing.periodStart,
              },
            });
          }
          await db.subscription.delete({ where: { id: dup.id } });
        } else {
          await db.subscription.update({
            where: { id: dup.id },
            data: { userId: survivorId },
          });
        }
      }

      await db.subscription.updateMany({
        where: { userId: duplicateId, status: { not: "active" } },
        data: { userId: survivorId },
      });

      const duplicateUsage = await db.freeTierUsage.findMany({
        where: { userId: duplicateId },
      });
      for (const row of duplicateUsage) {
        const existing = await db.freeTierUsage.findUnique({
          where: {
            userId_subjectId_periodKey: {
              userId: survivorId,
              subjectId: row.subjectId,
              periodKey: row.periodKey,
            },
          },
        });
        if (existing) {
          await db.freeTierUsage.update({
            where: { id: existing.id },
            data: { usedCount: existing.usedCount + row.usedCount },
          });
          await db.freeTierUsage.delete({ where: { id: row.id } });
        } else {
          await db.freeTierUsage.update({
            where: { id: row.id },
            data: { userId: survivorId },
          });
        }
      }

      const duplicateIdentities = await db.authIdentity.findMany({
        where: { userId: duplicateId },
      });
      for (const identity of duplicateIdentities) {
        const sameKey = await db.authIdentity.findUnique({
          where: {
            provider_externalId: {
              provider: identity.provider,
              externalId: identity.externalId,
            },
          },
        });
        if (sameKey) {
          await db.authIdentity.delete({ where: { id: identity.id } });
        } else {
          await db.authIdentity.update({
            where: { id: identity.id },
            data: { userId: survivorId },
          });
        }
      }

      const practiceResult = await db.practiceSession.updateMany({
        where: { userId: duplicateId },
        data: { userId: survivorId },
      });

      const mockExamResult = await db.mockExamAttempt.updateMany({
        where: { userId: duplicateId },
        data: { userId: survivorId },
      });

      await db.payment.updateMany({
        where: { userId: duplicateId },
        data: { userId: survivorId },
      });

      await db.questionFlag.updateMany({
        where: { userId: duplicateId },
        data: { userId: survivorId },
      });

      await db.refreshToken.deleteMany({ where: { userId: duplicateId } });

      await db.user.delete({ where: { id: duplicateId } });

      return {
        mergedUserIds: [duplicateId],
        survivorUserId: survivorId,
        subscriptionsMerged: duplicateSubs.length,
        practiceSessionsMerged: practiceResult.count,
        mockExamAttemptsMerged: mockExamResult.count,
        duplicateSubscriptionsResolved: duplicateResolved,
      };
    };

    if (tx) {
      return run(tx);
    }
    return this.prisma.$transaction(run);
  }

  async logAudit(
    userId: string | null,
    action: string,
    details?: Record<string, unknown>,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prisma;
    await client.authAuditLog.create({
      data: {
        userId,
        action,
        details: details as Prisma.InputJsonValue | undefined,
      },
    });
  }

  providerLabel(provider: AuthProvider): string {
    const labels: Record<AuthProvider, string> = {
      email: "Email",
      google: "Google",
      zalo: "Zalo",
    };
    return labels[provider];
  }
}
