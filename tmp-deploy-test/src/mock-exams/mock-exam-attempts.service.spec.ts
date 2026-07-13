import { ForbiddenException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { MockExamAttemptsService } from "./mock-exam-attempts.service";
import { MockExamsService } from "./mock-exams.service";
import { EntitlementsService } from "../entitlements/entitlements.service";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";

const plan = {
  sections: [
    {
      sectionOrder: 0,
      subjectId: "sub-1",
      questionIds: ["q-1", "q-2"],
      timeLimitMinutes: 30,
      weightPercent: 100,
    },
  ],
};

const persistedSectionScores = [
  {
    sectionIndex: 0,
    sectionOrder: 0,
    subjectId: "sub-1",
    weightPercent: 100,
    correctCount: 2,
    totalCount: 2,
    scorePercent: 100,
    weightedScore: 100,
  },
];

const templateView = {
  id: "tpl-1",
  subjectId: "sub-1",
  name: "Mock PLCK",
  description: null,
  status: "approved" as const,
  totalDurationMinutes: 60,
  passingScorePercent: 70,
  monthlyAttemptLimit: 3,
  sections: [
    {
      id: "sec-1",
      subjectId: "sub-1",
      sectionOrder: 0,
      questionCount: 2,
      timeLimitMinutes: 30,
      selectionMode: "randomized" as const,
      weightPercent: 100,
      fixedQuestionIds: null,
      difficultyRules: null,
      topicTags: [],
    },
  ],
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
};

describe("MockExamAttemptsService", () => {
  let service: MockExamAttemptsService;

  const attemptRecord = {
    id: "att-1",
    templateId: "tpl-1",
    userId: "user-1",
    periodKey: "2026-07",
    status: "in_progress" as const,
    phase: "in_section" as const,
    currentSectionIndex: 0,
    currentQuestionIndex: 0,
    sectionEndsAt: new Date(Date.now() + 30 * 60 * 1000),
    scorePercent: null,
    passed: null,
    sectionScores: null,
    questionIds: plan,
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    template: {
      id: "tpl-1",
      subjectId: "sub-1",
      name: "Mock PLCK",
      passingScorePercent: 70,
      totalDurationMinutes: 60,
      sections: templateView.sections,
    },
  };

  const mockPrisma = {
    mockExamAttempt: {
      findFirst: jest.fn(async () => null),
      findMany: jest.fn(async () => []),
      count: jest.fn(async () => 0),
      create: jest.fn(async () => attemptRecord),
      update: jest.fn(async ({ data }: { data: Record<string, unknown> }) => ({
        ...attemptRecord,
        ...data,
      })),
    },
    mockExamAnswer: {
      findMany: jest.fn(async () => []),
      upsert: jest.fn(async () => ({})),
    },
    question: {
      findFirst: jest.fn(async () => ({
        id: "q-1",
        stem: "Câu 1",
        questionType: "single_choice",
        options: [{ key: "A", text: "A" }],
        imageUrls: [],
        correctOptionKeys: ["A"],
        explanation: "Giải thích",
        status: "published",
      })),
      findMany: jest.fn(async () => [
        {
          id: "q-1",
          correctOptionKeys: ["A"],
          options: [{ key: "A", text: "A" }],
          questionType: "single_choice",
          stem: "Câu 1",
          explanation: "Giải thích",
        },
        {
          id: "q-2",
          correctOptionKeys: ["B"],
          options: [{ key: "B", text: "B" }],
          questionType: "single_choice",
          stem: "Câu 2",
          explanation: null,
        },
      ]),
    },
  };

  const mockExamsService = {
    listBySubject: jest.fn(async () => [templateView]),
    getAttemptStatus: jest.fn(async () => ({
      templateId: "tpl-1",
      periodKey: "2026-07",
      limit: 3,
      used: 0,
      remaining: 3,
    })),
    findById: jest.fn(async () => templateView),
    findApprovedForCandidate: jest.fn(async () => templateView),
    assertCanStartAttempt: jest.fn(async () => undefined),
    buildAttemptQuestionPlan: jest.fn(async () => plan),
  };

  const entitlementsService = {
    getMockExamAccess: jest.fn(async () => ({ allowed: true })),
  };

  const mockSubscriptions = {
    assertUserNotSuspended: jest.fn(async () => undefined),
    hasActiveSubscription: jest.fn(async () => false),
    expireStaleSubscriptions: jest.fn(async () => 0),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockExamAttemptsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MockExamsService, useValue: mockExamsService },
        { provide: EntitlementsService, useValue: entitlementsService },
        { provide: SubscriptionsService, useValue: mockSubscriptions },
      ],
    }).compile();

    service = module.get(MockExamAttemptsService);
  });

  it("lists candidate templates with attempt metadata", async () => {
    const list = await service.listCandidateTemplates("user-1", "sub-1");
    expect(list).toHaveLength(1);
    expect(list[0].canStart).toBe(true);
    expect(list[0].totalQuestions).toBe(2);
    expect(list[0].subjectIds).toEqual(["sub-1"]);
  });

  it("blocks free tier users from starting", async () => {
    entitlementsService.getMockExamAccess.mockResolvedValueOnce({
      allowed: false,
      reason: "FREE_TIER_ONLY",
    });
    await expect(service.startAttempt("user-1", "tpl-1")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("starts attempt with generated question plan", async () => {
    const attempt = await service.startAttempt("user-1", "tpl-1");
    expect(attempt.templateId).toBe("tpl-1");
    expect(mockExamsService.buildAttemptQuestionPlan).toHaveBeenCalledWith("tpl-1");
  });

  it("returns current question for active attempt", async () => {
    mockPrisma.mockExamAttempt.findFirst.mockResolvedValue(attemptRecord);
    const question = await service.getQuestion("user-1", "att-1");
    expect(question?.id).toBe("q-1");
    expect(question?.globalQuestionNumber).toBe(1);
  });

  it("returns persisted completed results and skips missing review questions", async () => {
    const completedAttempt = {
      ...attemptRecord,
      status: "completed" as const,
      phase: "completed" as const,
      scorePercent: 88,
      passed: true,
      sectionScores: persistedSectionScores,
      completedAt: new Date("2026-07-01T00:00:00.000Z"),
    };
    mockPrisma.mockExamAttempt.findFirst.mockResolvedValue(completedAttempt);
    mockPrisma.mockExamAnswer.findMany.mockResolvedValueOnce([
      { questionId: "q-1", selectedKeys: ["A"] },
      { questionId: "q-2", selectedKeys: ["B"] },
    ]);
    mockPrisma.question.findMany.mockResolvedValueOnce([
      {
        id: "q-1",
        correctOptionKeys: ["A"],
        options: [{ key: "A", text: "A" }],
        questionType: "single_choice",
        stem: "Câu 1",
        explanation: "Giải thích",
      },
    ]);

    const results = await service.getResults("user-1", "att-1");

    expect(results.scorePercent).toBe(88);
    expect(results.passed).toBe(true);
    expect(results.sectionBreakdown).toEqual(persistedSectionScores);
    expect(results.questionReviews).toHaveLength(1);
    expect(results.questionReviews?.[0].questionId).toBe("q-1");
  });
});
