import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { EntitlementsService } from "../entitlements/entitlements.service";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { PracticeService } from "./practice.service";

describe("PracticeService", () => {
  let service: PracticeService;

  const userId = "user-1";
  const subjectId = "sub-1";
  const sessionId = "sess-1";
  const questionId = "q-1";

  const mockPrisma = {
    subject: { findFirst: jest.fn() },
    practiceSession: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    practiceAnswer: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    question: { findFirst: jest.fn(), findMany: jest.fn() },
    $executeRaw: jest.fn(),
    $transaction: jest.fn(async (fn: (tx: typeof mockPrisma) => unknown) => fn(mockPrisma)),
  };

  const mockEntitlements = {
    getSubjectFreeTierStatus: jest.fn(),
    consumeFreeTierQuestionInTransaction: jest.fn(),
  };

  const mockSubscriptions = {
    assertUserNotSuspended: jest.fn(async () => undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PracticeService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EntitlementsService, useValue: mockEntitlements },
        { provide: SubscriptionsService, useValue: mockSubscriptions },
      ],
    }).compile();

    service = module.get(PracticeService);
  });

  it("starts a new session when none active", async () => {
    mockPrisma.subject.findFirst.mockResolvedValue({ id: subjectId });
    mockPrisma.practiceSession.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.practiceSession.findFirst.mockResolvedValue(null);
    mockEntitlements.getSubjectFreeTierStatus.mockResolvedValue({
      isAtLimit: false,
      subjectId,
    });
    mockPrisma.practiceSession.create.mockResolvedValue({
      id: sessionId,
      subjectId,
      status: "in_progress",
      answeredCount: 0,
      correctCount: 0,
      expiresAt: new Date(Date.now() + 86400000),
      subject: { name: "Pháp luật" },
    });

    const result = await service.startOrResumeSession(userId, subjectId);
    expect(result.id).toBe(sessionId);
    expect(result.resumable).toBe(false);
  });

  it("blocks new question when free tier exhausted", async () => {
    mockPrisma.practiceSession.findFirst.mockResolvedValue({
      id: sessionId,
      userId,
      subjectId,
      status: "in_progress",
      answeredCount: 2,
      correctCount: 1,
      currentQuestionId: null,
      expiresAt: new Date(Date.now() + 86400000),
      subject: { name: "Pháp luật" },
    });
    mockEntitlements.getSubjectFreeTierStatus.mockResolvedValue({
      isAtLimit: true,
      subjectId,
    });

    await expect(service.getCurrentQuestion(userId, sessionId)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("binds current question on GET and rejects mismatched POST", async () => {
    mockPrisma.practiceSession.findFirst.mockResolvedValue({
      id: sessionId,
      userId,
      subjectId,
      status: "in_progress",
      answeredCount: 0,
      correctCount: 0,
      currentQuestionId: questionId,
      expiresAt: new Date(Date.now() + 86400000),
      subject: { name: "Pháp luật" },
    });
    mockEntitlements.getSubjectFreeTierStatus.mockResolvedValue({
      isAtLimit: false,
      subjectId,
    });
    mockPrisma.practiceAnswer.findUnique.mockResolvedValue(null);
    mockPrisma.question.findFirst.mockResolvedValue({
      id: questionId,
      subjectId,
      status: "published",
      questionType: "single_choice",
      stem: "Câu hỏi",
      options: [{ key: "A", text: "A" }, { key: "B", text: "B" }],
      imageUrls: [],
    });

    const question = await service.getCurrentQuestion(userId, sessionId);
    expect(question?.questionId).toBe(questionId);

    await expect(
      service.submitAnswer(userId, sessionId, "other-question", ["A"]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("grades answer and increments session counters in transaction", async () => {
    mockPrisma.practiceSession.findFirst.mockResolvedValue({
      id: sessionId,
      userId,
      subjectId,
      status: "in_progress",
      answeredCount: 0,
      correctCount: 0,
      currentQuestionId: questionId,
      expiresAt: new Date(Date.now() + 86400000),
      subject: { name: "Pháp luật" },
    });
    mockPrisma.practiceAnswer.findUnique.mockResolvedValue(null);
    mockPrisma.question.findFirst.mockResolvedValue({
      id: questionId,
      subjectId,
      status: "published",
      questionType: "single_choice",
      options: [{ key: "A", text: "A" }, { key: "B", text: "B" }],
      correctOptionKeys: ["A"],
      explanation: "Giải thích",
    });
    mockEntitlements.consumeFreeTierQuestionInTransaction.mockResolvedValue({
      isAtLimit: false,
      used: 1,
      limit: 20,
    });
    mockPrisma.practiceAnswer.create.mockResolvedValue({});
    mockPrisma.practiceSession.update.mockResolvedValue({
      answeredCount: 1,
      correctCount: 1,
    });

    const feedback = await service.submitAnswer(userId, sessionId, questionId, ["A"]);
    expect(feedback.isCorrect).toBe(true);
    expect(feedback.answeredCount).toBe(1);
    expect(mockEntitlements.consumeFreeTierQuestionInTransaction).toHaveBeenCalled();
    expect(mockPrisma.$executeRaw).toHaveBeenCalled();
  });

  it("rejects duplicate selected keys", async () => {
    mockPrisma.practiceSession.findFirst.mockResolvedValue({
      id: sessionId,
      userId,
      subjectId,
      status: "in_progress",
      answeredCount: 0,
      correctCount: 0,
      currentQuestionId: questionId,
      expiresAt: new Date(Date.now() + 86400000),
      subject: { name: "Pháp luật" },
    });
    mockPrisma.practiceAnswer.findUnique.mockResolvedValue(null);
    mockPrisma.question.findFirst.mockResolvedValue({
      id: questionId,
      subjectId,
      status: "published",
      questionType: "multiple_choice",
      options: [{ key: "A", text: "A" }, { key: "B", text: "B" }],
      correctOptionKeys: ["A", "B"],
      explanation: "Giải thích",
    });

    await expect(
      service.submitAnswer(userId, sessionId, questionId, ["A", "A"]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
