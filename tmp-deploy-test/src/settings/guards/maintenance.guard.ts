import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { SettingsService } from "../settings.service";

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(private readonly settingsService: SettingsService) {}

  async canActivate(_context: ExecutionContext): Promise<boolean> {
    const maintenance = await this.settingsService.getMaintenanceMode();
    if (maintenance.enabled) {
      throw new ServiceUnavailableException({
        code: "MAINTENANCE_MODE",
        message: maintenance.message,
      });
    }
    return true;
  }
}
