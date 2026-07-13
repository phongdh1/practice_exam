import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { getIctPeriodKey } from "@practice-exam/utils";
import request from "supertest";
import { AppModule } from "../app.module";
import { ApiEnvelopeInterceptor } from "../common/interceptors/api-envelope.interceptor";
import { ApiExceptionFilter } from "../common/filters/api-exception.filter";
import { PrismaService } from "../prisma/prisma.service";

describe("PracticeController (e2e)", () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const userId = "11111111-1111-4111-8111-111111111111";
  const subjectId = "22222222-2222-4222-8222-222222222222";
  const questionId = "33333333-3333-4333-8333-333333333333";
  const periodKey = getIctPeriodKey();

  type SessionRow = {
    id: string;
    userId: string;
    subjectId: string;
    status: string;
    answeredCount: number;
    correctCount: number;
    currentQuestionId: string | null;
    expiresAt: Date;
    lastActivityAt: Date;
    completedAt: Date | null;
  };

  const sessions = new Map<string, SessionRow>();
  const answers = new Map<string, { sessionId: string; questionId: string; selectedKeys: string[]; isCorrect: boolean }>();
  const freeTierRows = new Map<string, { usedCount: number }>();

  let sessionCounter = 0;

  function sessionKey(sessionId: string, questionId: string) {
    return `${sessionId}:${questionId}`;
  }

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $executeRaw: jest.fn(async () => 1),
    $transaction: jest.fn(async (fn: (tx: typeof mockPrisma) => unknown) => fn(mockPrisma)),
    subject: {
      findFirst: jest.fn(async ({ where }: { where: { id?: string; visibility?: string } }) => {
        if (where.id === subjectId && where.visibility === "active") {
          return { id: subjectId, pricing: { freeTierLimit: 2 } };
        }
        return null;
      }),
      findMany: jest.fn(async () => []),
    },
    question: {
      findFirst: jest.fn(async ({ where }: { where: { id?: string; subjectId?: string; status?: string } }) => {
        if (where.id === questionId && where.subjectId === subjectId && where.status === "published") {
          return {
            id: questionId,
            subjectId,
            status: "published",
            questionType: "single_choice",
            stem: "Câu hỏi thử",
            options: [{ key: "A", text: "Đáp án A" }, { key: "B", text: "Đáp án B" }],
            imageUrls: [],
            correctOptionKeys: ["A"],
            explanation: "Giải thích",
          };
        }
        return null;
      }),
      findMany: jest.fn(async ({ where }: { where: { subjectId?: string; status?: string; id?: { notIn?: string[] } } }) => {
        if (where.subjectId !== subjectId || where.status !== "published") return [];
        const excluded = where.id?.notIn ?? [];
        if (excluded.includes(questionId)) return [];
        return [
          {
            id: questionId,
            stem: "Câu hỏi thử",
            options: [{ key: "A", text: "Đáp án A" }, { key: "B", text: "Đáp án B" }],
            imageUrls: [],
            questionType: "single_choice",
          },
        ];
      }),
    },
    practiceSession: {
      findFirst: jest.fn(async ({ where, orderBy }: {
        where: {
          id?: string;
          userId?: string;
          subjectId?: string;
          status?: string;
          expiresAt?: { gt?: Date; lte?: Date };
        };
        orderBy?: { lastActivityAt: string };
      }) => {
        const rows = [...sessions.values()].filter((row) => {
          if (where.id && row.id !== where.id) return false;
          if (where.userId && row.userId !== where.userId) return false;
          if (where.subjectId && row.subjectId !== where.subjectId) return false;
          if (where.status && row.status !== where.status) return false;
          if (where.expiresAt?.gt && row.expiresAt <= where.expiresAt.gt) return false;
          if (where.expiresAt?.lte && row.expiresAt > where.expiresAt.lte) return false;
          return true;
        });
        if (orderBy?.lastActivityAt === "desc") {
          rows.sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
        }
        const row = rows[0];
        return row
          ? { ...row, subject: { name: "Pháp luật" } }
          : null;
      }),
      create: jest.fn(async ({ data }: { data: { userId: string; subjectId: string; expiresAt: Date } }) => {
        const inProgress = [...sessions.values()].find(
          (s) => s.userId === data.userId && s.subjectId === data.subjectId && s.status === "in_progress",
        );
        if (inProgress) {
          const err = new Error("unique violation");
          (err as Error & { code: string }).code = "P2002";
          throw err;
        }
        sessionCounter += 1;
        const id = `44444444-4444-4444-8444-${String(sessionCounter).padStart(12, "0")}`;
        const row: SessionRow = {
          id,
          userId: data.userId,
          subjectId: data.subjectId,
          status: "in_progress",
          answeredCount: 0,
          correctCount: 0,
          currentQuestionId: null,
          expiresAt: data.expiresAt,
          lastActivityAt: new Date(),
          completedAt: null,
        };
        sessions.set(id, row);
        return { ...row, subject: { name: "Pháp luật" } };
      }),
      update: jest.fn(async ({ where, data }: {
        where: { id: string };
        data: Record<string, unknown>;
      }) => {
        const row = sessions.get(where.id);
        if (!row) throw new Error("not found");
        if (data.status) row.status = data.status as string;
        if (data.currentQuestionId !== undefined) row.currentQuestionId = data.currentQuestionId as string | null;
        if (data.answeredCount && typeof data.answeredCount === "object" && "increment" in data.answeredCount) {
          row.answeredCount += (data.answeredCount as { increment: number }).increment;
        }
        if (data.correctCount && typeof data.correctCount === "object" && "increment" in data.correctCount) {
          row.correctCount += (data.correctCount as { increment: number }).increment;
        }
        if (data.expiresAt) row.expiresAt = data.expiresAt as Date;
        if (data.lastActivityAt) row.lastActivityAt = data.lastActivityAt as Date;
        if (data.completedAt) row.completedAt = data.completedAt as Date;
        sessions.set(where.id, row);
        return row;
      }),
      updateMany: jest.fn(async ({ where, data }: {
        where: { userId?: string; status?: string; expiresAt?: { lte: Date } };
        data: { status?: string; currentQuestionId?: null };
      }) => {
        let count = 0;
        for (const [id, row] of sessions) {
          if (where.userId && row.userId !== where.userId) continue;
          if (where.status && row.status !== where.status) continue;
          if (where.expiresAt?.lte && row.expiresAt > where.expiresAt.lte) continue;
          row.status = data.status ?? row.status;
          if (data.currentQuestionId === null) row.currentQuestionId = null;
          sessions.set(id, row);
          count += 1;
        }
        return { count };
      }),
    },
    practiceAnswer: {
      findUnique: jest.fn(async ({ where }: {
        where: { sessionId_questionId?: { sessionId: string; questionId: string } };
      }) => {
        const key = where.sessionId_questionId;
        if (!key) return null;
        return answers.get(sessionKey(key.sessionId, key.questionId)) ?? null;
      }),
      findMany: jest.fn(async ({ where }: { where: { sessionId: string } }) =>
        [...answers.values()].filter((a) => a.sessionId === where.sessionId),
      ),
      create: jest.fn(async ({ data }: {
        data: { sessionId: string; questionId: string; selectedKeys: string[]; isCorrect: boolean };
      }) => {
        const key = sessionKey(data.sessionId, data.questionId);
        if (answers.has(key)) {
          const err = new Error("unique violation");
          (err as Error & { code: string }).code = "P2002";
          throw err;
        }
        answers.set(key, data);
        return data;
      }),
    },
    freeTierUsage: {
      createMany: jest.fn(async ({ data }: { data: { userId: string; subjectId: string; periodKey: string; usedCount: number } }) => {
        const key = `${data.userId}:${data.subjectId}:${data.periodKey}`;
        if (freeTierRows.has(key)) return { count: 0 };
        freeTierRows.set(key, { usedCount: data.usedCount });
        return { count: 1 };
      }),
      updateMany: jest.fn(async ({ where, data }: {
        where: { userId: string; subjectId: string; periodKey: string; usedCount: { lt: number } };
        data: { usedCount: { increment: number } };
      }) => {
        const key = `${where.userId}:${where.subjectId}:${where.periodKey}`;
        const row = freeTierRows.get(key);
        if (!row || row.usedCount >= where.usedCount.lt) return { count: 0 };
        row.usedCount += data.usedCount.increment;
        return { count: 1 };
      }),
      findUnique: jest.fn(async ({ where }: {
        where: { userId_subjectId_periodKey: { userId: string; subjectId: string; periodKey: string } };
      }) => {
        const { userId: uid, subjectId: sid, periodKey: pk } = where.userId_subjectId_periodKey;
        const row = freeTierRows.get(`${uid}:${sid}:${pk}`);
        return row ? { usedCount: row.usedCount } : null;
      }),
      findUniqueOrThrow: jest.fn(async ({ where }: {
        where: { userId_subjectId_periodKey: { userId: string; subjectId: string; periodKey: string } };
      }) => {
        const { userId: uid, subjectId: sid, periodKey: pk } = where.userId_subjectId_periodKey;
        const row = freeTierRows.get(`${uid}:${sid}:${pk}`);
        if (!row) throw new Error("not found");
        return { usedCount: row.usedCount };
      }),
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
    sessions.clear();
    answers.clear();
    freeTierRows.clear();
    sessionCounter = 0;
    jest.clearAllMocks();
  });

  function authHeader() {
    const token = jwtService.sign(
      { sub: userId },
      { secret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret", expiresIn: "15m" },
    );
    return { Authorization: `Bearer ${token}` };
  }

  it("rejects unauthenticated practice requests", async () => {
    const res = await request(app.getHttpServer()).post("/api/v1/practice/sessions").send({
      subjectId,
    });
    expect(res.status).toBe(401);
  });

  it("starts session, fetches question, submits answer, and ends session", async () => {
    const startRes = await request(app.getHttpServer())
      .post("/api/v1/practice/sessions")
      .set(authHeader())
      .send({ subjectId });

    expect(startRes.status).toBe(201);
    expect(startRes.body.data.id).toBeDefined();
    const sessionId = startRes.body.data.id as string;

    const questionRes = await request(app.getHttpServer())
      .get(`/api/v1/practice/sessions/${sessionId}/question`)
      .set(authHeader());

    expect(questionRes.status).toBe(200);
    expect(questionRes.body.data.questionId).toBe(questionId);

    const answerRes = await request(app.getHttpServer())
      .post(`/api/v1/practice/sessions/${sessionId}/answer`)
      .set(authHeader())
      .send({ questionId, selectedKeys: ["A"] });

    expect(answerRes.status).toBe(201);
    expect(answerRes.body.data.isCorrect).toBe(true);

    const endRes = await request(app.getHttpServer())
      .post(`/api/v1/practice/sessions/${sessionId}/end`)
      .set(authHeader());

    expect(endRes.status).toBe(201);
    expect(endRes.body.data.answeredCount).toBe(1);
    expect(endRes.body.data.subjectName).toBe("Pháp luật");
  });

  it("returns 403 FREE_TIER_EXCEEDED when quota exhausted on question fetch", async () => {
    freeTierRows.set(`${userId}:${subjectId}:${periodKey}`, { usedCount: 2 });

    const startRes = await request(app.getHttpServer())
      .post("/api/v1/practice/sessions")
      .set(authHeader())
      .send({ subjectId });

    const sessionId = startRes.body.data.id as string;

    const questionRes = await request(app.getHttpServer())
      .get(`/api/v1/practice/sessions/${sessionId}/question`)
      .set(authHeader());

    expect(questionRes.status).toBe(403);
    expect(questionRes.body.error.code).toBe("FREE_TIER_EXCEEDED");
  });

  it("returns WRONG_QUESTION when answer questionId does not match bound question", async () => {
    const startRes = await request(app.getHttpServer())
      .post("/api/v1/practice/sessions")
      .set(authHeader())
      .send({ subjectId });

    const sessionId = startRes.body.data.id as string;

    await request(app.getHttpServer())
      .get(`/api/v1/practice/sessions/${sessionId}/question`)
      .set(authHeader());

    const wrongId = "55555555-5555-4555-8555-555555555555";
    const answerRes = await request(app.getHttpServer())
      .post(`/api/v1/practice/sessions/${sessionId}/answer`)
      .set(authHeader())
      .send({ questionId: wrongId, selectedKeys: ["A"] });

    expect(answerRes.status).toBe(400);
    expect(answerRes.body.error.code).toBe("WRONG_QUESTION");
  });

  it("GET active/:subjectId returns null when no in-progress session", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/practice/sessions/active/${subjectId}`)
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });
});
