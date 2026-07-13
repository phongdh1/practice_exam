import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { getIctPeriodKey } from "@practice-exam/utils";
import request from "supertest";
import { AppModule } from "../app.module";
import { ApiEnvelopeInterceptor } from "../common/interceptors/api-envelope.interceptor";
import { ApiExceptionFilter } from "../common/filters/api-exception.filter";
import { PrismaService } from "../prisma/prisma.service";

describe("EntitlementsController (e2e)", () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const userId = "user-ent-1";
  const subjectId = "sub-1";
  const periodKey = getIctPeriodKey();

  const freeTierRows = new Map<string, { usedCount: number }>();

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(async (fn: (tx: typeof mockPrisma) => unknown) => fn(mockPrisma)),
    subject: {
      findFirst: jest.fn(async ({ where }: { where: { id: string } }) =>
        where.id === subjectId
          ? { id: subjectId, pricing: { freeTierLimit: 2 } }
          : null,
      ),
      findMany: jest.fn(),
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
        const { userId: uid, subjectId: sid, periodKey } = where.userId_subjectId_periodKey;
        const row = freeTierRows.get(`${uid}:${sid}:${periodKey}`);
        return row ? { usedCount: row.usedCount } : null;
      }),
      findUniqueOrThrow: jest.fn(async ({ where }: {
        where: { userId_subjectId_periodKey: { userId: string; subjectId: string; periodKey: string } };
      }) => {
        const { userId: uid, subjectId: sid, periodKey } = where.userId_subjectId_periodKey;
        const row = freeTierRows.get(`${uid}:${sid}:${periodKey}`);
        if (!row) throw new Error("not found");
        return { usedCount: row.usedCount };
      }),
      findMany: jest.fn(),
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

  it("POST consume returns 403 when free tier limit reached", async () => {
    freeTierRows.set(`${userId}:${subjectId}:${periodKey}`, { usedCount: 2 });

    const res = await request(app.getHttpServer())
      .post(`/api/v1/entitlements/${subjectId}/consume`)
      .set(authHeader());

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FREE_TIER_EXCEEDED");
  });

  it("POST consume increments usage when below limit", async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/entitlements/${subjectId}/consume`)
      .set(authHeader());

    expect(res.status).toBe(201);
    expect(res.body.data.used).toBe(1);
  });

  it("GET mock-exam returns denied without subscription", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/entitlements/${subjectId}/mock-exam`)
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ allowed: false, reason: "NO_SUBSCRIPTION" });
  });

  it("rejects unauthenticated consume requests", async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/entitlements/${subjectId}/consume`);

    expect(res.status).toBe(401);
  });
});
