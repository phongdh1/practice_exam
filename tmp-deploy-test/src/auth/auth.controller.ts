import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { LoginDto, RefreshTokenDto, RegisterDto, ZaloAuthDto } from "./dto/auth.dto";
import { JwtAuthGuard } from "./guards/auth.guards";
// TODO: re-enable when GOOGLE_CLIENT_ID is configured
// import { GoogleAuthGuard } from "./guards/auth.guards";
// import { GoogleProfileResult } from "./strategies/google.strategy";
import { AuthUserPayload } from "./token.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body(new ValidationPipe({ whitelist: true })) dto: RegisterDto) {
    return this.authService.registerWithEmail(dto.email, dto.password, dto.displayName);
  }

  @Post("login")
  login(@Body(new ValidationPipe({ whitelist: true })) dto: LoginDto) {
    return this.authService.loginWithEmail(dto.email, dto.password);
  }

  @Post("refresh")
  refresh(@Body(new ValidationPipe({ whitelist: true })) dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post("zalo")
  zaloSignIn(@Body(new ValidationPipe({ whitelist: true })) dto: ZaloAuthDto) {
    return this.authService.signInWithZalo(dto.accessToken);
  }

  // TODO: re-enable when GOOGLE_CLIENT_ID is configured
  // @Get("google")
  // @UseGuards(GoogleAuthGuard)
  // googleSignIn(): void {
  //   // Passport initiates redirect
  // }
  //
  // @Get("google/callback")
  // @UseGuards(GoogleAuthGuard)
  // async googleCallback(
  //   @Req() req: Request & { user?: GoogleProfileResult },
  //   @Res() res: Response,
  // ): Promise<void> {
  //   const profile = req.user;
  //   if (!profile) {
  //     res.redirect(this.webAuthErrorUrl("google"));
  //     return;
  //   }
  //
  //   const linkUserId = this.parseLinkState(profile.state);
  //   const webBase = process.env.WEB_APP_URL ?? "http://localhost:3000";
  //
  //   try {
  //     const result = linkUserId
  //       ? await this.authService.linkProvider(linkUserId, {
  //           provider: "google",
  //           externalId: profile.googleId,
  //           displayName: profile.displayName,
  //           avatarUrl: profile.avatarUrl,
  //         })
  //       : await this.authService.signInWithOAuth({
  //           provider: "google",
  //           externalId: profile.googleId,
  //           displayName: profile.displayName,
  //           avatarUrl: profile.avatarUrl,
  //         });
  //
  //     const redirectPath = result.mergeSummary ? "/account/merge-summary" : "/auth/callback";
  //     const params = new URLSearchParams({
  //       accessToken: result.tokens.accessToken,
  //       refreshToken: result.tokens.refreshToken,
  //     });
  //     if (result.mergeSummary) {
  //       params.set("mergeSummary", JSON.stringify(result.mergeSummary));
  //     }
  //     res.redirect(`${webBase}${redirectPath}?${params.toString()}`);
  //   } catch {
  //     res.redirect(this.webAuthErrorUrl("google"));
  //   }
  // }
  //
  // @Get("link/google")
  // @UseGuards(JwtAuthGuard)
  // linkGoogleStart(
  //   @Req() req: Request & { user: AuthUserPayload },
  //   @Res() res: Response,
  // ): void {
  //   const state = `link:${req.user.sub}`;
  //   const clientId = process.env.GOOGLE_CLIENT_ID ?? "google-client-id-placeholder";
  //   const callback =
  //     process.env.GOOGLE_CALLBACK_URL ??
  //     "http://localhost:3001/api/v1/auth/google/callback";
  //   const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  //   url.searchParams.set("client_id", clientId);
  //   url.searchParams.set("redirect_uri", callback);
  //   url.searchParams.set("response_type", "code");
  //   url.searchParams.set("scope", "email profile");
  //   url.searchParams.set("state", state);
  //   res.redirect(url.toString());
  // }

  @Post("link/zalo")
  @UseGuards(JwtAuthGuard)
  linkZalo(
    @Req() req: Request & { user: AuthUserPayload },
    @Body(new ValidationPipe({ whitelist: true })) dto: ZaloAuthDto,
  ) {
    return this.authService.linkZalo(req.user.sub, dto.accessToken);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request & { user: AuthUserPayload }) {
    return this.authService.getMe(req.user.sub);
  }

  // TODO: re-enable when GOOGLE_CLIENT_ID is configured
  // private parseLinkState(state?: string): string | null {
  //   if (!state?.startsWith("link:")) return null;
  //   return state.slice("link:".length) || null;
  // }
  //
  // private webAuthErrorUrl(provider: string): string {
  //   const webBase = process.env.WEB_APP_URL ?? "http://localhost:3000";
  //   return `${webBase}/auth/error?provider=${provider}`;
  // }
}
