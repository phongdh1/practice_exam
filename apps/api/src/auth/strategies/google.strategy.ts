// TODO: re-enable when GOOGLE_CLIENT_ID is configured
// import { Injectable } from "@nestjs/common";
// import { PassportStrategy } from "@nestjs/passport";
// import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";

export interface GoogleProfileResult {
  googleId: string;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
  state?: string;
}

// TODO: re-enable when GOOGLE_CLIENT_ID is configured
// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
//   constructor() {
//     super({
//       clientID: process.env.GOOGLE_CLIENT_ID ?? "google-client-id-placeholder",
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "google-client-secret-placeholder",
//       callbackURL:
//         process.env.GOOGLE_CALLBACK_URL ??
//         "http://localhost:3001/api/v1/auth/google/callback",
//       scope: ["email", "profile"],
//       passReqToCallback: true,
//     });
//   }
//
//   validate(
//     req: { query?: { state?: string } },
//     _accessToken: string,
//     _refreshToken: string,
//     profile: Profile,
//     done: VerifyCallback,
//   ): void {
//     done(null, {
//       googleId: profile.id,
//       displayName: profile.displayName,
//       avatarUrl: profile.photos?.[0]?.value,
//       email: profile.emails?.[0]?.value,
//       state: req.query?.state,
//     } satisfies GoogleProfileResult);
//   }
// }
