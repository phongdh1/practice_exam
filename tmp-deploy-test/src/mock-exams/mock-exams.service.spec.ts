import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { MockExamsService } from "./mock-exams.service";
import { PrismaService } from "../prisma/prisma.service";

const baseSection = {
  subjectId: "sub-1",
  sectionOrder: 0,
  questionCount: 2,
  timeLimitMinutes: 30,
  selectionMode: "randomized" as const,
  weightPercent: 100,
  topicTags: [],
};

describe("MockExamsService", () => {
  let service: MockExamsService;

  const templateRecord = {
    id: "tpl-1",
    subjectId: "sub-1",
    name: "Mock PLCK",
    description: null,
    status: "approved" as const,
    totalDurationMinutes: 60,
    passingScorePercent: 70,
    monthlyAttemptLimit: 3,
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-01"),
    sections: [
      {
        id: "sec-1",
        templateId: "tpl-1",
        ...baseSection,
        fixedQuestionIds: ["q-1", "q-2"],
        difficultyRules: { easy: 50, medium: 50, hard: 0 },
        createdAt: new Date("2026-06-01"),
        updatedAt: new Date("2026-06-01"),
      },
    ],
  };

  const draftTemplateRecord = {
    ...templateRecord,
    status: "draft" as const,
  };

  const publishedQuestions = [
    {
      id: "q-1",
      subjectId: "sub-1",
      status: "published",
      stem: "Câu 1",
      difficulty: "easy",
      tags: ["luật"],
    },
    {
      id: "q-2",
      subjectId: "sub-1",
      status: "published",
      stem: "Câu 2",
      difficulty: "medium",
      tags: ["luật"],
    },
    {
      id: "q-3",
      subjectId: "sub-1",
      status: "published",
      stem: "Câu 3",
      difficulty: "hard",
      tags: [],
    },
  ];

  const mockPrisma = {
    subject: {
      findUnique: jest.fn(async () => ({ id: "sub-1" })),
    },
    mockExamTemplate: {
      findMany: jest.fn(async () => [templateRecord]),
      findUnique: jest.fn(async () => templateRecord),
      create: jest.fn(async ({ data }: { data: { name: string } }) => ({
        ...templateRecord,
        name: data.name,
      })),
      update: jest.fn(async ({ data }: { data: { status?: string } }) => ({
        ...templateRecord,
        status: data.status ?? templateRecord.status,
      })),
    },
    mockExamSection: {
      deleteMany: jest.fn(),
    },
    mockExamAttempt: {
      count: jest.fn(async () => 1),
    },
    question: {
      findMany: jest.fn(async () => publishedQuestions),
      count: jest.fn(async () => publishedQuestions.length),
    },
    $transaction: jest.fn(),
  };

  mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) =>
    fn(mockPrisma),
  );

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockExamsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get(MockExamsService);
  });

  it("rejects sections when weight percentages do not sum to 100", async () => {
    await expect(
      service.create({
        subjectId: "sub-1",
        name: "Invalid weights",
        totalDurationMinutes: 60,
        passingScorePercent: 70,
        sections: [
          { ...baseSection, weightPercent: 60 },
          { ...baseSection, sectionOrder: 1, weightPercent: 30 },
        ],
      }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: "SECTION_WEIGHTS_INVALID" }),
    });
  });

  it("creates template with valid sections", async () => {
    const result = await service.create({
      subjectId: "sub-1",
      name: "PLCK Mock",
      totalDurationMinutes: 60,
      passingScorePercent: 70,
      sections: [baseSection],
    });

    expect(result.name).toBe("PLCK Mock");
    expect(mockPrisma.mockExamTemplate.create).toHaveBeenCalled();
  });

  it("generates preview from published question pool", async () => {
    const preview = await service.generatePreview("tpl-1");
    expect(preview.sections).toHaveLength(1);
    expect(preview.sections[0].questions).toHaveLength(2);
  });

  it("fails preview when pool lacks sufficient published questions", async () => {
    mockPrisma.question.findMany.mockResolvedValueOnce([publishedQuestions[0]]);
    await expect(service.generatePreview("tpl-1")).rejects.toMatchObject({
      response: expect.objectContaining({ code: "INSUFFICIENT_QUESTION_POOL" }),
    });
  });

  it("returns remaining attempt count for user", async () => {
    const status = await service.getAttemptStatus("user-1", "tpl-1");
    expect(status.limit).toBe(3);
    expect(status.used).toBe(1);
    expect(status.remaining).toBe(2);
  });

  it("blocks start when attempts exceeded", async () => {
    mockPrisma.mockExamAttempt.count.mockResolvedValueOnce(3);
    await expect(service.assertCanStartAttempt("user-1", "tpl-1")).rejects.toMatchObject({
      response: expect.objectContaining({ code: "MOCK_EXAM_ATTEMPTS_EXCEEDED" }),
    });
  });

  it("throws when template not found", async () => {
    mockPrisma.mockExamTemplate.findUnique.mockResolvedValueOnce(null as never);
    await expect(service.findById("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects invalid difficulty rule totals", async () => {
    await expect(
      service.create({
        subjectId: "sub-1",
        name: "Bad rules",
        totalDurationMinutes: 60,
        passingScorePercent: 70,
        sections: [
          {
            ...baseSection,
            difficultyRules: { easy: 40, medium: 40, hard: 10 },
          },
        ],
      }),
    ).rejects.toMatchObject({
      response: expect.objectContaining({ code: "DIFFICULTY_RULES_INVALID" }),
    });
  });

  it("listBySubject queries approved only and redacts sensitive section fields", async () => {
    mockPrisma.mockExamTemplate.findMany.mockResolvedValueOnce([templateRecord] as never);

    const results = await service.listBySubject("sub-1");

    expect(mockPrisma.mockExamTemplate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { subjectId: "sub-1", status: "approved" },
      }),
    );
    expect(results).toHaveLength(1);
    expect(results[0].sections[0]).not.toHaveProperty("fixedQuestionIds");
    expect(results[0].sections[0]).not.toHaveProperty("difficultyRules");
    expect(results[0]).not.toHaveProperty("status");
    expect(results[0].sections[0]).toMatchObject({
      id: "sec-1",
      questionCount: 2,
      selectionMode: "randomized",
    });
  });

  it("findApprovedForCandidate rejects draft templates", async () => {
    mockPrisma.mockExamTemplate.findUnique.mockResolvedValueOnce(draftTemplateRecord as never);
    await expect(service.findApprovedForCandidate("tpl-1")).rejects.toMatchObject({
      response: expect.objectContaining({ code: "MOCK_EXAM_NOT_AVAILABLE" }),
    });
  });

  it("blocks update on approved templates", async () => {
    mockPrisma.mockExamTemplate.findUnique.mockResolvedValueOnce(templateRecord as never);
    await expect(service.update("tpl-1", { name: "Renamed" })).rejects.toMatchObject({
      response: expect.objectContaining({ code: "MOCK_EXAM_TEMPLATE_APPROVED" }),
    });
  });

  it("allows update on draft templates", async () => {
    mockPrisma.mockExamTemplate.findUnique.mockResolvedValueOnce(draftTemplateRecord as never);
    mockPrisma.mockExamTemplate.update.mockResolvedValueOnce({
      ...draftTemplateRecord,
      name: "Renamed",
    } as never);

    const result = await service.update("tpl-1", { name: "Renamed" });
    expect(result.name).toBe("Renamed");
  });

  it("archive throws when template not found", async () => {
    mockPrisma.mockExamTemplate.findUnique.mockResolvedValueOnce(null as never);
    await expect(service.archive("missing")).rejects.toMatchObject({
      response: expect.objectContaining({ code: "MOCK_EXAM_TEMPLATE_NOT_FOUND" }),
    });
  });

  it("rejects getAttemptStatus for non-approved templates", async () => {
    mockPrisma.mockExamTemplate.findUnique.mockResolvedValueOnce(draftTemplateRecord as never);
    await expect(service.getAttemptStatus("user-1", "tpl-1")).rejects.toMatchObject({
      response: expect.objectContaining({ code: "MOCK_EXAM_NOT_AVAILABLE" }),
    });
  });

  it("rejects approve when question pool is insufficient", async () => {
    mockPrisma.mockExamTemplate.findUnique.mockResolvedValueOnce(draftTemplateRecord as never);
    mockPrisma.question.findMany.mockResolvedValueOnce([publishedQuestions[0]] as never);

    await expect(service.approve("tpl-1")).rejects.toMatchObject({
      response: expect.objectContaining({ code: "INSUFFICIENT_QUESTION_POOL" }),
    });
  });

  it("preserves fixedQuestionIds order for fixed sections", async () => {
    const fixedIds = ["q-2", "q-1"];
    const fixedSectionTemplate = {
      ...templateRecord,
      sections: [
        {
          ...templateRecord.sections[0],
          selectionMode: "fixed" as const,
          fixedQuestionIds: fixedIds,
        },
      ],
    };
    mockPrisma.mockExamTemplate.findUnique.mockResolvedValueOnce(fixedSectionTemplate as never);
    mockPrisma.question.findMany.mockResolvedValueOnce([
      publishedQuestions[0],
      publishedQuestions[1],
    ] as never);

    const preview = await service.generatePreview("tpl-1");

    expect(preview.sections[0].questions.map((q) => q.id)).toEqual(fixedIds);
  });

  it("rejects fixed section when a configured question id is missing", async () => {
    const fixedSectionTemplate = {
      ...templateRecord,
      sections: [
        {
          ...templateRecord.sections[0],
          selectionMode: "fixed" as const,
          fixedQuestionIds: ["q-1", "q-missing"],
        },
      ],
    };
    mockPrisma.mockExamTemplate.findUnique.mockResolvedValueOnce(fixedSectionTemplate as never);
    mockPrisma.question.findMany.mockResolvedValueOnce([publishedQuestions[0]] as never);

    await expect(service.generatePreview("tpl-1")).rejects.toMatchObject({
      response: expect.objectContaining({ code: "INSUFFICIENT_QUESTION_POOL" }),
    });
  });
});
