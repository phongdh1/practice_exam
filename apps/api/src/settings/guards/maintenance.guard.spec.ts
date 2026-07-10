import { ServiceUnavailableException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { MaintenanceGuard } from "./maintenance.guard";
import { SettingsService } from "../settings.service";

describe("MaintenanceGuard", () => {
  let guard: MaintenanceGuard;
  const settingsService = {
    getMaintenanceMode: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceGuard,
        { provide: SettingsService, useValue: settingsService },
      ],
    }).compile();
    guard = module.get(MaintenanceGuard);
  });

  it("allows requests when maintenance is disabled", async () => {
    settingsService.getMaintenanceMode.mockResolvedValue({ enabled: false, message: "msg" });
    await expect(guard.canActivate({} as never)).resolves.toBe(true);
  });

  it("blocks requests when maintenance is enabled", async () => {
    settingsService.getMaintenanceMode.mockResolvedValue({
      enabled: true,
      message: "Đang bảo trì",
    });
    await expect(guard.canActivate({} as never)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
