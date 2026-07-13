import { Test, TestingModule } from "@nestjs/testing";
import {
  DEFAULT_EMAIL_TEMPLATES,
  DEFAULT_MAINTENANCE_MESSAGE,
  DEFAULT_PLATFORM_DISCLAIMER,
  EMAIL_TEMPLATES_KEY,
  MAINTENANCE_MODE_KEY,
  PLATFORM_DISCLAIMER_KEY,
  SettingsService,
} from "./settings.service";
import { PrismaService } from "../prisma/prisma.service";

describe("SettingsService", () => {
  let service: SettingsService;

  const mockPrisma = {
    systemSetting: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    adminAuthAuditLog: {
      create: jest.fn().mockResolvedValue({}),
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
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(SettingsService);
  });

  it("returns CMS disclaimer when configured", async () => {
    const updatedAt = new Date("2026-06-30T00:00:00.000Z");
    mockPrisma.systemSetting.findUnique.mockResolvedValue({
      key: PLATFORM_DISCLAIMER_KEY,
      value: "Custom disclaimer",
      updatedAt,
    });

    const result = await service.getPlatformDisclaimer();

    expect(result).toEqual({
      text: "Custom disclaimer",
      version: updatedAt.toISOString(),
    });
  });

  it("falls back to default disclaimer", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue(null);

    const result = await service.getPlatformDisclaimer();

    expect(result.text).toBe(DEFAULT_PLATFORM_DISCLAIMER);
    expect(result.version).toBe("default");
  });

  it("returns default maintenance mode when unset", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue(null);

    const result = await service.getMaintenanceMode();

    expect(result).toEqual({
      enabled: false,
      message: DEFAULT_MAINTENANCE_MESSAGE,
    });
  });

  it("parses stored maintenance mode", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue({
      key: MAINTENANCE_MODE_KEY,
      value: JSON.stringify({ enabled: true, message: "Bảo trì hệ thống" }),
      updatedAt: new Date(),
    });

    const result = await service.getMaintenanceMode();

    expect(result).toEqual({ enabled: true, message: "Bảo trì hệ thống" });
  });

  it("updates settings and writes audit log", async () => {
    mockPrisma.systemSetting.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
      if (where.key === PLATFORM_DISCLAIMER_KEY) {
        return {
          key: PLATFORM_DISCLAIMER_KEY,
          value: "Updated disclaimer",
          updatedAt: new Date("2026-07-02T10:00:00.000Z"),
        };
      }
      if (where.key === MAINTENANCE_MODE_KEY) return null;
      if (where.key === EMAIL_TEMPLATES_KEY) return null;
      return null;
    });
    mockPrisma.systemSetting.upsert.mockResolvedValue({});

    await service.updateAdminSystemSettings(
      {
        disclaimerText: "Updated disclaimer",
        maintenance: { enabled: true, message: "Maintenance on" },
      },
      actor,
    );

    expect(mockPrisma.systemSetting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { key: MAINTENANCE_MODE_KEY } }),
    );
    expect(mockPrisma.adminAuthAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "system_setting_updated",
          adminId: actor.sub,
        }),
      }),
    );
  });

  it("returns default email templates when unset", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue(null);

    const result = await service.getEmailTemplates();

    expect(result).toEqual(DEFAULT_EMAIL_TEMPLATES);
  });

  it("merges partial email template updates with defaults", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue({
      key: EMAIL_TEMPLATES_KEY,
      value: JSON.stringify({
        welcome: { subject: "Custom welcome", body: "Hello {{displayName}}" },
      }),
      updatedAt: new Date(),
    });

    const result = await service.getEmailTemplates();

    expect(result.welcome).toEqual({
      subject: "Custom welcome",
      body: "Hello {{displayName}}",
    });
    expect(result.payment_confirmed).toEqual(DEFAULT_EMAIL_TEMPLATES.payment_confirmed);
  });

  it("returns default landing content when unset", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue(null);

    const result = await service.getLandingContent();

    expect(result.badge).toBe("Cập nhật kỳ thi 2024");
    expect(result.version).toBe("default");
  });

  it("updates landing content and writes audit log", async () => {
    const updatedAt = new Date("2026-07-13T10:00:00.000Z");
    mockPrisma.systemSetting.upsert.mockResolvedValue({
      key: "landing_content",
      value: JSON.stringify({ badge: "Mới" }),
      updatedAt,
    });

    await service.updateLandingContent(
      {
        badge: "Mới",
        headline: "Headline",
        subheadlineMarkdown: "Mô tả",
        ctaPrimaryLabel: "CTA 1",
        ctaSecondaryLabel: "CTA 2",
        heroSidecard: {
          mode: "stats",
          cardTitle: "Stats",
          illustrationFootnote: "Minh họa",
          stats: {
            chartPreset: "balanced",
            metrics: [
              { label: "A", value: "1" },
              { label: "B", value: "2" },
            ],
          },
        },
      },
      actor,
    );

    expect(mockPrisma.systemSetting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { key: "landing_content" } }),
    );
    expect(mockPrisma.adminAuthAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "landing_content_updated",
        }),
      }),
    );
  });
});
