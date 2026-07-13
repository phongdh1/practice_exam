import { BadRequestException, ConflictException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { AdminUsersService } from "./admin-users.service";
import { PrismaService } from "../prisma/prisma.service";

describe("AdminUsersService", () => {
  let service: AdminUsersService;
  const prisma = {
    adminUser: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    adminAuthAuditLog: {
      create: jest.fn().mockResolvedValue({}),
      findMany: jest.fn(),
    },
  };

  const actor = {
    sub: "00000000-0000-4000-8000-000000000001",
    username: "admin",
    role: "super_admin" as const,
    aud: "admin" as const,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminUsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(AdminUsersService);
  });

  it("creates admin user with hashed password", async () => {
    prisma.adminUser.findUnique.mockResolvedValue(null);
    prisma.adminUser.create.mockResolvedValue({
      id: "new-id",
      username: "editor@example.com",
      displayName: "Editor",
      role: "editor",
      isDisabled: false,
      createdAt: new Date("2026-07-01T00:00:00Z"),
      updatedAt: new Date("2026-07-01T00:00:00Z"),
    });

    const result = await service.createStaff(
      {
        username: "editor@example.com",
        password: "Password1!",
        role: "editor",
        displayName: "Editor",
      },
      actor,
    );

    expect(result.username).toBe("editor@example.com");
    expect(prisma.adminUser.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          username: "editor@example.com",
          role: "editor",
          passwordHash: expect.any(String),
        }),
      }),
    );
    const hash = prisma.adminUser.create.mock.calls[0][0].data.passwordHash as string;
    expect(await bcrypt.compare("Password1!", hash)).toBe(true);
    expect(prisma.adminAuthAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          adminId: "new-id",
          action: "admin_user_created",
        }),
      }),
    );
  });

  it("rejects duplicate username", async () => {
    prisma.adminUser.findUnique.mockResolvedValue({ id: "existing" });
    await expect(
      service.createStaff(
        { username: "dup@example.com", password: "Password1!", role: "editor" },
        actor,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("blocks disabling self", async () => {
    prisma.adminUser.findUnique.mockResolvedValue({
      id: actor.sub,
      username: "admin",
      role: "super_admin",
      isDisabled: false,
    });

    await expect(
      service.updateStaff(actor.sub, { isDisabled: true }, actor),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("redacts password in update audit log", async () => {
    prisma.adminUser.findUnique.mockResolvedValue({
      id: "staff-id",
      username: "staff@example.com",
      role: "editor",
      isDisabled: false,
    });
    prisma.adminUser.update.mockResolvedValue({
      id: "staff-id",
      username: "staff@example.com",
      displayName: "Updated",
      role: "editor",
      isDisabled: false,
      createdAt: new Date("2026-07-01T00:00:00Z"),
      updatedAt: new Date("2026-07-01T00:00:00Z"),
    });

    await service.updateStaff(
      "staff-id",
      { password: "NewPassword1!", displayName: "Updated" },
      actor,
    );

    expect(prisma.adminAuthAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "admin_user_updated",
          details: expect.objectContaining({
            changes: { displayName: "Updated", password: "[REDACTED]" },
          }),
        }),
      }),
    );
  });

  it("blocks demoting last super admin", async () => {
    prisma.adminUser.findUnique.mockResolvedValue({
      id: "only-super",
      username: "only@example.com",
      role: "super_admin",
      isDisabled: false,
    });
    prisma.adminUser.count.mockResolvedValue(0);

    await expect(
      service.updateStaff("only-super", { role: "editor" }, actor),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
