import { Injectable } from "@nestjs/common";
import type {
  EmailNotificationTemplate,
  EmailNotificationTemplateKey,
  LandingContentView,
  MaintenanceMode,
  PlatformDisclaimer,
  SystemSettingsView,
} from "@practice-exam/types";
import { DEFAULT_LANDING_CONTENT, mergeLandingContent } from "@practice-exam/types";
import type { AdminAuthPayload } from "../admin-auth/admin-auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { toInputJsonValue } from "../prisma/input-json";
import type { UpdateSystemSettingsDto } from "./dto/update-system-settings.dto";
import type { UpdateLandingContentDto } from "./dto/update-landing-content.dto";

export const PLATFORM_DISCLAIMER_KEY = "platform_disclaimer";
export const MAINTENANCE_MODE_KEY = "maintenance_mode";
export const EMAIL_TEMPLATES_KEY = "email_templates";
export const LANDING_CONTENT_KEY = "landing_content";
export const SETTINGS_CACHE_TTL_MS = 5 * 60 * 1000;

export const DEFAULT_PLATFORM_DISCLAIMER =
  "Practice Exam là nền tảng luyện thi độc lập, không phải sản phẩm thi chính thức của UBCKNN. Nội dung mang tính tham khảo và không đảm bảo kết quả thi.";

export const DEFAULT_MAINTENANCE_MESSAGE =
  "Hệ thống đang bảo trì. Vui lòng quay lại sau. Practice Exam — nền tảng luyện thi chứng chỉ.";

export const EMAIL_TEMPLATE_KEYS: EmailNotificationTemplateKey[] = [
  "welcome",
  "payment_confirmed",
  "subscription_expiring",
];

export const DEFAULT_EMAIL_TEMPLATES: Record<EmailNotificationTemplateKey, EmailNotificationTemplate> = {
  welcome: {
    subject: "Chào mừng đến Practice Exam",
    body: "Xin chào {{displayName}}, tài khoản của bạn đã được tạo thành công.",
  },
  payment_confirmed: {
    subject: "Xác nhận thanh toán Practice Exam",
    body: "Thanh toán {{amountVnd}} VND cho môn {{subjectName}} đã được xác nhận.",
  },
  subscription_expiring: {
    subject: "Gói đăng ký sắp hết hạn",
    body: "Gói {{subjectName}} của bạn sẽ hết hạn vào {{expiresAt}}. Gia hạn để tiếp tục luyện thi.",
  },
};

type CacheEntry<T> = { value: T; expiresAt: number };

