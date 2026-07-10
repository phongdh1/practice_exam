import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { PrismaModule } from "../prisma/prisma.module";
import { AdminAuthController } from "./admin-auth.controller";
import { AdminAuthService } from "./admin-auth.service";
import { AdminRolesGuard } from "./guards/admin-roles.guard";
import { RbacAdminController } from "./rbac/rbac-admin.controller";
import { AdminJwtStrategy } from "./strategies/admin-jwt.strategy";

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({}),
  ],
  controllers: [AdminAuthController, RbacAdminController],
  providers: [AdminAuthService, AdminJwtStrategy, AdminRolesGuard],
  exports: [AdminAuthService, AdminJwtStrategy, AdminRolesGuard],
})
export class AdminAuthModule {}
