import { AdminNotificationsService } from "./admin-notifications.service";

describe("AdminNotificationsService", () => {
  const prisma = {
    user: { findMany: jest.fn() },
    payment: { findMany: jest.fn() },
    subject: { findMany: jest.fn() },
  };

  const service = new AdminNotificationsService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns registration events for support role", async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: "user-1",
        displayName: "Alice",
        createdAt: new Date("2026-07-10T08:00:00.000Z"),
      },
    ]);
    prisma.payment.findMany.mockResolvedValue([]);

    const result = await service.listRecent(
      { role: "support", sub: "admin-1", username: "support" } as never,
      "2026-07-10T00:00:00.000Z",
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      type: "registration",
      title: "Người dùng mới đăng ký",
      href: "/users/user-1",
    });
    expect(prisma.payment.findMany).not.toHaveBeenCalled();
  });

  it("returns payment events for finance role", async () => {
    prisma.user.findMany.mockResolvedValue([]);
    prisma.payment.findMany.mockResolvedValue([
      {
        id: "pay-1",
        subjectId: "sub-1",
        amountVnd: 100_000,
        paidAt: new Date("2026-07-10T09:00:00.000Z"),
        user: { id: "user-2", displayName: "Bob" },
      },
    ]);
    prisma.subject.findMany.mockResolvedValue([{ id: "sub-1", name: "PLCK" }]);

    const result = await service.listRecent(
      { role: "finance", sub: "admin-2", username: "finance" } as never,
      "2026-07-10T00:00:00.000Z",
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      type: "payment",
      title: "Thanh toán mới",
      href: "/payments",
      metadata: { amountVnd: 100_000, subjectName: "PLCK" },
    });
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });
});
