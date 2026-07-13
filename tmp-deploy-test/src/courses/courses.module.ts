import { Module } from "@nestjs/common";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { ContentComplianceModule } from "../content-compliance/content-compliance.module";
import { CoursesAdminController } from "./courses-admin.controller";
import { CoursesService } from "./courses.service";

@Module({
  imports: [AdminAuthModule, ContentComplianceModule],
  controllers: [CoursesAdminController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
