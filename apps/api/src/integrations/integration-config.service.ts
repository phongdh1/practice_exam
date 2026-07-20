import { BadRequestException, Injectable } from "@nestjs/common";
import type { PaymentProvider } from "@prisma/client";
import type {
  PaymentMerchantConfigView,
  ZaloMiniAppConfigView,
} from "@practice-exam/types";
import { PrismaService } from "../prisma/prisma.service";
import { toOptionalInputJsonValue } from "../prisma/input-json";
import {
  paymentMerchantConfigKey,
  ZALO_MINI_APP_CONFIG_KEY,
} from "./integration-config.keys";
import type {
  PaymentMerchantConfigStored,
  ZaloMiniAppConfigStored,
} from "./integration-config.types";
import { maskSecret, mergeSecretField } from "./integration-secrets.util";

function parseJsonSetting<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function publicApiBase(): string {
  return process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;
}

@Injectable()
export class IntegrationConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getZaloConfigView(): Promise<ZaloMiniAppConfigView> {
    const stored = await this.getZaloConfigStored();
    if (!stored?.appId) {
      return {
        appId: null,
        appSecretMasked: null,
        callbackUrl: stored?.callbackUrl ?? null,
        deploymentStatus: "not_configured",
        lastVerifiedAt: null,
        diagnosticError: null,
      };
    }