@Injectable()
export class SettingsService {
  private disclaimerCache: CacheEntry<PlatformDisclaimer> | null = null;
  private maintenanceCache: CacheEntry<MaintenanceMode> | null = null;
  private landingContentCache: CacheEntry<LandingContentView> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async getPlatformDisclaimer(): Promise<PlatformDisclaimer> {
    if (this.disclaimerCache && this.disclaimerCache.expiresAt > Date.now()) {
      return this.disclaimerCache.value;
    }

    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: PLATFORM_DISCLAIMER_KEY },
    });

    const value: PlatformDisclaimer = setting
      ? { text: setting.value, version: setting.updatedAt.toISOString() }
      : { text: DEFAULT_PLATFORM_DISCLAIMER, version: "default" };

    this.disclaimerCache = {
      value,
      expiresAt: Date.now() + SETTINGS_CACHE_TTL_MS,
    };
    return value;
  }

  async getMaintenanceMode(): Promise<MaintenanceMode> {
    if (this.maintenanceCache && this.maintenanceCache.expiresAt > Date.now()) {
      return this.maintenanceCache.value;
    }

    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: MAINTENANCE_MODE_KEY },
    });

    const value = setting ? this.parseMaintenance(setting.value) : this.defaultMaintenanceMode();
    this.maintenanceCache = {
      value,
      expiresAt: Date.now() + SETTINGS_CACHE_TTL_MS,
    };
    return value;
  }

  async getEmailTemplates(): Promise<Record<EmailNotificationTemplateKey, EmailNotificationTemplate>> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: EMAIL_TEMPLATES_KEY },
    });
    if (!setting) {
      return { ...DEFAULT_EMAIL_TEMPLATES };
    }
    return this.mergeEmailTemplates(this.parseEmailTemplates(setting.value));
  }

  async getAdminSystemSettings(): Promise<SystemSettingsView> {
    const [disclaimer, maintenance, emailTemplates] = await Promise.all([
      this.getPlatformDisclaimer(),
      this.getMaintenanceMode(),
      this.getEmailTemplates(),
    ]);

    return {
      disclaimer,
      maintenance,
      emailTemplates,
      updatedAt: disclaimer.version === "default" ? null : disclaimer.version,
    };
  }

  async updateAdminSystemSettings(
    dto: UpdateSystemSettingsDto,
    actor: AdminAuthPayload,
  ): Promise<SystemSettingsView> {
    const changes: Record<string, unknown> = {};

    if (dto.disclaimerText !== undefined) {
      await this.prisma.systemSetting.upsert({
        where: { key: PLATFORM_DISCLAIMER_KEY },
        create: { key: PLATFORM_DISCLAIMER_KEY, value: dto.disclaimerText.trim() },
        update: { value: dto.disclaimerText.trim() },
      });
      changes.disclaimerText = true;
      this.disclaimerCache = null;
    }

    if (dto.maintenance !== undefined) {
      const payload = JSON.stringify({
        enabled: dto.maintenance.enabled,
        message: dto.maintenance.message.trim(),
      });
      await this.prisma.systemSetting.upsert({
        where: { key: MAINTENANCE_MODE_KEY },
        create: { key: MAINTENANCE_MODE_KEY, value: payload },
        update: { value: payload },
      });
      changes.maintenance = dto.maintenance;
      this.maintenanceCache = null;
    }

    if (dto.emailTemplates !== undefined) {
      const merged = this.mergeEmailTemplates(dto.emailTemplates);
      await this.prisma.systemSetting.upsert({
        where: { key: EMAIL_TEMPLATES_KEY },
        create: { key: EMAIL_TEMPLATES_KEY, value: JSON.stringify(merged) },
        update: { value: JSON.stringify(merged) },
      });
      changes.emailTemplates = Object.keys(dto.emailTemplates);
    }

    if (Object.keys(changes).length > 0) {
      await this.prisma.adminAuthAuditLog.create({
        data: {
          adminId: actor.sub,
          username: actor.username,
          action: "system_setting_updated",
          details: toInputJsonValue({
            changes,
            actorId: actor.sub,
            actorUsername: actor.username,
          }),
        },
      });
    }

    return this.getAdminSystemSettings();
  }

  async getLandingContent(): Promise<LandingContentView> {
    if (this.landingContentCache && this.landingContentCache.expiresAt > Date.now()) {
      return this.landingContentCache.value;
    }

    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: LANDING_CONTENT_KEY },
    });

    const value = setting
      ? this.parseLandingContent(setting.value, setting.updatedAt)
      : { ...DEFAULT_LANDING_CONTENT };

    this.landingContentCache = {
      value,
      expiresAt: Date.now() + SETTINGS_CACHE_TTL_MS,
    };
    return value;
  }

  async updateLandingContent(
    dto: UpdateLandingContentDto,
    actor: AdminAuthPayload,
  ): Promise<LandingContentView> {
    const payload: LandingContentView = {
      version: "pending",
      badge: dto.badge.trim(),
      headline: dto.headline.trim(),
      subheadlineMarkdown: dto.subheadlineMarkdown.trim(),
      ctaPrimaryLabel: dto.ctaPrimaryLabel.trim(),
      ctaSecondaryLabel: dto.ctaSecondaryLabel.trim(),
      signInPrompt: dto.signInPrompt?.trim() || DEFAULT_LANDING_CONTENT.signInPrompt,
      heroBackground: dto.heroBackground ?? null,
      heroSidecard: {
        mode: dto.heroSidecard.mode,
        cardTitle: dto.heroSidecard.cardTitle.trim(),
        illustrationFootnote: dto.heroSidecard.illustrationFootnote.trim(),
        stats: dto.heroSidecard.stats
          ? {
              chartPreset: dto.heroSidecard.stats.chartPreset,
              metrics: [
                {
                  label: dto.heroSidecard.stats.metrics[0].label.trim(),
                  value: dto.heroSidecard.stats.metrics[0].value.trim(),
                },
                {
                  label: dto.heroSidecard.stats.metrics[1].label.trim(),
                  value: dto.heroSidecard.stats.metrics[1].value.trim(),
                },
              ],
            }
          : undefined,
        image: dto.heroSidecard.image,
      },
      updatedAt: null,
    };

    const stored = await this.prisma.systemSetting.upsert({
      where: { key: LANDING_CONTENT_KEY },
      create: { key: LANDING_CONTENT_KEY, value: JSON.stringify(payload) },
      update: { value: JSON.stringify(payload) },
    });

    this.landingContentCache = null;

    await this.prisma.adminAuthAuditLog.create({
      data: {
        adminId: actor.sub,
        username: actor.username,
        action: "landing_content_updated",
        details: toInputJsonValue({
          changedFields: Object.keys(dto),
          actorId: actor.sub,
          actorUsername: actor.username,
        }),
      },
    });

    return this.parseLandingContent(stored.value, stored.updatedAt);
  }

  private parseLandingContent(raw: string, updatedAt: Date): LandingContentView {
    try {
      const parsed = JSON.parse(raw) as Partial<LandingContentView>;
      const merged = mergeLandingContent(parsed);
      return {
        ...merged,
        version: updatedAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      };
    } catch {
      return { ...DEFAULT_LANDING_CONTENT };
    }
  }

  private defaultMaintenanceMode(): MaintenanceMode {
    return { enabled: false, message: DEFAULT_MAINTENANCE_MESSAGE };
  }

  private parseMaintenance(raw: string): MaintenanceMode {
    try {
      const parsed = JSON.parse(raw) as { enabled?: boolean; message?: string };
      return {
        enabled: Boolean(parsed.enabled),
        message: parsed.message?.trim() || DEFAULT_MAINTENANCE_MESSAGE,
      };
    } catch {
      return this.defaultMaintenanceMode();
    }
  }

  private parseEmailTemplates(
    raw: string,
  ): Partial<Record<EmailNotificationTemplateKey, EmailNotificationTemplate>> {
    try {
      return JSON.parse(raw) as Partial<Record<EmailNotificationTemplateKey, EmailNotificationTemplate>>;
    } catch {
      return {};
    }
  }

  private mergeEmailTemplates(
    partial: Partial<Record<EmailNotificationTemplateKey, EmailNotificationTemplate>>,
  ): Record<EmailNotificationTemplateKey, EmailNotificationTemplate> {
    const merged = { ...DEFAULT_EMAIL_TEMPLATES };
    for (const key of EMAIL_TEMPLATE_KEYS) {
      const template = partial[key];
      if (template?.subject && template?.body) {
        merged[key] = {
          subject: template.subject.trim(),
          body: template.body.trim(),
        };
      }
    }
    return merged;
  }
}
