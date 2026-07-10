import { Test, TestingModule } from "@nestjs/testing";
import { AdminDashboardService } from "./admin-dashboard.service";
import { PaymentsAdminService } from "../payments-admin/payments-admin.service";
import { PrismaService } from "../prisma/prisma.service";

describe("AdminDashboardService", () => {
  let service: AdminDashboardService;

  const prisma = {
    subscription: { groupBy: jest.fn() },
    subject: { findMany: jest.fn() },
    question: { count: jest.fn() },
    questionFlag: { count: jest.fn() },
  };

  const paymentsAdminService = {
    getRevenueReport: jest.fn(),
  };

  const superAdmin = {
    sub: "00000000-0000-4000-8000-000000000001",
    username: "admin",
    role: "super_admin" as const,
    aud: "admin" as const,
  };

  const financeActor = { ...superAdmin, role: "finance" as const };
  const reviewerActor = { ...superAdmin, role: "reviewer" as const };
  const editorActor = { ...superAdmin, role: "editor" as const };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminDashboardService,
        { provide: PrismaService, useValue: prisma },
        { provide: PaymentsAdminService, useValue: paymentsAdminService },
      ],
    }).compile();
    service = module.get(AdminDashboardService);
  });

  it("returns all KPI sections for super_admin", async () => {
    prisma.subscription.groupBy.mockResolvedValue([
      { subjectId: "sub-1", _count: { _all: 3 } },
    ]);
    prisma.subject.findMany.mockResolvedValue([
      { id: "sub-1", name: "Pháp luật", code: "PL" },
    ]);
    paymentsAdminService.getRevenueReport.mockResolvedValue({
      from: "2026-07-01T00:00:00.000Z",
      to: "2026-07-31T23:59:59.999Z",
      totalRevenueVnd: 500_000,
      totalCount: 2,
      bySubject: [],
      byChannel: [],
    });
    prisma.question.count.mockResolvedValue(4);
    prisma.questionFlag.count.mockResolvedValue(2);

    const result = await service.getKpis(superAdmin);

    expect(result.subscriptionsBySubject).toEqual([
      {
        subjectId: "sub-1",
        subjectName: "Pháp luật",
        subjectCode: "PL",
        activeCount: 3,
      },
    ]);
    expect(result.monthlyRevenue?.totalRevenueVnd).toBe(500_000);
    expect(result.contentQueue).toEqual({ editorialPending: 4, flaggedOpen: 2 });
  });

  it("omits revenue and content for finance role", async () => {
    paymentsAdminService.getRevenueReport.mockResolvedValue({
      from: "2026-07-01T00:00:00.000Z",
      to: "2026-07-31T23:59:59.999Z",
      totalRevenueVnd: 100_000,
      totalCount: 1,
      bySubject: [],
      byChannel: [],
    });

    const result = await service.getKpis(financeActor);

    expect(result.monthlyRevenue?.totalRevenueVnd).toBe(100_000);
    expect(result.subscriptionsBySubject).toBeNull();
    expect(result.contentQueue).toBeNull();
    expect(prisma.subscription.groupBy).not.toHaveBeenCalled();
  });

  it("returns only content queue for reviewer", async () => {
    prisma.question.count.mockResolvedValue(1);
    prisma.questionFlag.count.mockResolvedValue(5);

    const result = await service.getKpis(reviewerActor);

    expect(result.contentQueue).toEqual({ editorialPending: 1, flaggedOpen: 5 });
    expect(result.monthlyRevenue).toBeNull();
    expect(result.subscriptionsBySubject).toBeNull();
  });

  it("returns empty KPI sections for editor role", async () => {
    const result = await service.getKpis(editorActor);

    expect(result.subscriptionsBySubject).toBeNull();
    expect(result.monthlyRevenue).toBeNull();
    expect(result.contentQueue).toBeNull();
  });

  it("returns cached generatedAt on subsequent requests", async () => {
    prisma.subscription.groupBy.mockResolvedValue([]);
    prisma.subject.findMany.mockResolvedValue([]);
    paymentsAdminService.getRevenueReport.mockResolvedValue({
      from: "2026-07-01T00:00:00.000Z",
      to: "2026-07-31T23:59:59.999Z",
      totalRevenueVnd: 0,
      totalCount: 0,
      bySubject: [],
      byChannel: [],
    });
    prisma.question.count.mockResolvedValue(0);
    prisma.questionFlag.count.mockResolvedValue(0);

    const first = await service.getKpis(superAdmin);
    const firstGeneratedAt = first.generatedAt;

    await new Promise((resolve) => setTimeout(resolve, 5));

    const second = await service.getKpis(superAdmin);
    expect(second.generatedAt).toBe(firstGeneratedAt);
    expect(prisma.subscription.groupBy).toHaveBeenCalledTimes(1);
  });
});
