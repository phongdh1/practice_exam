import { Controller, Get } from "@nestjs/common";
import { SettingsService } from "./settings.service";

@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get("disclaimer")
  getDisclaimer() {
    return this.settingsService.getPlatformDisclaimer();
  }

  @Get("maintenance")
  getMaintenance() {
    return this.settingsService.getMaintenanceMode();
  }

  @Get("landing-content")
  getLandingContent() {
    return this.settingsService.getLandingContent();
  }
}
