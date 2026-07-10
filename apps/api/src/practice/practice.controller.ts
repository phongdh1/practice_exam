import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/auth.guards";
import type { AuthUserPayload } from "../auth/token.service";
import { MaintenanceGuard } from "../settings/guards/maintenance.guard";
import { StartPracticeSessionDto, SubmitPracticeAnswerDto } from "./dto/practice.dto";
import { PracticeService } from "./practice.service";

@Controller("practice/sessions")
@UseGuards(MaintenanceGuard)
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Get("active/:subjectId")
  @UseGuards(JwtAuthGuard)
  getActive(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("subjectId") subjectId: string,
  ) {
    return this.practiceService.getActiveSession(req.user.sub, subjectId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  start(
    @Req() req: Request & { user: AuthUserPayload },
    @Body() dto: StartPracticeSessionDto,
  ) {
    return this.practiceService.startOrResumeSession(
      req.user.sub,
      dto.subjectId,
      dto.forceNew ?? false,
    );
  }

  @Get(":sessionId")
  @UseGuards(JwtAuthGuard)
  getSession(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("sessionId") sessionId: string,
  ) {
    return this.practiceService.getSession(req.user.sub, sessionId);
  }

  @Get(":sessionId/question")
  @UseGuards(JwtAuthGuard)
  getQuestion(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("sessionId") sessionId: string,
  ) {
    return this.practiceService.getCurrentQuestion(req.user.sub, sessionId);
  }

  @Post(":sessionId/answer")
  @UseGuards(JwtAuthGuard)
  submitAnswer(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("sessionId") sessionId: string,
    @Body() dto: SubmitPracticeAnswerDto,
  ) {
    return this.practiceService.submitAnswer(
      req.user.sub,
      sessionId,
      dto.questionId,
      dto.selectedKeys,
    );
  }

  @Post(":sessionId/end")
  @UseGuards(JwtAuthGuard)
  endSession(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("sessionId") sessionId: string,
  ) {
    return this.practiceService.endSession(req.user.sub, sessionId);
  }
}
