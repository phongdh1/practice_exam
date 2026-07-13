import { BadRequestException, Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/auth.guards";
import type { AuthUserPayload } from "../auth/token.service";
import { ProgressService } from "./progress.service";

@Controller("progress")
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get("attempts")
  @UseGuards(JwtAuthGuard)
  listAttempts(@Req() req: Request & { user: AuthUserPayload }) {
    return this.progressService.listAttemptHistory(req.user.sub);
  }

  @Get("attempts/practice/:sessionId")
  @UseGuards(JwtAuthGuard)
  getPracticeDetail(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("sessionId") sessionId: string,
  ) {
    return this.progressService.getPracticeSessionDetail(req.user.sub, sessionId);
  }

  @Get("subjects")
  @UseGuards(JwtAuthGuard)
  getSubjectSummaries(
    @Req() req: Request & { user: AuthUserPayload },
    @Query("days") days?: string,
  ) {
    if (days !== undefined && days !== "30" && days !== "90") {
      throw new BadRequestException({
        code: "INVALID_DAYS",
        message: "Tham số days phải là 30 hoặc 90.",
      });
    }
    const windowDays = days === "90" ? 90 : 30;
    return this.progressService.getSubjectSummaries(req.user.sub, windowDays);
  }
}