    return {
      appId: stored.appId,
      appSecretMasked: maskSecret(stored.appSecret),
      callbackUrl: stored.callbackUrl ?? null,
      deploymentStatus: stored.deploymentStatus,
      lastVerifiedAt: stored.lastVerifiedAt ?? null,
      diagnosticError: stored.lastError ?? null,
    };
  }

  async getZaloCredentials(): Promise<{ appId: string; appSecret: string } | null> {
    const envAppId = process.env.ZALO_APP_ID;
    const envSecret = process.env.ZALO_APP_SECRET;
    const stored = await this.getZaloConfigStored();
    const appId = stored?.appId || envAppId;
    const appSecret = stored?.appSecret || envSecret;
    if (!appId || !appSecret) return null;
    return { appId, appSecret };
  }

  async updateZaloConfig(
    input: {
      appId: string;
      appSecret?: string;
      callbackUrl?: string;
    },
    adminId: string,
  ): Promise<ZaloMiniAppConfigView> {
    const existing = await this.getZaloConfigStored();
    const appSecret = mergeSecretField(input.appSecret, existing?.appSecret);
    if (!input.appId || !appSecret) {
      throw new BadRequestException({
        code: "ZALO_CONFIG_INVALID",
        message: "App ID và App Secret là bắt buộc.",
      });
    }

    const next: ZaloMiniAppConfigStored = {
      appId: input.appId.trim(),
      appSecret,
      callbackUrl: input.callbackUrl?.trim() || undefined,
      deploymentStatus: "configured",
      lastVerifiedAt: undefined,
      lastError: undefined,
    };

    await this.saveSetting(ZALO_MINI_APP_CONFIG_KEY, next);
    await this.writeAudit(adminId, "zalo", "update_config", {
      appId: next.appId,
      deploymentStatus: next.deploymentStatus,
    });

    return this.getZaloConfigView();
  }

  async verifyZaloConfig(adminId: string): Promise<ZaloMiniAppConfigView> {
    const credentials = await this.getZaloCredentials();
    if (!credentials) {
      throw new BadRequestException({
        code: "ZALO_NOT_CONFIGURED",
        message: "Chưa cấu hình Zalo Mini App.",
      });
    }

    const existing = await this.getZaloConfigStored();
    const diagnostic = await this.probeZaloCredentials(credentials.appId, credentials.appSecret);
    const next: ZaloMiniAppConfigStored = {
      appId: credentials.appId,
      appSecret: credentials.appSecret,
      callbackUrl: existing?.callbackUrl,
      deploymentStatus: diagnostic.ok ? "verified" : "invalid",
      lastVerifiedAt: new Date().toISOString(),
      lastError: diagnostic.ok ? undefined : diagnostic.error,
    };

    await this.saveSetting(ZALO_MINI_APP_CONFIG_KEY, next);
    await this.writeAudit(adminId, "zalo", "verify_config", {
      deploymentStatus: next.deploymentStatus,
      diagnosticError: next.lastError ?? null,
    });

    return this.getZaloConfigView();
  }

  async getPaymentMerchantView(provider: PaymentProvider): Promise<PaymentMerchantConfigView> {
    const stored = await this.getPaymentMerchantStored(provider);
    return this.toPaymentMerchantView(provider, stored);
  }

  async getPaymentMerchantStored(provider: PaymentProvider): Promise<PaymentMerchantConfigStored | null> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: paymentMerchantConfigKey(provider) },
    });
    return parseJsonSetting<PaymentMerchantConfigStored>(setting?.value);
  }

  async isProviderTestMode(provider: PaymentProvider): Promise<boolean> {
    const stored = await this.getPaymentMerchantStored(provider);
    return stored?.testMode ?? true;
  }

  async writeIntegrationAudit(
    adminId: string,
    integration: string,
    action: string,
    details?: Record<string, unknown>,
  ): Promise<void> {
    await this.writeAudit(adminId, integration, action, details);
  }

  async updatePaymentMerchantConfig(
    provider: PaymentProvider,
    input: {
      merchantId?: string;
      apiKey?: string;
      checksumKey?: string;
      webhookSecret?: string;
      testMode: boolean;
      bankAccountNumber?: string;
      bankCode?: string;
      accountHolder?: string;
    },
    adminId: string,
  ): Promise<PaymentMerchantConfigView> {
    const existing = await this.getPaymentMerchantStored(provider);
    const apiKey = mergeSecretField(input.apiKey, existing?.apiKey);
    const checksumKey = mergeSecretField(input.checksumKey, existing?.checksumKey);
    const webhookSecret = mergeSecretField(input.webhookSecret, existing?.webhookSecret);

    const merchantId = (input.merchantId ?? existing?.merchantId ?? "").trim();
    const bankAccountNumber = (
      input.bankAccountNumber ??
      existing?.bankAccountNumber ??
      ""
    ).trim();
    const bankCode = (input.bankCode ?? existing?.bankCode ?? "").trim();
    const accountHolder = (input.accountHolder ?? existing?.accountHolder ?? "").trim();

    const hasHostedCreds = Boolean(merchantId && apiKey);
    const hasBankQr = Boolean(bankAccountNumber && bankCode);

    if (provider === "sepay") {
      if (!hasHostedCreds && !hasBankQr) {
        throw new BadRequestException({
          code: "PAYMENT_CONFIG_INVALID",
          message:
            "SePay cần tài khoản ngân hàng (số TK + mã NH) để tạo VietQR, hoặc Merchant ID + API key.",
        });
      }
    } else if (!hasHostedCreds) {
      throw new BadRequestException({
        code: "PAYMENT_CONFIG_INVALID",
        message: "Merchant ID và API key là bắt buộc.",
      });
    }

    const next: PaymentMerchantConfigStored = {
      merchantId: merchantId || (provider === "sepay" ? "sepay-bank" : merchantId),
      apiKey: apiKey || (provider === "sepay" ? "sepay-bank" : apiKey!),
      checksumKey: checksumKey || undefined,
      webhookSecret: webhookSecret || undefined,
      testMode: input.testMode,
      bankAccountNumber: bankAccountNumber || undefined,
      bankCode: bankCode || undefined,
      accountHolder: accountHolder || undefined,
    };

    await this.saveSetting(paymentMerchantConfigKey(provider), next);
    await this.writeAudit(adminId, provider, "update_merchant_config", {
      merchantId: next.merchantId,
      testMode: next.testMode,
      hasBankQr: Boolean(next.bankAccountNumber && next.bankCode),
    });

    return this.toPaymentMerchantView(provider, next);
  }

  private async getZaloConfigStored(): Promise<ZaloMiniAppConfigStored | null> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: ZALO_MINI_APP_CONFIG_KEY },
    });
    return parseJsonSetting<ZaloMiniAppConfigStored>(setting?.value);
  }

  private toPaymentMerchantView(
    provider: PaymentProvider,
    stored: PaymentMerchantConfigStored | null,
  ): PaymentMerchantConfigView {
    const webhookPath = `/api/v1/webhooks/${provider}`;
    const hasHosted = Boolean(
      stored?.merchantId &&
        stored.merchantId !== "sepay-bank" &&
        stored?.apiKey &&
        stored.apiKey !== "sepay-bank",
    );
    const hasBankQr = Boolean(stored?.bankAccountNumber && stored?.bankCode);
    return {
      provider,
      merchantId: stored?.merchantId && stored.merchantId !== "sepay-bank" ? stored.merchantId : null,
      apiKeyMasked: stored?.apiKey && stored.apiKey !== "sepay-bank" ? maskSecret(stored.apiKey) : null,
      checksumKeyMasked: maskSecret(stored?.checksumKey),
      webhookSecretMasked: maskSecret(stored?.webhookSecret),
      testMode: stored?.testMode ?? true,
      webhookUrl: `${publicApiBase()}${webhookPath}`,
      configured: provider === "sepay" ? hasHosted || hasBankQr : hasHosted,
      bankAccountNumber: stored?.bankAccountNumber ?? null,
      bankCode: stored?.bankCode ?? null,
      accountHolder: stored?.accountHolder ?? null,
    };
  }

  private async saveSetting(key: string, value: unknown): Promise<void> {
    await this.prisma.systemSetting.upsert({
      where: { key },
      create: { key, value: JSON.stringify(value) },
      update: { value: JSON.stringify(value) },
    });
  }

  private async writeAudit(
    adminId: string,
    integration: string,
    action: string,
    details?: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.integrationAuditLog.create({
      data: {
        adminId,
        integration,
        action,
        details: toOptionalInputJsonValue(details),
      },
    });
  }

  private async probeZaloCredentials(
    appId: string,
    appSecret: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    if (process.env.NODE_ENV === "test") {
      if (appId === "invalid" || appSecret === "invalid") {
        return { ok: false, error: "ZALO_VERIFY_FAILED" };
      }
      return { ok: true };
    }

    try {
      const res = await fetch("https://oauth.zaloapp.com/v4/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          secret_key: appSecret,
        },
        body: new URLSearchParams({
          app_id: appId,
          grant_type: "authorization_code",
          code: "credential-probe-invalid",
          code_verifier: "credential-probe-verifier",
        }),
      });

      const data = (await res.json()) as {
        access_token?: string;
        error?: number;
        error_name?: string;
        message?: string;
      };

      if (data.access_token) {
        return { ok: true };
      }

      if (data.error === -14014 || data.error === -216) {
        return { ok: false, error: "ZALO_APP_SECRET_INVALID" };
      }

      // Invalid or expired authorization code implies app_id + secret_key were accepted.
      if (data.error === -14010 || data.error === -14020 || data.error === -124) {
        return { ok: true };
      }

      return { ok: false, error: "ZALO_VERIFY_FAILED" };
    } catch {
      return { ok: false, error: "ZALO_VERIFY_FAILED" };
    }
  }
}
