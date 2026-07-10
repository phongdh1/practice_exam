import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { getIctPeriodKey } from "@practice-exam/utils";
import request from "supertest";
import { AppModule } from "../app.module";
import { ApiEnvelopeInterceptor } from "../common/interceptors/api-envelope.interceptor";
import { ApiExceptionFilter } from "../common/filters/api-exception.filter";
import { PrismaService } from "../prisma/prisma.service";

describe("StudyController (e2e)", () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const userId = "11111111-1111-4111-8111-111111111111";
  const subjectId = "22222222-2222-4222-8222-222222222222";
  const periodKey = getIctPeriodKey();

  const questionIds = [
    "33333333-3333-4333-8333-333333333333",
    "33333333-3333-4333-8333-333333333334",
    "33333333-3333-4333-8333-333333333335",
    "33333333-3333-4333-8333-333333333336",
    "33333333-3333-4333-8333-333333333337",
    "33333333-3333-4333-8333-333333333338",
  ];

  const publishedQuestions = new Map(
    questionIds.map((id, index) => [
      id,
      {
        id,
        subjectId,
        status: "published",
        questionType: "single_choice",
        difficulty: "medium",
        stem: `Câu hỏi ${index + 1}`,
        tags: ["topic-a"],
        imageUrls: [],
        options: [{ key: "A", text: "Đáp án A" }, { key: "B", text: "Đáp án B" }],
        correctOptionKeys: ["A"],
        explanation: `Giải thích ${index + 1}`,
        publishedAt: new Date(),
      },
    ]),
  );

  const studyTierRows = new Map<string, { viewedCount: number }>();
  const studyViewLogs = new Set<string>();
  const freeTierRows = new Map<string, { usedCount: number }>();

  function viewLogKey(uid: string, sid: string, qid: string, pk: string) {
    return `${uid}:${sid}:${qid}:${pk}`;
  }

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $executeRaw: jest.fn(async () => 1),
    $transaction: jest.fn(async (fn: (tx: typeof mockPrisma) => unknown) => fn(mockPrisma)),
    subject: {
      findFirst: jest.fn(async ({ where }: { where: { id?: string; visibility?: string } }) => {
        if (where.id === subjectId && where.visibility === "active") {
          return { id: subjectId, pricing: { freeTierLimit: 20, studyTierLimit: 5 } };
        }
        return null;
      }),
      findMany: jest.fn(async () => []),
    },
    question: {
      findMany: jest.fn(async ({ where, skip = 0, take = 20 }: {
        where: { subjectId?: string; status?: string };
        skip?: number;
        take?: number;
      }) => {
        if (where.subjectId !== subjectId || where.status !== "published") return [];
        return [...publishedQuestions.values()]
          .slice(skip, skip + take)
          .map((q) => ({
            id: q.id,
            stem: q.stem,
            questionType: q.questionType,
            difficulty: q.difficulty,
            tags: q.tags,
            imageUrls: q.imageUrls,
          }));
      }),
      count: jest.fn(async ({ where }: { where: { subjectId?: string; status?: string } }) => {
        if (where.subjectId !== subjectId || where.status !== "published") return 0;
        return publishedQuestions.size;
      }),
      findFirst: jest.fn(async ({ where }: {
        where: { id?: string; subjectId?: string; status?: string };
      }) => {
        if (where.status !== "published" || where.subjectId !== subjectId || !where.id) return null;
        return publishedQuestions.get(where.id) ?? null;
      }),
    },
    studyTierUsage: {
      createMany: jest.fn(async ({ data }: {
        data: { userId: string; subjectId: string; periodKey: string; viewedCount: number };
      }) => {
        const key = `${data.userId}:${data.subjectId}:${data.periodKey}`;
        if (studyTierRows.has(key)) return { count: 0 };
        studyTierRows.set(key, { viewedCount: data.viewedCount });
        return { count: 1 };
      }),
      updateMany: jest.fn(async ({ where, data }: {
        where: {
          userId: string;
          subjectId: string;
          periodKey: string;
          viewedCount: { lt: number };
        };
        data: { viewedCount: { increment: number } };
      }) => {
        const key = `${where.userId}:${where.subjectId}:${where.periodKey}`;
        const row = studyTierRows.get(key);
        if (!row || row.viewedCount >= where.viewedCount.lt) return { count: 0 };
        row.viewedCount += data.viewedCount.increment;
        return { count: 1 };
      }),
      findUnique: jest.fn(async ({ where }: {
        where: { userId_subjectId_periodKey: { userId: string; subjectId: string; periodKey: string } };
      }) => {
        const { userId: uid, subjectId: sid, periodKey: pk } = where.userId_subjectId_periodKey;
        const row = studyTierRows.get(`${uid}:${sid}:${pk}`);
        return row ? { viewedCount: row.viewedCount } : null;
      }),
      findUniqueOrThrow: jest.fn(async ({ where }: {
        where: { userId_subjectId_periodKey: { userId: string; subjectId: string; periodKey: string } };
      }) => {
        const { userId: uid, subjectId: sid, periodKey: pk } = where.userId_subjectId_periodKey;
        const row = studyTierRows.get(`${uid}:${sid}:${pk}`);
        if (!row) throw new Error("not found");
        return { viewedCount: row.viewedCount };
      }),
    },
    studyViewLog: {
      create: jest.fn(async ({ data }: {
        data: { userId: string; subjectId: string; questionId: string; periodKey: string };
      }) => {
        const key = viewLogKey(data.userId, data.subjectId, data.questionId, data.periodKey);
        if (studyViewLogs.has(key)) {
          const err = new Error("unique violation");
          (err as Error & { code: string }).code = "P2002";
          throw err;
        }
        studyViewLogs.add(key);
        return data;
      }),
      findUnique: jest.fn(async ({ where }: {
        where: {
          userId_subjectId_questionId_periodKey: {
            userId: string;
            subjectId: string;
            questionId: string;
            periodKey: string;
          };
        };
      }) => {
        const key = viewLogKey(
          where.userId_subjectId_questionId_periodKey.userId,
          where.userId_subjectId_questionId_periodKey.subjectId,
          where.userId_subjectId_questionId_periodKey.questionId,
          where.userId_subjectId_questionId_periodKey.periodKey,
        );
        return studyViewLogs.has(key) ? { id: "log-1" } : null;
      }),
      findMany: jest.fn(async ({ where }: {
        where: { userId: string; subjectId: string; periodKey: string };
      }) => {
        return [...studyViewLogs]
          .map((key) => {
            const [uid, sid, qid, pk] = key.split(":");
            return { userId: uid, subjectId: sid, questionId: qid, periodKey: pk };
          })
          .filter(
            (log) =>
              log.userId === where.userId &&
              log.subjectId === where.subjectId &&
              log.periodKey === where.periodKey,
          )
          .map((log) => ({ questionId: log.questionId }));
      }),
    },
    freeTierUsage: {
      createMany: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(async ({ where }: {
        where: { userId_subjectId_periodKey: { userId: string; subjectId: string; periodKey: string } };
      }) => {
        const { userId: uid, subjectId: sid, periodKey: pk } = where.userId_subjectId_periodKey;
        const row = freeTierRows.get(`${uid}:${sid}:${pk}`);
        return row ? { usedCount: row.usedCount } : null;
      }),
      findUniqueOrThrow: jest.fn(),
      findMany: jest.fn(async () => []),
    },
    subscription: {
      findFirst: jest.fn(async () => null),
      findMany: jest.fn(async () => []),
      updateMany: jest.fn(async () => ({ count: 0 })),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => ({
        id: where.id,
        isSuspended: false,
      })),
      findUniqueOrThrow: jest.fn(async () => ({
        id: userId,
        isSuspended: false,
        identities: [],
      })),
    },
    systemSetting: {
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn(),
    },
    practiceSession: {
      findFirst: jest.fn(async () => null),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(async () => ({ count: 0 })),
    },
    practiceAnswer: {
      findUnique: jest.fn(),
      findMany: jest.fn(async () => []),
      create: jest.fn(),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalInterceptors(new ApiEnvelopeInterceptor());
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.init();

    jwtService = moduleFixture.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    studyTierRows.clear();
    studyViewLogs.clear();
    freeTierRows.clear();
    jest.clearAllMocks();
  });

  function authHeader() {
    const token = jwtService.sign(
      { sub: userId },
      { secret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret", expiresIn: "15m" },
    );
    return { Authorization: `Bearer ${token}` };
  }

  it("rejects unauthenticated study requests", async () => {
    const res = await request(app.getHttpServer()).get(
      `/api/v1/study/subjects/${subjectId}/questions`,
    );
    expect(res.status).toBe(401);
  });

  it("lists published questions without answer leakage", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/study/subjects/${subjectId}/questions`)
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(6);
    expect(res.body.data.studyTier.remaining).toBe(5);
    const json = JSON.stringify(res.body.data);
    expect(json).not.toContain("correctOptionKeys");
    expect(json).not.toContain("explanation");
    expect(json).not.toContain("isCorrect");
  });

  it("returns study tier status endpoint", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/study/subjects/${subjectId}/tier`)
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      subjectId,
      limit: 5,
      used: 0,
      remaining: 5,
      isAtLimit: false,
    });
  });

  it("consumes study views and leaves free tier unchanged", async () => {
    for (const qid of questionIds.slice(0, 5)) {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/study/subjects/${subjectId}/questions/${qid}`)
        .set(authHeader());
      expect(res.status).toBe(200);
      expect(res.body.data.correctOptionKeys).toEqual(["A"]);
    }

    expect(studyTierRows.get(`${userId}:${subjectId}:${periodKey}`)?.viewedCount).toBe(5);
    expect(freeTierRows.size).toBe(0);

    const sixth = await request(app.getHttpServer())
      .get(`/api/v1/study/subjects/${subjectId}/questions/${questionIds[5]}`)
      .set(authHeader());

    expect(sixth.status).toBe(403);
    expect(sixth.body.error.code).toBe("STUDY_TIER_EXCEEDED");
    expect(sixth.body.error.details.subscribeCta).toEqual({
      subjectId,
      action: "subscribe",
    });
  });

  it("re-viewing the same question does not increment study tier", async () => {
    const first = await request(app.getHttpServer())
      .get(`/api/v1/study/subjects/${subjectId}/questions/${questionIds[0]}`)
      .set(authHeader());
    expect(first.status).toBe(200);

    const second = await request(app.getHttpServer())
      .get(`/api/v1/study/subjects/${subjectId}/questions/${questionIds[0]}`)
      .set(authHeader());
    expect(second.status).toBe(200);

    expect(studyTierRows.get(`${userId}:${subjectId}:${periodKey}`)?.viewedCount).toBe(1);
  });

  it("concurrent duplicate detail requests consume only one study view", async () => {
    const qid = questionIds[0];
    const url = `/api/v1/study/subjects/${subjectId}/questions/${qid}`;

    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        request(app.getHttpServer()).get(url).set(authHeader()),
      ),
    );

    for (const res of results) {
      expect(res.status).toBe(200);
      expect(res.body.data.correctOptionKeys).toEqual(["A"]);
    }
    expect(studyTierRows.get(`${userId}:${subjectId}:${periodKey}`)?.viewedCount).toBe(1);
    expect(studyViewLogs.size).toBe(1);
  });

  it("subscribed user can list and detail all questions without consuming study tier", async () => {
    const futureEnd = new Date(Date.now() + 30 * 86_400_000);
    mockPrisma.subscription.findFirst.mockResolvedValue({
      id: "sub-active",
      userId,
      subjectId,
      status: "active",
      periodStart: new Date(),
      periodEnd: futureEnd,
    });

    const list = await request(app.getHttpServer())
      .get(`/api/v1/study/subjects/${subjectId}/questions`)
      .set(authHeader());
    expect(list.status).toBe(200);
    expect(list.body.data.studyTier.hasActiveSubscription).toBe(true);
    expect(list.body.data.studyTier.isAtLimit).toBe(false);

    for (const qid of questionIds) {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/study/subjects/${subjectId}/questions/${qid}`)
        .set(authHeader());
      expect(res.status).toBe(200);
      expect(res.body.data.studyTier.hasActiveSubscription).toBe(true);
    }

    expect(studyTierRows.size).toBe(0);
    expect(studyViewLogs.size).toBe(0);
  });

  it("returns 404 for non-published question detail", async () => {
    const draftId = "99999999-9999-4999-8999-999999999999";
    const res = await request(app.getHttpServer())
      .get(`/api/v1/study/subjects/${subjectId}/questions/${draftId}`)
      .set(authHeader());

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("QUESTION_NOT_FOUND");
  });
});
