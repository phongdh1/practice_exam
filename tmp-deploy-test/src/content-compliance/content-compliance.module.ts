import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ContentComplianceController } from "./content-compliance.controller";
import { ContentComplianceService } from "./content-compliance.service";

@Module({
  imports: [AuthModule],
  controllers: [ContentComplianceController],
  providers: [ContentComplianceService],
  exports: [ContentComplianceService],
})
export class ContentComplianceModule {}
