import { Module } from "@nestjs/common";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { QuestionsModule } from "../questions/questions.module";
import { ContentAdminController } from "./content-admin.controller";
import { QuestionFlagsController } from "./question-flags.controller";
import { ContentService } from "./content.service";
import { QuestionFlagsService } from "./question-flags.service";

@Module({
  imports: [PrismaModule, AdminAuthModule, AuthModule, QuestionsModule],
  controllers: [ContentAdminController, QuestionFlagsController],
  providers: [ContentService, QuestionFlagsService],
  exports: [ContentService, QuestionFlagsService],
})
export class ContentModule {}
