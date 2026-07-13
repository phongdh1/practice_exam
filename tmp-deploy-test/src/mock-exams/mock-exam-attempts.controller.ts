import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/auth.guards";
import type { AuthUserPayload } from "../auth/token.service";
import { MaintenanceGuard } from "../settings/guards/maintenance.guard";
import {
  GetMockExamQuestionQueryDto,
  SaveMockExamAnswerDto,
  StartMockExamAttemptDto,
} from "./dto/mock-exam-attempt.dto";
import { MockExamAttemptsService } from "./mock-exam-attempts.service";

@Controller("mock-exam-attempts")
@UseGuards(MaintenanceGuard)
export class MockExamAttemptsController {
  constructor(private readonly attemptsService: MockExamAttemptsService) {}

  @Get("by-subject/:subjectId")
  @UseGuards(JwtAuthGuard)
  listBySubject(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("subjectId") subjectId: string,
  ) {
    return this.attemptsService.listCandidateTemplates(req.user.sub, subjectId);
  }

  @Get("active/:templateId")
  @UseGuards(JwtAuthGuard)
  getActive(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("templateId") templateId: string,
  ) {
    return this.attemptsService.getActiveAttempt(req.user.sub, templateId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  start(
    @Req() req: Request & { user: AuthUserPayload },
    @Body() dto: StartMockExamAttemptDto,
  ) {
    return this.attemptsService.startAttempt(req.user.sub, dto.templateId);
  }

  @Get(":attemptId")
  @UseGuards(JwtAuthGuard)
  getAttempt(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("attemptId") attemptId: string,
  ) {
    return this.attemptsService.getAttempt(req.user.sub, attemptId);
  }

  @Get(":attemptId/question")
  @UseGuards(JwtAuthGuard)
  getQuestion(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("attemptId") attemptId: string,
    @Query() query: GetMockExamQuestionQueryDto,
  ) {
    return this.attemptsService.getQuestion(req.user.sub, attemptId, query.questionId);
  }

  @Post(":attemptId/answer")
  @UseGuards(JwtAuthGuard)
  saveAnswer(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("attemptId") attemptId: string,
    @Body() dto: SaveMockExamAnswerDto,
  ) {
    return this.attemptsService.saveAnswer(
      req.user.sub,
      attemptId,
      dto.questionId,
      dto.selectedKeys,
    );
  }

  @Post(":attemptId/advance-section")
  @UseGuards(JwtAuthGuard)
  advanceSection(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("attemptId") attemptId: string,
  ) {
    return this.attemptsService.advanceSection(req.user.sub, attemptId);
  }

  @Get(":attemptId/review")
  @UseGuards(JwtAuthGuard)
  getReview(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("attemptId") attemptId: string,
  ) {
    return this.attemptsService.getReviewGrid(req.user.sub, attemptId);
  }

  @Post(":attemptId/submit")
  @UseGuards(JwtAuthGuard)
  submit(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("attemptId") attemptId: string,
  ) {
    return this.attemptsService.submitAttempt(req.user.sub, attemptId);
  }

  @Get(":attemptId/results")
  @UseGuards(JwtAuthGuard)
  getResults(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("attemptId") attemptId: string,
  ) {
    return this.attemptsService.getResults(req.user.sub, attemptId);
  }
}
