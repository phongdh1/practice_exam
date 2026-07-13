import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/auth.guards";
import { ContentComplianceService } from "./content-compliance.service";

class ScanContentDto {
  text!: string;
}

@Controller("content-compliance")
export class ContentComplianceController {
  constructor(private readonly contentComplianceService: ContentComplianceService) {}

  @Post("scan")
  @UseGuards(JwtAuthGuard)
  scan(@Body() dto: ScanContentDto) {
    return this.contentComplianceService.scan(dto.text);
  }
}
