import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { IntegrationConfigService } from "./integration-config.service";
import { ZALO_MINI_APP_CONFIG_KEY } from "./integration-config.keys";

describe("IntegrationConfigService", () => {
  let service: IntegrationConfigService;

  const mockPrisma = {
    systemSetting: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    integrationAuditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationConfigService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(IntegrationConfigService);
  });

  it("returns not_configured when zalo settings missing", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue(null);

    const view = await service.getZaloConfigView();

    expect(view.deploymentStatus).toBe("not_configured");
    expect(view.appSecretMasked).toBeNull();
  });

  it("masks secrets in zalo config view", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue({
      key: ZALO_MINI_APP_CONFIG_KEY,
      value: JSON.stringify({
        appId: "12345",
        appSecret: "super-secret-key",
        deploymentStatus: "configured",
      }),
    });

    const view = await service.getZaloConfigView();

    expect(view.appId).toBe("12345");
    expect(view.appSecretMasked).toBe("****-key");
    expect(view.diagnosticError).toBeNull();
  });

  it("audit-logs zalo config updates", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue(null);
    mockPrisma.systemSetting.upsert.mockResolvedValue({});

    await service.updateZaloConfig(
      { appId: "app-1", appSecret: "secret-1" },
      "admin-uuid",
    );

    expect(mockPrisma.integrationAuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          adminId: "admin-uuid",
          integration: "zalo",
          action: "update_config",
        }),
      }),
    );
  });

  it("rejects payment merchant update without merchant id", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue(null);

    await expect(
      service.updatePaymentMerchantConfig(
        "payos",
        { merchantId: "", apiKey: "key", testMode: true },
        "admin-uuid",
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("marks provider test mode from stored config", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue({
      key: "payment_merchant_payos",
      value: JSON.stringify({ merchantId: "m1", apiKey: "k1", testMode: true }),
    });

    await expect(service.isProviderTestMode("payos")).resolves.toBe(true);
  });

  it("defaults provider test mode to true when merchant config is absent", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue(null);

    await expect(service.isProviderTestMode("payos")).resolves.toBe(true);
  });

  it("verifies zalo credentials via oauth token exchange probe", async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({ error: -14010 }),
    } as Response);

    mockPrisma.systemSetting.findUnique.mockResolvedValue({
      key: ZALO_MINI_APP_CONFIG_KEY,
      value: JSON.stringify({
        appId: "app-1",
        appSecret: "secret-1",
        deploymentStatus: "configured",
      }),
    });
    mockPrisma.systemSetting.upsert.mockResolvedValue({});

    await service.verifyZaloConfig("admin-uuid");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://oauth.zaloapp.com/v4/access_token",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ secret_key: "secret-1" }),
      }),
    );
    expect(mockPrisma.systemSetting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: {
          value: expect.stringContaining('"deploymentStatus":"verified"'),
        },
      }),
    );

    fetchMock.mockRestore();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("marks zalo credentials invalid when oauth probe reports bad secret", async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({ error: -14014 }),
    } as Response);

    mockPrisma.systemSetting.findUnique.mockResolvedValue({
      key: ZALO_MINI_APP_CONFIG_KEY,
      value: JSON.stringify({
        appId: "app-1",
        appSecret: "bad-secret",
        deploymentStatus: "configured",
      }),
    });
    mockPrisma.systemSetting.upsert.mockResolvedValue({});

    await service.verifyZaloConfig("admin-uuid");

    expect(mockPrisma.systemSetting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: {
          value: expect.stringContaining('"deploymentStatus":"invalid"'),
        },
      }),
    );
    expect(mockPrisma.systemSetting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: {
          value: expect.stringContaining('"lastError":"ZALO_APP_SECRET_INVALID"'),
        },
      }),
    );

    fetchMock.mockRestore();
    process.env.NODE_ENV = originalNodeEnv;
  });
});
