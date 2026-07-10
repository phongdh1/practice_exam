import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/auth.guards";
import { AuthUserPayload } from "../auth/token.service";
import { SubscriptionsService } from "./subscriptions.service";

@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@Req() req: Request & { user: AuthUserPayload }) {
    return this.subscriptionsService.listForUser(req.user.sub);
  }

  @Get(":subjectId")
  @UseGuards(JwtAuthGuard)
  getForSubject(
    @Req() req: Request & { user: AuthUserPayload },
    @Param("subjectId") subjectId: string,
  ) {
    return this.subscriptionsService.getForSubject(req.user.sub, subjectId);
  }
}
