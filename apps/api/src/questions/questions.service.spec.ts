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
      delete: jest.fn(async () => mockQuestion),
      deleteMany: jest.fn(async () => ({ count: 0 })),
      count: jest.fn(async () => 0),
      groupBy: jest.fn(async () => []),
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

  it("deletes a draft question", async () => {
    const result = await service.delete("q-1");
    expect(result.deleted).toBe(true);
    expect(mockPrisma.question.deleteMany).toHaveBeenCalledWith({
      where: { parentQuestionId: "q-1" },
    });
    expect(mockPrisma.question.delete).toHaveBeenCalledWith({ where: { id: "q-1" } });
  });

  it("rejects deleting published question", async () => {
    mockPrisma.question.findUnique.mockResolvedValueOnce({
      ...mockQuestion,
      status: "published",
    });
    await expect(service.delete("q-1")).rejects.toBeInstanceOf(BadRequestException);
  });

  it("filters search by courseId", async () => {
    await service.search({ courseId: "course-1", page: 1, pageSize: 10 });
    expect(mockPrisma.question.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          subject: { courseId: "course-1" },
        }),
      }),
    );
  });

  it("returns zero stats when no questions exist", async () => {
    mockPrisma.question.groupBy.mockResolvedValueOnce([]);
    await expect(service.getStats()).resolves.toEqual({
      total: 0,
      published: 0,
      inReview: 0,
      draft: 0,
    });
  });

  it("aggregates stats by status", async () => {
    mockPrisma.question.groupBy.mockResolvedValueOnce([
      { status: "published", _count: { _all: 10 } },
      { status: "in_review", _count: { _all: 3 } },
      { status: "draft", _count: { _all: 5 } },
      { status: "archived", _count: { _all: 2 } },
    ]);
    await expect(service.getStats()).resolves.toEqual({
      total: 20,
      published: 10,
      inReview: 3,
      draft: 5,
    });
  });
});
