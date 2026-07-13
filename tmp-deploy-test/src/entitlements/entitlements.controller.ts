import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/auth.guards";
import { AuthUserPayload } from "../auth/token.service";
import { MaintenanceGuard } from "../settings/guards/maintenance.guard";
import { EntitlementsService } from "./entitlements.service";

@Controller("entitlements")
export class EntitlementsController {
  constructor(private readonly entitlementsService: EntitlementsService) {}

  @Get("free-tier")
  @UseGuards(JwtAuthGuard)
  listFreeTier(@Req() req: Request & { user: AuthUserPayload }) {
    return this.entitlementsService.listFreeTierUsage(req.user.sub);
  }

  @Get(":subjectId/free-tier")
  @UseGuards(JwtAuthGuard)
  getSubjectFreeTier(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("subjectId") subjectId: string,
  ) {
    return this.entitlementsService.getSubjectFreeTierStatus(req.user.sub, subjectId);
  }

  @Post(":subjectId/consume")
  @UseGuards(JwtAuthGuard, MaintenanceGuard)
  consumeFreeTier(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("subjectId") subjectId: string,
  ) {
    return this.entitlementsService.consumeFreeTierQuestion(req.user.sub, subjectId);
  }

  @Get(":subjectId/mock-exam")
  @UseGuards(JwtAuthGuard)
  getMockExamAccess(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("subjectId") subjectId: string,
  ) {
    return this.entitlementsService.getMockExamAccess(req.user.sub, subjectId);
  }
}
