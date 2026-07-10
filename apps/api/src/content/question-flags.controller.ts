import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/auth.guards";
import { AuthUser } from "../auth/decorators/auth-user.decorator";
import type { AuthUserPayload } from "../auth/token.service";
import { QuestionFlagsService } from "../content/question-flags.service";

@Controller("questions")
export class QuestionFlagsController {
  constructor(private readonly flagsService: QuestionFlagsService) {}

  @Post(":id/flag")
  @UseGuards(JwtAuthGuard)
  flagQuestion(
    @AuthUser() user: AuthUserPayload,
    @Param("id") questionId: string,
    @Body("comment") comment?: string,
  ) {
    return this.flagsService.createFlag(user.sub, questionId, comment);
  }
}
