import { Module } from "@nestjs/common";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { QuestionsAdminController } from "./questions-admin.controller";
import { ImportQuestionsController } from "./import-questions.controller";
import { QuestionsService } from "./questions.service";
import { ImportQuestionsService } from "./import-questions.service";

@Module({
  imports: [PrismaModule, AdminAuthModule],
  controllers: [QuestionsAdminController, ImportQuestionsController],
  providers: [QuestionsService, ImportQuestionsService],
  exports: [QuestionsService, ImportQuestionsService],
})
export class QuestionsModule {}
