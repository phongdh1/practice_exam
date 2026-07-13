import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../app.module";
import { ApiEnvelopeInterceptor } from "../common/interceptors/api-envelope.interceptor";
import { PrismaService } from "../prisma/prisma.service";

describe("HealthController (e2e)", () => {
  let app: INestApplication;

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
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
    app.useGlobalInterceptors(new ApiEnvelopeInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/v1/health returns 200 with envelope", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: "ok" });
    expect(res.body.data.timestamp).toBeDefined();
  });
});
