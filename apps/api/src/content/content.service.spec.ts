import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { ContentService } from "./content.service";
import { QuestionsService } from "../questions/questions.service";
import { PrismaService } from "../prisma/prisma.service";

describe("ContentService", () => {
  let service: ContentService;

  const inReviewQuestion = {
    id: "q-1",
    subjectId: "sub-1",
    authorId: "admin-1",
    status: "in_review" as const,
    parentQuestionId: null,
    reviewerId: null,
  };

  const mockPrisma = {
    question: {
      findMany: jest.fn(async () => []),
      findUnique: jest.fn(async () => inReviewQuestion),
      update: jest.fn(async (args: { data: Record<string, unknown> }) => ({
        ...inReviewQuestion,
        ...args.data,
        stem: "Test stem",
        questionType: "single_choice",
        difficulty: "medium",
        explanation: null,
        correctOptionKeys: ["A"],
        options: [{ key: "A", text: "x" }],
        tags: [],
        imageUrls: [],
        sourceRef: null,
        versionNumber: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        submittedAt: new Date(),
        publishedAt: null,
        assignedAt: null,
        subject: { name: "Subject" },
        author: { displayName: "Author", username: "author" },
      })),
    },
    contentReview: { create: jest.fn() },
    contentAuditLog: { create: jest.fn() },
    $transaction: jest.fn(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma)),
  };

  const mockQuestionsService = {
    findById: jest.fn(async () => ({ id: "q-1", status: "in_review" })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: QuestionsService, useValue: mockQuestionsService },
      ],
    }).compile();
    service = module.get(ContentService);
  });

  it("requires rejection comment", async () => {
    await expect(service.reject("q-1", "rev-1", "")).rejects.toBeInstanceOf(BadRequestException);
  });

  it("approves and publishes atomically", async () => {
    const result = await service.approve("q-1", "rev-1", "Looks good");
    expect(result.status).toBe("published");
    expect(mockPrisma.contentReview.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "approve" }),
      }),
    );
  });

  it("unpublishes with audit log", async () => {
    mockPrisma.question.findUnique.mockResolvedValueOnce({
      ...inReviewQuestion,
      status: "published",
    });
    const result = await service.unpublish("q-1", "rev-1", "Copyright issue");
    expect(result.status).toBe("archived");
    expect(mockPrisma.contentAuditLog.create).toHaveBeenCalled();
  });
});
