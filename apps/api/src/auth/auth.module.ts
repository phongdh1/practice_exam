import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { IntegrationsModule } from "../integrations/integrations.module";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
// TODO: re-enable when GOOGLE_CLIENT_ID is configured
// import { GoogleStrategy } from "./strategies/google.strategy";
import { TokenService } from "./token.service";
import { ZaloOAuthService } from "./zalo-oauth.service";
import { UserMergeService } from "./user-merge.service";

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => IntegrationsModule),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    ZaloOAuthService,
    UserMergeService,
    JwtStrategy,
    // GoogleStrategy,
  ],
  exports: [AuthService, JwtStrategy, UserMergeService],
})
export class AuthModule {}
