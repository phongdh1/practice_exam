import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../app.module";
import { ApiEnvelopeInterceptor } from "../common/interceptors/api-envelope.interceptor";
import { PrismaService } from "../prisma/prisma.service";

describe("SubjectsController (e2e)", () => {
  let app: INestApplication;

  const mockSubjects = [
    {
      id: "sub-1",
      courseId: "course-1",
      course: { id: "course-1", code: "broker", name: "Broker Certification" },
      code: "plck",
      name: "Pháp luật chứng khoán",
      description: "Môn pháp luật",
      visibility: "active" as const,
      displayOrder: 1,
      pricing: { monthlyAmountVnd: 100_000, freeTierLimit: 20 },
    },
    {
      id: "sub-2",
      courseId: "course-1",
      course: { id: "course-1", code: "broker", name: "Broker Certification" },
      code: "ptbtc",
      name: "Phân tích báo cáo tài chính",
      description: null,
      visibility: "active" as const,
      displayOrder: 2,
      pricing: { monthlyAmountVnd: 80_000, freeTierLimit: 20 },
    },
  ];

  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    subject: {
      findMany: jest.fn(async () => mockSubjects),
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
    app.useGlobalInterceptors(new ApiEnvelopeInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/v1/subjects returns active catalog with pricing", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/subjects");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0]).toMatchObject({
      code: "plck",
      name: "Pháp luật chứng khoán",
      courseId: "course-1",
      courseCode: "broker",
      courseName: "Broker Certification",
      monthlyPriceVnd: 100_000,
      freeTierLimit: 20,
    });
    expect(mockPrisma.subject.findMany).toHaveBeenCalledWith({
      where: { visibility: "active", course: { visibility: "active" } },
      include: { pricing: true, course: true },
      orderBy: [{ course: { displayOrder: "asc" } }, { displayOrder: "asc" }, { name: "asc" }],
    });
  });
});
