import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import * as bcrypt from "bcrypt";
import { AppModule } from "../app.module";
import { ApiEnvelopeInterceptor } from "../common/interceptors/api-envelope.interceptor";
import { ApiExceptionFilter } from "../common/filters/api-exception.filter";
import { PrismaService } from "../prisma/prisma.service";

describe("AuthController (e2e)", () => {
  let app: INestApplication;

  const users = new Map<string, {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    isSuspended: boolean;
    identities: {
      id: string;
      provider: string;
      externalId: string;
      passwordHash?: string;
      userId: string;
      createdAt?: Date;
    }[];
  }>();

  const refreshTokens = new Map<string, { userId: string; expiresAt: Date }>();
  const auditLogs: { action: string; userId: string | null }[] = [];

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(async (fn: (tx: typeof mockPrisma) => unknown) => fn(mockPrisma)),
    user: {
      create: jest.fn(async ({ data, include }: { data: Record<string, unknown>; include?: unknown }) => {
        const id = `user-${users.size + 1}`;
        const identityData = (data.identities as { create: Record<string, unknown> })?.create;
        const user = {
          id,
          displayName: (data.displayName as string) ?? null,
          avatarUrl: (data.avatarUrl as string) ?? null,
          isSuspended: false,
          identities: identityData
            ? [{
                id: `identity-${id}`,
                provider: identityData.provider as string,
                externalId: identityData.externalId as string,
                passwordHash: identityData.passwordHash as string | undefined,
                userId: id,
                createdAt: new Date("2026-06-29T00:00:00.000Z"),
              }]
            : [],
        };
        users.set(id, user);
        return include ? user : user;
      }),
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) => users.get(where.id) ?? null),
      findUniqueOrThrow: jest.fn(async ({ where }: { where: { id: string } }) => {
        const user = users.get(where.id);
        if (!user) throw new Error("not found");
        return user;
      }),
      delete: jest.fn(async ({ where }: { where: { id: string } }) => {
        users.delete(where.id);
      }),
    },
    authIdentity: {
      findUnique: jest.fn(async ({ where }: { where: { provider_externalId: { provider: string; externalId: string } } }) => {
        for (const user of users.values()) {
          const match = user.identities.find(
            (i) =>
              i.provider === where.provider_externalId.provider &&
              i.externalId === where.provider_externalId.externalId,
          );
          if (match) {
            return { ...match, user };
          }
        }
        return null;
      }),
      create: jest.fn(async ({ data }: { data: Record<string, string> }) => {
        const user = users.get(data.userId);
        if (!user) throw new Error("user not found");
        const identity = {
          id: `identity-${user.identities.length + 1}`,
          provider: data.provider,
          externalId: data.externalId,
          userId: data.userId,
        };
        user.identities.push(identity);
        return identity;
      }),
      updateMany: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(async ({ data }: { data: { userId: string; tokenHash: string; expiresAt: Date } }) => {
        refreshTokens.set(data.tokenHash, { userId: data.userId, expiresAt: data.expiresAt });
        return { id: "rt-1", ...data };
      }),
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    authAuditLog: {
      create: jest.fn(async ({ data }: { data: { userId: string | null; action: string } }) => {
        auditLogs.push(data);
        return data;
      }),
    },
    zaloOAuthEvent: {
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => ({
        id: "zalo-event-1",
        ...data,
      })),
    },
    systemSetting: {
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn(),
    },
    integrationAuditLog: {
      create: jest.fn(),
    },
    subscription: {
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      delete: jest.fn(),
    },
    practiceSession: {
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
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
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    users.clear();
    refreshTokens.clear();
    auditLogs.length = 0;
    jest.clearAllMocks();
  });

  it("POST /auth/register creates user and returns tokens", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email: "candidate@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe("candidate@example.com");
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();
    expect(users.size).toBe(1);
  });

  it("POST /auth/login resolves existing user", async () => {
    const hash = await bcrypt.hash("password123", 10);
    users.set("user-1", {
      id: "user-1",
      displayName: "Candidate",
      avatarUrl: null,
      isSuspended: false,
      identities: [{
        id: "id-1",
        provider: "email",
        externalId: "candidate@example.com",
        passwordHash: hash,
        userId: "user-1",
        createdAt: new Date("2026-06-29T00:00:00.000Z"),
      }],
    });

    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "candidate@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.data.tokens.accessToken).toBeDefined();
  });

  it("POST /auth/login returns Vietnamese error for invalid credentials", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "missing@example.com", password: "wrong" });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toContain("Email hoặc mật khẩu");
    expect(res.body.data).toBeUndefined();
  });

  it("POST /auth/zalo creates Zalo user", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/zalo")
      .send({ accessToken: "test-zalo-abc" });

    expect(res.status).toBe(201);
    expect(res.body.data.user.identities[0].provider).toBe("zalo");
  });

  it("POST /auth/link/zalo rejects unauthenticated requests", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/link/zalo")
      .send({ accessToken: "test-zalo-link" });

    expect(res.status).toBe(401);
  });

  it("GET /auth/me returns profile for authenticated user", async () => {
    const login = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email: "me@example.com", password: "password123", displayName: "Me User" });

    const token = login.body.data.tokens.accessToken as string;

    const res = await request(app.getHttpServer())
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.displayName).toBe("Me User");
    expect(res.body.data.identities[0].provider).toBe("email");
    expect(res.body.data.identities[0].linkedAt).toBeDefined();
  });

  it("GET /auth/me rejects unauthenticated requests", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /auth/me rejects suspended users", async () => {
    const login = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email: "suspended@example.com", password: "password123" });

    const token = login.body.data.tokens.accessToken as string;
    const userId = login.body.data.user.id as string;
    const user = users.get(userId);
    if (user) user.isSuspended = true;

    const res = await request(app.getHttpServer())
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
  });
});
