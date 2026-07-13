import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { SubjectsService } from "./subjects.service";
import { PrismaService } from "../prisma/prisma.service";
import { ContentComplianceService } from "../content-compliance/content-compliance.service";
import {
  DEFAULT_MIN_APPROVED_TEMPLATES_FOR_GO_LIVE,
  DEFAULT_MIN_PUBLISHED_QUESTIONS_FOR_GO_LIVE,
  DEFAULT_STUDY_TIER_LIMIT,
  MIN_SUBJECT_PRICE_VND,
} from "./subject.constants";

describe("SubjectsService", () => {
  let service: SubjectsService;

  const activeCourse = {
    id: "550e8400-e29b-41d4-a716-446655440001",
    code: "broker",
    name: "Broker Certification",
    visibility: "active" as const,
    displayOrder: 1,
  };

  const archivedCourse = {
    id: "550e8400-e29b-41d4-a716-446655440002",
    code: "archived-course",
    name: "Archived Course",
    visibility: "archived" as const,
    displayOrder: 2,
  };

  const mockSubjects = [
    {
      id: "sub-1",
      courseId: activeCourse.id,
      course: activeCourse,
      code: "plck",
      name: "Pháp luật chứng khoán",
      description: "Môn pháp luật",
      visibility: "active" as const,
      displayOrder: 1,
      topicTags: ["luật"],
      minPublishedQuestionsForGoLive: DEFAULT_MIN_PUBLISHED_QUESTIONS_FOR_GO_LIVE,
      minApprovedTemplatesForGoLive: DEFAULT_MIN_APPROVED_TEMPLATES_FOR_GO_LIVE,
      pricing: { monthlyAmountVnd: 100_000, freeTierLimit: 20 },
      createdAt: new Date("2026-06-01"),
      updatedAt: new Date("2026-06-01"),
    },
    {
      id: "sub-2",
      courseId: activeCourse.id,
      course: activeCourse,
      code: "ptbtc",
      name: "Phân tích báo cáo tài chính",
      description: null,
      visibility: "active" as const,
      displayOrder: 2,
      topicTags: [],
      minPublishedQuestionsForGoLive: DEFAULT_MIN_PUBLISHED_QUESTIONS_FOR_GO_LIVE,
      minApprovedTemplatesForGoLive: DEFAULT_MIN_APPROVED_TEMPLATES_FOR_GO_LIVE,
      pricing: { monthlyAmountVnd: 80_000, freeTierLimit: 20 },
      createdAt: new Date("2026-06-01"),
      updatedAt: new Date("2026-06-01"),
    },
    {
      id: "sub-no-pricing",
      courseId: activeCourse.id,
      course: activeCourse,
      code: "noprice",
      name: "Missing Pricing",
      description: null,
      visibility: "active" as const,
      displayOrder: 3,
      topicTags: [],
      minPublishedQuestionsForGoLive: DEFAULT_MIN_PUBLISHED_QUESTIONS_FOR_GO_LIVE,
      minApprovedTemplatesForGoLive: DEFAULT_MIN_APPROVED_TEMPLATES_FOR_GO_LIVE,
      pricing: null,
      createdAt: new Date("2026-06-01"),
      updatedAt: new Date("2026-06-01"),
    },
    {
      id: "sub-bad-copy",
      courseId: activeCourse.id,
      course: activeCourse,
      code: "badcopy",
      name: "Khóa guaranteed pass",
      description: null,
      visibility: "active" as const,
      displayOrder: 4,
      topicTags: [],
      minPublishedQuestionsForGoLive: DEFAULT_MIN_PUBLISHED_QUESTIONS_FOR_GO_LIVE,
      minApprovedTemplatesForGoLive: DEFAULT_MIN_APPROVED_TEMPLATES_FOR_GO_LIVE,
      pricing: { monthlyAmountVnd: 50_000, freeTierLimit: 10 },
      createdAt: new Date("2026-06-01"),
      updatedAt: new Date("2026-06-01"),
    },
    {
      id: "sub-archived",
      courseId: activeCourse.id,
      course: activeCourse,
      code: "archived",
      name: "Archived Subject",
      description: null,
      visibility: "archived" as const,
      displayOrder: 99,
      topicTags: [],
      minPublishedQuestionsForGoLive: DEFAULT_MIN_PUBLISHED_QUESTIONS_FOR_GO_LIVE,
      minApprovedTemplatesForGoLive: DEFAULT_MIN_APPROVED_TEMPLATES_FOR_GO_LIVE,
      pricing: { monthlyAmountVnd: 50_000, freeTierLimit: 10 },
      createdAt: new Date("2026-06-01"),
      updatedAt: new Date("2026-06-01"),
    },
    {
      id: "sub-archived-course-child",
      courseId: archivedCourse.id,
      course: archivedCourse,
      code: "archived-child",
      name: "Archived Course Child",
      description: null,
      visibility: "archived" as const,
      displayOrder: 6,
      topicTags: [],
      minPublishedQuestionsForGoLive: DEFAULT_MIN_PUBLISHED_QUESTIONS_FOR_GO_LIVE,
      minApprovedTemplatesForGoLive: DEFAULT_MIN_APPROVED_TEMPLATES_FOR_GO_LIVE,
      pricing: { monthlyAmountVnd: 50_000, freeTierLimit: 10 },
      createdAt: new Date("2026-06-01"),
      updatedAt: new Date("2026-06-01"),
    },
    {
      id: "sub-archived-course",
      courseId: archivedCourse.id,
      course: archivedCourse,
      code: "hidden-course",
      name: "Hidden Course Subject",
      description: null,
      visibility: "active" as const,
      displayOrder: 5,
      topicTags: [],
      minPublishedQuestionsForGoLive: DEFAULT_MIN_PUBLISHED_QUESTIONS_FOR_GO_LIVE,
      minApprovedTemplatesForGoLive: DEFAULT_MIN_APPROVED_TEMPLATES_FOR_GO_LIVE,
      pricing: { monthlyAmountVnd: 50_000, freeTierLimit: 10 },
      createdAt: new Date("2026-06-01"),
      updatedAt: new Date("2026-06-01"),
    },
    {
      id: "sub-custom-gate",
      courseId: activeCourse.id,
      course: activeCourse,
      code: "custom-gate",
      name: "Custom Gate Subject",
      description: null,
      visibility: "archived" as const,
      displayOrder: 7,
      topicTags: [],
      minPublishedQuestionsForGoLive: 50,
      minApprovedTemplatesForGoLive: 1,
      pricing: { monthlyAmountVnd: 50_000, freeTierLimit: 10 },
      createdAt: new Date("2026-06-01"),
      updatedAt: new Date("2026-06-01"),
    },
    {
      id: "sub-zero-gate",
      courseId: activeCourse.id,
      course: activeCourse,
      code: "zero-gate",
      name: "Zero Gate Subject",
      description: null,
      visibility: "archived" as const,
      displayOrder: 8,
      topicTags: [],
      minPublishedQuestionsForGoLive: 0,
      minApprovedTemplatesForGoLive: 0,
      pricing: { monthlyAmountVnd: 50_000, freeTierLimit: 10 },
      createdAt: new Date("2026-06-01"),
      updatedAt: new Date("2026-06-01"),
    },
  ];

  const mockPrisma = {
    subject: {
      findMany: jest.fn(
        async (args?: {
          where?: { visibility?: string; id?: { in?: string[] } };
          select?: { id?: boolean };
        }) => {
          if (args?.where?.visibility === "active") {
            return mockSubjects.filter(
              (s) => s.visibility === "active" && s.course.visibility === "active",
            );
          }
          if (args?.where?.id?.in) {
            return mockSubjects.filter((s) => args.where!.id!.in!.includes(s.id));
          }
          return mockSubjects;
        },
      ),
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) =>
        mockSubjects.find((s) => s.id === where.id) ?? null,
      ),
      create: jest.fn(),
      update: jest.fn(),
    },
    course: {
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) =>
        [activeCourse, archivedCourse].find((course) => course.id === where.id) ?? null,
      ),
    },
    question: {
      groupBy: jest.fn(async () => [
        { subjectId: "sub-1", _count: { _all: DEFAULT_MIN_PUBLISHED_QUESTIONS_FOR_GO_LIVE } },
        { subjectId: "sub-2", _count: { _all: 50 } },
        { subjectId: "sub-custom-gate", _count: { _all: 50 } },
      ]),
    },
    mockExamTemplate: {
      groupBy: jest.fn(async () => [
        { subjectId: "sub-1", _count: { _all: 1 } },
        { subjectId: "sub-2", _count: { _all: 0 } },
        { subjectId: "sub-custom-gate", _count: { _all: 1 } },
      ]),
    },
    $transaction: jest.fn(async (ops: unknown[]) => Promise.all(ops)),
  };

  const mockCompliance = {
    assertCompliant: jest.fn(),
    scan: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ContentComplianceService, useValue: mockCompliance },
      ],
    }).compile();

    service = module.get(SubjectsService);
  });

  it("returns active subjects with pricing and free tier limit", async () => {
    const result = await service.listActiveCatalog();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: "sub-1",
      courseId: activeCourse.id,
      courseCode: "broker",
      courseName: "Broker Certification",
      code: "plck",
      name: "Pháp luật chứng khoán",
      description: "Môn pháp luật",
      monthlyPriceVnd: 100_000,
      freeTierLimit: 20,
    });
  });

  it("excludes archived subjects from catalog", async () => {
    const result = await service.listActiveCatalog();
    expect(result.find((s) => s.code === "archived")).toBeUndefined();
  });

  it("excludes subjects under archived courses from catalog", async () => {
    const result = await service.listActiveCatalog();
    expect(result.find((s) => s.code === "hidden-course")).toBeUndefined();
  });

  it("excludes subjects with prohibited marketing copy", async () => {
    const result = await service.listActiveCatalog();
    expect(result.find((s) => s.code === "badcopy")).toBeUndefined();
  });

  it("excludes active subjects missing pricing", async () => {
    const result = await service.listActiveCatalog();
    expect(result.find((s) => s.code === "noprice")).toBeUndefined();
  });

  it("asserts compliance when creating a subject", async () => {
    mockPrisma.subject.create.mockResolvedValue({ id: "new-sub" });

    await service.createSubject({
      courseId: activeCourse.id,
      code: "new",
      name: "Môn mới",
      monthlyAmountVnd: 100_000,
      freeTierLimit: 20,
    });

    expect(mockCompliance.assertCompliant).toHaveBeenCalledWith("Môn mới", undefined);
    expect(mockPrisma.subject.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          courseId: activeCourse.id,
          pricing: {
            create: {
              monthlyAmountVnd: 100_000,
              freeTierLimit: 20,
              studyTierLimit: DEFAULT_STUDY_TIER_LIMIT,
            },
          },
        }),
      }),
    );
  });

  it("persists custom study tier limit on create", async () => {
    mockPrisma.subject.create.mockResolvedValue({ id: "new-sub" });

    await service.createSubject({
      courseId: activeCourse.id,
      code: "new",
      name: "Môn mới",
      monthlyAmountVnd: 100_000,
      freeTierLimit: 20,
      studyTierLimit: 10,
    });

    expect(mockPrisma.subject.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          pricing: {
            create: expect.objectContaining({
              freeTierLimit: 20,
              studyTierLimit: 10,
            }),
          },
        }),
      }),
    );
  });

  it("rejects invalid study tier limit", async () => {
    await expect(
      service.createSubject({
        courseId: activeCourse.id,
        code: "bad-study",
        name: "Bad study",
        monthlyAmountVnd: 100_000,
        freeTierLimit: 20,
        studyTierLimit: 0,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects creating a subject for an unknown course", async () => {
    mockPrisma.course.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.createSubject({
        courseId: "550e8400-e29b-41d4-a716-446655440099",
        code: "new",
        name: "Môn mới",
        monthlyAmountVnd: 100_000,
        freeTierLimit: 20,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects price below minimum VND floor", async () => {
    await expect(
      service.createSubject({
        courseId: activeCourse.id,
        code: "cheap",
        name: "Cheap",
        monthlyAmountVnd: 5_000,
        freeTierLimit: 20,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("reports go-live status with published question and template counts", async () => {
    const status = await service.getGoLiveStatus("sub-1");
    expect(status.publishedQuestionCount).toBe(DEFAULT_MIN_PUBLISHED_QUESTIONS_FOR_GO_LIVE);
    expect(status.approvedTemplateCount).toBe(1);
    expect(status.canActivate).toBe(true);
    expect(status.requirements).toEqual({
      minPublishedQuestions: DEFAULT_MIN_PUBLISHED_QUESTIONS_FOR_GO_LIVE,
      minApprovedTemplates: DEFAULT_MIN_APPROVED_TEMPLATES_FOR_GO_LIVE,
    });
  });

  it("blocks activation when go-live gate not met", async () => {
    await expect(service.activateSubject("sub-2")).rejects.toMatchObject({
      response: expect.objectContaining({ code: "SUBJECT_GO_LIVE_BLOCKED" }),
    });
  });

  it("activates subject when go-live gate is met", async () => {
    mockPrisma.subject.update.mockResolvedValue({ id: "sub-1", visibility: "active" });
    const result = await service.activateSubject("sub-1");
    expect(result.visibility).toBe("active");
  });

  it("uses per-subject custom thresholds for go-live status", async () => {
    const status = await service.getGoLiveStatus("sub-custom-gate");
    expect(status.requirements).toEqual({
      minPublishedQuestions: 50,
      minApprovedTemplates: 1,
    });
    expect(status.canActivate).toBe(true);
  });

  it("activates subject when custom go-live threshold is met", async () => {
    mockPrisma.subject.update.mockResolvedValue({ id: "sub-custom-gate", visibility: "active" });
    const result = await service.activateSubject("sub-custom-gate");
    expect(result.visibility).toBe("active");
  });

  it("allows activation when go-live gates are disabled with zero mins", async () => {
    const status = await service.getGoLiveStatus("sub-zero-gate");
    expect(status.canActivate).toBe(true);
    mockPrisma.subject.update.mockResolvedValue({ id: "sub-zero-gate", visibility: "active" });
    const result = await service.activateSubject("sub-zero-gate");
    expect(result.visibility).toBe("active");
  });

  it("blocks activation with dynamic message using configured thresholds", async () => {
    await expect(service.activateSubject("sub-2")).rejects.toMatchObject({
      response: expect.objectContaining({
        code: "SUBJECT_GO_LIVE_BLOCKED",
        message: expect.stringContaining("200"),
      }),
    });
  });

  it("blocks activation when parent course is archived", async () => {
    await expect(service.activateSubject("sub-archived-course-child")).rejects.toMatchObject({
      response: expect.objectContaining({ code: "COURSE_NOT_ACTIVE" }),
    });
  });

  it("throws when go-live status requested for unknown subject", async () => {
    mockPrisma.subject.findUnique.mockResolvedValueOnce(null);
    await expect(service.getGoLiveStatus("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("reorders subjects by display order", async () => {
    mockPrisma.subject.findMany
      .mockResolvedValueOnce([{ id: "sub-2" }, { id: "sub-1" }])
      .mockResolvedValueOnce([{ id: "sub-2" }, { id: "sub-1" }]);
    mockPrisma.subject.update.mockImplementation(async ({ data }: { data: { displayOrder: number } }) => ({
      displayOrder: data.displayOrder,
    }));

    const result = await service.reorderSubjects({ orderedIds: ["sub-2", "sub-1"] });
    expect(result.orderedIds).toEqual(["sub-2", "sub-1"]);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it("rejects incomplete subject reorder lists", async () => {
    mockPrisma.subject.findMany
      .mockResolvedValueOnce(mockSubjects.map((subject) => ({ id: subject.id })))
      .mockResolvedValueOnce([{ id: "sub-1" }]);

    await expect(service.reorderSubjects({ orderedIds: ["sub-1"] })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("updates blueprint topic tags", async () => {
    mockPrisma.subject.update.mockResolvedValue({
      id: "sub-1",
      topicTags: ["luật", "chứng khoán"],
    });

    const result = await service.updateBlueprint("sub-1", {
      topicTags: ["luật", "chứng khoán"],
    });
    expect(result.topicTags).toEqual(["luật", "chứng khoán"]);
  });

  it("throws when archiving unknown subject", async () => {
    mockPrisma.subject.findUnique.mockResolvedValueOnce(null);
    await expect(service.archiveSubject("missing")).rejects.toBeInstanceOf(NotFoundException);
  });
});
