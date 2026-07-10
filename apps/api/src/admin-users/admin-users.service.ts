import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { AdminRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { toOptionalInputJsonValue } from "../prisma/input-json";
import type { AdminAuthPayload } from "../admin-auth/admin-auth.service";
import type { CreateAdminUserDto, UpdateAdminUserDto } from "./dto/admin-users.dto";

export interface AdminStaffView {
  id: string;
  username: string;
  displayName: string | null;
  role: AdminRole;
  isDisabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuthAuditEntry {
  id: string;
  adminId: string | null;
  username: string | null;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listStaff(): Promise<AdminStaffView[]> {
    const rows = await this.prisma.adminUser.findMany({
      orderBy: { createdAt: "asc" },
    });
    return rows.map((row) => this.toStaffView(row));
  }

  async createStaff(dto: CreateAdminUserDto, actor: AdminAuthPayload): Promise<AdminStaffView> {
    const username = dto.username.trim().toLowerCase();
    const existing = await this.prisma.adminUser.findUnique({ where: { username } });
    if (existing) {
      throw new ConflictException({
        code: "ADMIN_USERNAME_EXISTS",
        message: "Tên đăng nhập đã tồn tại.",
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const created = await this.prisma.adminUser.create({
      data: {
        username,
        passwordHash,
        displayName: dto.displayName?.trim() || null,
        role: dto.role,
      },
    });

    await this.logAudit(created.id, username, "admin_user_created", {
      createdAdminId: created.id,
      role: created.role,
      actorId: actor.sub,
      actorUsername: actor.username,
    });

    return this.toStaffView(created);
  }

  async updateStaff(
    id: string,
    dto: UpdateAdminUserDto,
    actor: AdminAuthPayload,
  ): Promise<AdminStaffView> {
    const existing = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({ code: "NOT_FOUND", message: "Không tìm thấy admin." });
    }

    if (dto.isDisabled === true && id === actor.sub) {
      throw new BadRequestException({
        code: "CANNOT_DISABLE_SELF",
        message: "Không thể vô hiệu hóa tài khoản của chính bạn.",
      });
    }

    if (dto.role && dto.role !== "super_admin" && id === actor.sub) {
      throw new BadRequestException({
        code: "CANNOT_DEMOTE_SELF",
        message: "Không thể thay đổi vai trò của chính bạn.",
      });
    }

    if (existing.role === "super_admin" && dto.role && dto.role !== "super_admin") {
      await this.assertNotLastSuperAdmin(id);
    }

    if (dto.isDisabled === true && existing.role === "super_admin") {
      await this.assertNotLastSuperAdmin(id);
    }

    const data: {
      role?: AdminRole;
      isDisabled?: boolean;
      displayName?: string | null;
      passwordHash?: string;
    } = {};

    if (dto.role !== undefined) data.role = dto.role;
    if (dto.isDisabled !== undefined) data.isDisabled = dto.isDisabled;
    if (dto.displayName !== undefined) data.displayName = dto.displayName?.trim() || null;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);

    const updated = await this.prisma.adminUser.update({ where: { id }, data });

    await this.logAudit(id, updated.username, "admin_user_updated", {
      changes: this.sanitizeChangesForAudit(dto),
      actorId: actor.sub,
      actorUsername: actor.username,
    });

    return this.toStaffView(updated);
  }

  async listAuthAudit(limit = 50): Promise<AdminAuthAuditEntry[]> {
    const rows = await this.prisma.adminAuthAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.min(Math.max(limit, 1), 200),
    });
    return rows.map((row) => ({
      id: row.id,
      adminId: row.adminId,
      username: row.username,
      action: row.action,
      details: (row.details as Record<string, unknown> | null) ?? null,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async logLoginEvent(
    adminId: string | null,
    username: string,
    action: "admin_login_success" | "admin_login_failed",
    details?: Record<string, unknown>,
  ): Promise<void> {
    await this.logAudit(adminId, username, action, details);
  }

  private async assertNotLastSuperAdmin(excludeId: string): Promise<void> {
    const activeSuperAdmins = await this.prisma.adminUser.count({
      where: {
        role: "super_admin",
        isDisabled: false,
        id: { not: excludeId },
      },
    });
    if (activeSuperAdmins === 0) {
      throw new BadRequestException({
        code: "LAST_SUPER_ADMIN",
        message: "Phải có ít nhất một Super Admin đang hoạt động.",
      });
    }
  }

  private sanitizeChangesForAudit(dto: UpdateAdminUserDto): Record<string, unknown> {
    const changes: Record<string, unknown> = {};
    if (dto.role !== undefined) changes.role = dto.role;
    if (dto.isDisabled !== undefined) changes.isDisabled = dto.isDisabled;
    if (dto.displayName !== undefined) changes.displayName = dto.displayName;
    if (dto.password) changes.password = "[REDACTED]";
    return changes;
  }

  private async logAudit(
    adminId: string | null,
    username: string | null,
    action: string,
    details?: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.adminAuthAuditLog.create({
      data: {
        adminId,
        username,
        action,
        details: toOptionalInputJsonValue(details),
      },
    });
  }

  private toStaffView(row: {
    id: string;
    username: string;
    displayName: string | null;
    role: AdminRole;
    isDisabled: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): AdminStaffView {
    return {
      id: row.id,
      username: row.username,
      displayName: row.displayName,
      role: row.role,
      isDisabled: row.isDisabled,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
