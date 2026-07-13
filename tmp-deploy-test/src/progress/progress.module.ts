import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { ProgressController } from "./progress.controller";
import { ProgressService } from "./progress.service";

@Module({
  imports: [PrismaModule, AuthModule, SubscriptionsModule],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
