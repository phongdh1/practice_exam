import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { QuestionsService } from "./questions.service";
import { PrismaService } from "../prisma/prisma.service";

describe("QuestionsService", () => {
  let service: QuestionsService;

  const mockQuestion = {
    id: "q-1",
    subjectId: "sub-1",
    authorId: "admin-1",
    status: "draft" as const,
    questionType: "single_choice" as const,
    difficulty: "medium" as const,
    stem: "What is 2+2?",
    explanation: "Basic math",
    correctOptionKeys: ["A"],
    options: [
      { key: "A", text: "4" },
      { key: "B", text: "5" },
    ],
    tags: ["math"],
    imageUrls: [],
    sourceRef: null,
    versionNumber: 1,
    parentQuestionId: null,
    reviewerId: null,
    assignedAt: null,
    submittedAt: null,
    publishedAt: null,
    createdAt: new Date("2026-07-01"),
    updatedAt: new Date("2026-07-01"),
    subject: { name: "Test Subject" },
    author: { displayName: "Editor", username: "editor" },
  };

  const mockPrisma = {
    subject: { findUnique: jest.fn(async () => ({ id: "sub-1" })) },
    question: {
      create: jest.fn(async (args: { data: Record<string, unknown> }) => ({
        ...mockQuestion,
        ...args.data,
        subject: mockQuestion.subject,
        author: mockQuestion.author,
      })),
      findUnique: jest.fn(async () => mockQuestion),
      findMany: jest.fn(async () => []),
      update: jest.fn(async (args: { data: Record<string, unknown> }) => ({
        ...mockQuestion,
        ...args.data,
        subject: mockQuestion.subject,
        author: mockQuestion.author,
      })),
      count: jest.fn(async () => 0),
    },
    questionVersion: { create: jest.fn() },
    contentReview: { create: jest.fn() },
    $transaction: jest.fn(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(QuestionsService);
  });

  it("creates a draft question for a subject", async () => {
    const result = await service.create("admin-1", {
      subjectId: "sub-1",
      questionType: "single_choice",
      difficulty: "medium",
      stem: "What is 2+2?",
      explanation: "Basic math",
      options: [
        { key: "A", text: "4" },
        { key: "B", text: "5" },
      ],
      correctOptionKeys: ["A"],
      tags: ["math"],
    });

    expect(result.status).toBe("draft");
    expect(result.subjectId).toBe("sub-1");
    expect(mockPrisma.question.create).toHaveBeenCalled();
  });

  it("rejects invalid option count", async () => {
    await expect(
      service.create("admin-1", {
        subjectId: "sub-1",
        questionType: "single_choice",
        difficulty: "medium",
        stem: "Test?",
        options: [{ key: "A", text: "Only one" }],
        correctOptionKeys: ["A"],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("submits draft for review", async () => {
    const result = await service.submitForReview("q-1", "admin-1");
    expect(result.status).toBe("in_review");
    expect(mockPrisma.contentReview.create).toHaveBeenCalled();
  });

  it("throws when question not found", async () => {
    mockPrisma.question.findUnique.mockResolvedValueOnce(null);
    await expect(service.findById("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("warns on duplicate stem", async () => {
    mockPrisma.question.findMany.mockResolvedValueOnce([
      { id: "q-other", stem: "What is 2+2?" },
    ]);
    const result = await service.create("admin-1", {
      subjectId: "sub-1",
      questionType: "single_choice",
      difficulty: "medium",
      stem: "  what   is 2+2? ",
      options: [
        { key: "A", text: "4" },
        { key: "B", text: "5" },
      ],
      correctOptionKeys: ["A"],
    });
    expect(result.duplicateWarning?.matchingQuestionId).toBe("q-other");
  });
});
