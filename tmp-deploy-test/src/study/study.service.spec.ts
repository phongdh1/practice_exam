import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { StudyService } from "./study.service";
import { PrismaService } from "../prisma/prisma.service";
import { EntitlementsService } from "../entitlements/entitlements.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { getIctPeriodKey } from "@practice-exam/utils";

describe("StudyService", () => {
  let service: StudyService;

  const userId = "user-1";
  const subjectId = "sub-1";
  const questionId = "q-1";
  const periodKey = getIctPeriodKey();

  const publishedQuestion = {
    id: questionId,
    stem: "Câu hỏi study",
    questionType: "single_choice",
    difficulty: "medium",
    tags: ["topic-a"],
    imageUrls: [],
    options: [{ key: "A", text: "Đáp án A" }],
    correctOptionKeys: ["A"],
    explanation: "Giải thích",
  };

  const mockPrisma = {
    subject: { findFirst: jest.fn() },
    question: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
    studyViewLog: { findUnique: jest.fn(), findMany: jest.fn() },
  };

  const mockEntitlements = {
    getStudyTierStatus: jest.fn(),
    consumeStudyView: jest.fn(),
  };

  const mockSubscriptions = {
    assertUserNotSuspended: jest.fn(),
    hasActiveSubscription: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockSubscriptions.assertUserNotSuspended.mockResolvedValue(undefined);
    mockSubscriptions.hasActiveSubscription.mockResolvedValue(false);
    mockPrisma.subject.findFirst.mockResolvedValue({ id: subjectId });
    mockPrisma.studyViewLog.findMany.mockResolvedValue([]);
    mockEntitlements.getStudyTierStatus.mockResolvedValue({
      subjectId,
      used: 0,
      limit: 5,
      remaining: 5,
      periodKey,
      isAtLimit: false,
      hasActiveSubscription: false,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudyService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EntitlementsService, useValue: mockEntitlements },
        { provide: SubscriptionsService, useValue: mockSubscriptions },
      ],
    }).compile();

    service = module.get(StudyService);
  });

  it("lists published questions without answer fields", async () => {
    mockPrisma.question.findMany.mockResolvedValue([
      {
        id: questionId,
        stem: publishedQuestion.stem,
        questionType: publishedQuestion.questionType,
        difficulty: publishedQuestion.difficulty,
        tags: publishedQuestion.tags,
        imageUrls: publishedQuestion.imageUrls,
      },
    ]);
    mockPrisma.question.count.mockResolvedValue(1);
    mockPrisma.studyViewLog.findMany.mockResolvedValue([]);

    const result = await service.listQuestions(userId, subjectId, {});

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual({
      id: questionId,
      stem: publishedQuestion.stem,
      questionType: "single_choice",
      difficulty: "medium",
      tags: ["topic-a"],
      imageUrls: [],
      viewedThisPeriod: false,
    });
    expect(result.studyTier.remaining).toBe(5);
    expect(result.items[0]).not.toHaveProperty("correctOptionKeys");
    expect(result.items[0]).not.toHaveProperty("explanation");
  });

  it("returns detail and consumes study view for first open", async () => {
    mockPrisma.question.findFirst.mockResolvedValue(publishedQuestion);
    mockPrisma.studyViewLog.findUnique.mockResolvedValue(null);
    mockEntitlements.consumeStudyView.mockResolvedValue({
      subjectId,
      used: 1,
      limit: 5,
      remaining: 4,
      periodKey,
      isAtLimit: false,
      hasActiveSubscription: false,
    });

    const result = await service.getQuestionDetail(userId, subjectId, questionId);

    expect(mockEntitlements.consumeStudyView).toHaveBeenCalledWith(userId, subjectId, questionId);
    expect(result.correctOptionKeys).toEqual(["A"]);
    expect(result.explanation).toBe("Giải thích");
    expect(result.studyTier.used).toBe(1);
  });

  it("re-opens detail idempotently without consuming again", async () => {
    mockPrisma.question.findFirst.mockResolvedValue(publishedQuestion);
    mockPrisma.studyViewLog.findUnique.mockResolvedValue({ id: "log-1" });

    await service.getQuestionDetail(userId, subjectId, questionId);

    expect(mockEntitlements.consumeStudyView).not.toHaveBeenCalled();
    expect(mockEntitlements.getStudyTierStatus).toHaveBeenCalledWith(userId, subjectId);
  });

  it("returns 404 for non-published question", async () => {
    mockPrisma.question.findFirst.mockResolvedValue(null);

    await expect(service.getQuestionDetail(userId, subjectId, questionId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("skips consumption for subscribed users", async () => {
    mockSubscriptions.hasActiveSubscription.mockResolvedValue(true);
    mockPrisma.question.findFirst.mockResolvedValue(publishedQuestion);

    await service.getQuestionDetail(userId, subjectId, questionId);

    expect(mockEntitlements.consumeStudyView).not.toHaveBeenCalled();
    expect(mockEntitlements.getStudyTierStatus).toHaveBeenCalledWith(userId, subjectId);
  });
});
