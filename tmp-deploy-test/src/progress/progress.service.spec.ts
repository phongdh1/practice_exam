import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { ProgressService, MAX_ATTEMPT_HISTORY_ITEMS } from "./progress.service";

describe("ProgressService", () => {
  let service: ProgressService;

  const userId = "user-1";

  const mockPrisma = {
    practiceSession: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    mockExamAttempt: {
      findMany: jest.fn(),
    },
    subject: {
      findMany: jest.fn(),
    },
    question: {
      findMany: jest.fn(),
    },
  };

  const mockSubscriptions = {
    assertUserNotSuspended: jest.fn(async () => undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SubscriptionsService, useValue: mockSubscriptions },
      ],
    }).compile();

    service = module.get(ProgressService);
  });

  it("merges practice and mock attempts chronologically", async () => {
    mockPrisma.practiceSession.findMany.mockResolvedValue([
      {
        id: "ps-1",
        subjectId: "sub-1",
        answeredCount: 10,
        correctCount: 8,
        completedAt: new Date("2026-06-15T10:00:00Z"),
        createdAt: new Date("2026-06-15T09:00:00Z"),
        subject: { name: "Pháp luật" },
      },
    ]);
    mockPrisma.mockExamAttempt.findMany.mockResolvedValue([
      {
        id: "ma-1",
        scorePercent: 75,
        completedAt: new Date("2026-06-20T10:00:00Z"),
        startedAt: new Date("2026-06-20T08:00:00Z"),
        template: {
          name: "Đề thi thử 1",
          subjectId: "sub-1",
          subject: { name: "Pháp luật" },
        },
      },
    ]);

    const result = await service.listAttemptHistory(userId);
    expect(result.items).toHaveLength(2);
    expect(result.items[0]!.type).toBe("mock");
    expect(result.items[1]!.type).toBe("practice");
    expect(result.items[0]!.scorePercent).toBe(75);
    expect(mockPrisma.practiceSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: MAX_ATTEMPT_HISTORY_ITEMS }),
    );
    expect(mockPrisma.mockExamAttempt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: MAX_ATTEMPT_HISTORY_ITEMS }),
    );
  });

  it("returns empty history when user has no attempts", async () => {
    mockPrisma.practiceSession.findMany.mockResolvedValue([]);
    mockPrisma.mockExamAttempt.findMany.mockResolvedValue([]);

    const result = await service.listAttemptHistory(userId);
    expect(result.items).toEqual([]);
  });

  it("caps merged history at MAX_ATTEMPT_HISTORY_ITEMS", async () => {
    const practiceSessions = Array.from({ length: 60 }, (_, index) => ({
      id: `ps-${index}`,
      subjectId: "sub-1",
      answeredCount: 5,
      correctCount: 3,
      completedAt: new Date(Date.UTC(2026, 5, 1 + (index % 28), 10, 0, 0)),
      createdAt: new Date(Date.UTC(2026, 5, 1 + (index % 28), 9, 0, 0)),
      subject: { name: "Pháp luật" },
    }));
    const mockAttempts = Array.from({ length: 60 }, (_, index) => ({
      id: `ma-${index}`,
      scorePercent: 70,
      completedAt: new Date(Date.UTC(2026, 6, 1 + (index % 28), 10, 0, 0)),
      startedAt: new Date(Date.UTC(2026, 6, 1 + (index % 28), 8, 0, 0)),
      template: {
        name: `Đề ${index}`,
        subjectId: "sub-1",
        subject: { name: "Pháp luật" },
      },
    }));
    mockPrisma.practiceSession.findMany.mockResolvedValue(practiceSessions);
    mockPrisma.mockExamAttempt.findMany.mockResolvedValue(mockAttempts);

    const result = await service.listAttemptHistory(userId);
    expect(result.items).toHaveLength(MAX_ATTEMPT_HISTORY_ITEMS);
  });

  it("computes subject summaries for active subjects", async () => {
    mockPrisma.subject.findMany.mockResolvedValue([
      { id: "sub-1", name: "Pháp luật", code: "PL" },
    ]);
    mockPrisma.practiceSession.findMany.mockResolvedValue([
      {
        subjectId: "sub-1",
        answers: [
          { isCorrect: true },
          { isCorrect: false },
        ],
      },
    ]);
    mockPrisma.mockExamAttempt.findMany.mockResolvedValue([
      { scorePercent: 80, completedAt: new Date("2026-06-20T10:00:00Z"), template: { subjectId: "sub-1" } },
      { scorePercent: 60, completedAt: new Date("2026-06-15T10:00:00Z"), template: { subjectId: "sub-1" } },
      { scorePercent: null, completedAt: new Date("2026-06-10T10:00:00Z"), template: { subjectId: "sub-1" } },
    ]);

    const result = await service.getSubjectSummaries(userId, 30);
    expect(result.days).toBe(30);
    expect(result.subjects[0]).toMatchObject({
      subjectId: "sub-1",
      questionsAttempted: 2,
      correctCount: 1,
      correctnessRate: 50,
      mockAttemptsCount: 2,
      averageMockScore: 70,
      latestMockScore: 80,
      hasAttempts: true,
    });
    expect(mockPrisma.practiceSession.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.mockExamAttempt.findMany).toHaveBeenCalledTimes(1);
  });

  it("computes summaries for 90-day window", async () => {
    mockPrisma.subject.findMany.mockResolvedValue([
      { id: "sub-1", name: "Pháp luật", code: "PL" },
    ]);
    mockPrisma.practiceSession.findMany.mockResolvedValue([]);
    mockPrisma.mockExamAttempt.findMany.mockResolvedValue([]);

    const result = await service.getSubjectSummaries(userId, 90);
    expect(result.days).toBe(90);
    expect(mockPrisma.practiceSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId }),
      }),
    );
  });

  it("returns hasAttempts false for subjects with no activity", async () => {
    mockPrisma.subject.findMany.mockResolvedValue([
      { id: "sub-1", name: "Pháp luật", code: "PL" },
      { id: "sub-2", name: "Kinh tế", code: "KT" },
    ]);
    mockPrisma.practiceSession.findMany.mockResolvedValue([
      {
        subjectId: "sub-1",
        answers: [{ isCorrect: true }],
      },
    ]);
    mockPrisma.mockExamAttempt.findMany.mockResolvedValue([]);

    const result = await service.getSubjectSummaries(userId, 30);
    expect(result.subjects).toHaveLength(2);
    expect(result.subjects[0]).toMatchObject({ subjectId: "sub-1", hasAttempts: true });
    expect(result.subjects[1]).toMatchObject({
      subjectId: "sub-2",
      questionsAttempted: 0,
      hasAttempts: false,
    });
  });

  it("throws when practice session not found", async () => {
    mockPrisma.practiceSession.findFirst.mockResolvedValue(null);
    await expect(service.getPracticeSessionDetail(userId, "missing")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("throws when practice session is still in progress", async () => {
    mockPrisma.practiceSession.findFirst.mockResolvedValue({
      id: "ps-1",
      status: "in_progress",
      answers: [{ questionId: "q-1", selectedKeys: ["A"], isCorrect: true }],
      subject: { name: "Pháp luật" },
      subjectId: "sub-1",
      answeredCount: 1,
      correctCount: 1,
      completedAt: null,
      createdAt: new Date(),
    });
    await expect(service.getPracticeSessionDetail(userId, "ps-1")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
