import { Controller, Get } from "@nestjs/common";
import type { HealthData } from "@practice-exam/types";

@Controller("health")
export class HealthController {
  @Get()
  getHealth(): HealthData {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
