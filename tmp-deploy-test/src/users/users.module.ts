import { Module } from "@nestjs/common";
import { AdminAuthModule } from "../admin-auth/admin-auth.module";
import { AuthModule } from "../auth/auth.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { UsersAdminController } from "./users-admin.controller";
import { UsersAdminService } from "./users-admin.service";

@Module({
  imports: [AdminAuthModule, AuthModule, SubscriptionsModule],
  controllers: [UsersAdminController],
  providers: [UsersAdminService],
})
export class UsersModule {}
