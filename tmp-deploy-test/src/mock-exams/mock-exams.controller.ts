import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/auth.guards";
import { AuthUserPayload } from "../auth/token.service";
import { EntitlementsService } from "../entitlements/entitlements.service";
import { MockExamsService } from "./mock-exams.service";

@Controller("mock-exam-templates")
export class MockExamsController {
  constructor(
    private readonly mockExamsService: MockExamsService,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  @Get("by-subject/:subjectId")
  @UseGuards(JwtAuthGuard)
  listBySubject(
    @Req() _req: Request & { user: AuthUserPayload },
    @Param("subjectId") subjectId: string,
  ) {
    return this.mockExamsService.listBySubject(subjectId);
  }

  @Get(":templateId/attempts")
  @UseGuards(JwtAuthGuard)
  getAttemptStatus(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("templateId") templateId: string,
  ) {
    return this.mockExamsService.getAttemptStatus(req.user.sub, templateId);
  }

  @Get(":templateId/access")
  @UseGuards(JwtAuthGuard)
  async getAccess(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("templateId") templateId: string,
  ) {
    const template = await this.mockExamsService.findApprovedForCandidate(templateId);
    const [access, attempts] = await Promise.all([
      this.entitlementsService.getMockExamAccess(req.user.sub, template.subjectId),
      this.mockExamsService.getAttemptStatus(req.user.sub, templateId),
    ]);
    return { access, attempts };
  }
}
