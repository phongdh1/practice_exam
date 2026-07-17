import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ContentComplianceService } from "../content-compliance/content-compliance.service";
import { PrismaService } from "../prisma/prisma.service";
import { CoursesService } from "./courses.service";

describe("CoursesService", () => {
  let service: CoursesService;

  const mockCourses = [
    {
      id: "course-1",
      code: "broker",
      name: "Broker Certification",
      description: "Core broker exams",
      coverImageUrl: null,
      visibility: "active" as const,
      displayOrder: 1,
      createdAt: new Date("2026-07-01"),
      updatedAt: new Date("2026-07-01"),
      _count: { subjects: 2 },
    },
    {
      id: "course-2",
      code: "advisor",
      name: "Advisor Certification",
      description: null,
      coverImageUrl: null,
      visibility: "archived" as const,
      displayOrder: 2,
      createdAt: new Date("2026-07-01"),
      updatedAt: new Date("2026-07-01"),
      _count: { subjects: 0 },
    },
  ];

  const mockPrisma: any = {
    course: {
      findMany: jest.fn(async () => mockCourses.map((c) => ({ id: c.id }))),
      findUnique: jest.fn(async ({ where }: { where: { id: string } }) =>
        mockCourses.find((course) => course.id === where.id) ?? null,
      ),
      create: jest.fn(),
      update: jest.fn(),
    },
    subject: {
      updateMany: jest.fn(async () => ({ count: 0 })),
    },
    $transaction: jest.fn(async (arg: unknown) => {
      if (typeof arg === "function") {
        return (arg as (tx: typeof mockPrisma) => Promise<unknown>)(mockPrisma);
      }
      return Promise.all(arg as Promise<unknown>[]);
    }),
  };

  const mockCompliance = {
    assertCompliant: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ContentComplianceService, useValue: mockCompliance },
      ],
    }).compile();

    service = module.get(CoursesService);
  });

  it("lists courses with subject counts", async () => {
    mockPrisma.course.findMany.mockResolvedValueOnce(mockCourses);
    const result = await service.listAdminCourses();

    expect(result[0]).toEqual({
      id: "course-1",
      code: "broker",
      name: "Broker Certification",
      description: "Core broker exams",
      coverImageUrl: null,
      visibility: "active",
      displayOrder: 1,
      subjectCount: 2,
      createdAt: "2026-07-01T00:00:00.000Z",
      updatedAt: "2026-07-01T00:00:00.000Z",
    });
  });

  it("creates archived courses by default after compliance scan", async () => {
    mockPrisma.course.create.mockResolvedValueOnce({
      ...mockCourses[1],
      code: "new",
      name: "New Course",
    });

    const result = await service.createCourse({
      code: "new",
      name: "New Course",
      description: null,
      displayOrder: 5,
    });

    expect(mockCompliance.assertCompliant).toHaveBeenCalledWith("New Course", null);
    expect(mockPrisma.course.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ visibility: "archived", displayOrder: 5 }),
      }),
    );
    expect(result.visibility).toBe("archived");
  });

  it("archives and activates courses", async () => {
    mockPrisma.course.update.mockImplementation(async ({ data }: { data: { visibility: string } }) => ({
      ...mockCourses[0],
      visibility: data.visibility,
    }));

    await expect(service.archiveCourse("course-1")).resolves.toMatchObject({ visibility: "archived" });
    await expect(service.activateCourse("course-1")).resolves.toMatchObject({ visibility: "active" });
  });

  it("throws when updating an unknown course", async () => {
    mockPrisma.course.findUnique.mockResolvedValueOnce(null);
    await expect(service.updateCourse("missing", { name: "Missing" })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("reorders courses by display order", async () => {
    mockPrisma.course.findMany
      .mockResolvedValueOnce([{ id: "course-1" }, { id: "course-2" }])
      .mockResolvedValueOnce([{ id: "course-2" }, { id: "course-1" }]);
    mockPrisma.course.update.mockImplementation(async ({ data }: { data: { displayOrder: number } }) => ({
      displayOrder: data.displayOrder,
    }));

    const result = await service.reorderCourses({ orderedIds: ["course-2", "course-1"] });

    expect(result.orderedIds).toEqual(["course-2", "course-1"]);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it("rejects incomplete course reorder lists", async () => {
    mockPrisma.course.findMany
      .mockResolvedValueOnce([{ id: "course-1" }, { id: "course-2" }])
      .mockResolvedValueOnce([{ id: "course-1" }]);

    await expect(service.reorderCourses({ orderedIds: ["course-1"] })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("archives active child subjects when archiving a course", async () => {
    mockPrisma.course.update.mockResolvedValueOnce({
      ...mockCourses[0],
      visibility: "archived",
    });

    await service.archiveCourse("course-1");

    expect(mockPrisma.subject.updateMany).toHaveBeenCalledWith({
      where: { courseId: "course-1", visibility: "active" },
      data: { visibility: "archived" },
    });
  });

  it("rejects reorder lists with unknown courses", async () => {
    mockPrisma.course.findMany
      .mockResolvedValueOnce([{ id: "course-1" }, { id: "course-2" }])
      .mockResolvedValueOnce([{ id: "course-1" }]);

    await expect(
      service.reorderCourses({ orderedIds: ["course-1", "missing"] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
