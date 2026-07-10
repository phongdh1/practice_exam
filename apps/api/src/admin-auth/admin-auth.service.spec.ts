import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AdminAuthService } from "./admin-auth.service";
import { PrismaService } from "../prisma/prisma.service";

describe("AdminAuthService", () => {
  let service: AdminAuthService;
  const prisma = {
    adminUser: {
      findUnique: jest.fn(),
    },
    adminAuthAuditLog: {
      create: jest.fn().mockResolvedValue({}),
    },
  };
  const jwtService = {
    signAsync: jest.fn().mockResolvedValue("admin-access-token"),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AdminAuthService);
  });

  it("logs in seeded admin credentials", async () => {
    const passwordHash = await bcrypt.hash("Admin@123", 10);
    prisma.adminUser.findUnique.mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000001",
      username: "admin",
      passwordHash,
      displayName: "Super Admin",
      role: "super_admin",
      isDisabled: false,
    });

    const result = await service.login("admin", "Admin@123");

    expect(result.admin.username).toBe("admin");
    expect(result.tokens.accessToken).toBe("admin-access-token");
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ aud: "admin", role: "super_admin" }),
      expect.any(Object),
    );
    expect(prisma.adminAuthAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "admin_login_success" }),
      }),
    );
  });

  it("rejects invalid password", async () => {
    const passwordHash = await bcrypt.hash("Admin@123", 10);
    prisma.adminUser.findUnique.mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000001",
      username: "admin",
      passwordHash,
      displayName: "Super Admin",
      role: "super_admin",
      isDisabled: false,
    });

    await expect(service.login("admin", "wrong-password")).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(prisma.adminAuthAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "admin_login_failed" }),
      }),
    );
  });

  it("rejects disabled admin and logs audit", async () => {
    const passwordHash = await bcrypt.hash("Admin@123", 10);
    prisma.adminUser.findUnique.mockResolvedValue({
      id: "00000000-0000-4000-8000-000000000002",
      username: "disabled@example.com",
      passwordHash,
      displayName: "Disabled",
      role: "editor",
      isDisabled: true,
    });

    await expect(service.login("disabled@example.com", "Admin@123")).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(prisma.adminAuthAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "admin_login_failed",
          adminId: "00000000-0000-4000-8000-000000000002",
          details: expect.objectContaining({ reason: "disabled" }),
        }),
      }),
    );
  });
});
