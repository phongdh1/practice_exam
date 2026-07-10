import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { toInputJsonValue } from "../prisma/input-json";

@Injectable()
export class ZaloOAuthEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async logEvent(input: {
    externalId?: string;
    status: "received" | "processed" | "failed";
    payload: Record<string, unknown>;
    errorMessage?: string;
  }): Promise<void> {
    await this.prisma.zaloOAuthEvent.create({
      data: {
        externalId: input.externalId,
        status: input.status,
        payload: toInputJsonValue(input.payload),
        errorMessage: input.errorMessage,
        processedAt: input.status === "processed" ? new Date() : undefined,
      },
    });
  }
}
