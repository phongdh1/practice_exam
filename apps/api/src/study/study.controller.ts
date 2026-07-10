import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/auth.guards";
import type { AuthUserPayload } from "../auth/token.service";
import { MaintenanceGuard } from "../settings/guards/maintenance.guard";
import { ListStudyQuestionsDto } from "./dto/study.dto";
import { StudyService } from "./study.service";

@Controller("study/subjects")
@UseGuards(MaintenanceGuard)
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Get(":subjectId/tier")
  @UseGuards(JwtAuthGuard)
  getStudyTier(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("subjectId") subjectId: string,
  ) {
    return this.studyService.getStudyTierStatus(req.user.sub, subjectId);
  }

  @Get(":subjectId/questions")
  @UseGuards(JwtAuthGuard)
  listQuestions(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("subjectId") subjectId: string,
    @Query() query: ListStudyQuestionsDto,
  ) {
    return this.studyService.listQuestions(req.user.sub, subjectId, query);
  }

  @Get(":subjectId/questions/:questionId")
  @UseGuards(JwtAuthGuard)
  getQuestionDetail(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("subjectId") subjectId: string,
    @Param("questionId") questionId: string,
  ) {
    return this.studyService.getQuestionDetail(req.user.sub, subjectId, questionId);
  }
}
