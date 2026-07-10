import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { ContentComplianceModule } from "../content-compliance/content-compliance.module";
import { SubjectsAdminController } from "./subjects-admin.controller";
import { SubjectsController } from "./subjects.controller";
import { SubjectsService } from "./subjects.service";

@Module({
  imports: [ContentComplianceModule, AuthModule, AdminAuthModule],
  controllers: [SubjectsController, SubjectsAdminController],
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}
