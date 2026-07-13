import "../load-env";
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { assertDatabaseEnv } from "../config/database-url";
import { createPrismaAdapter } from "./create-prisma-adapter";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({ adapter: createPrismaAdapter() });
  }

  async onModuleInit() {
    try {
      assertDatabaseEnv();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(message);
      throw error;
    }

    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
