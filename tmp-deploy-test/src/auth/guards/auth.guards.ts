import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AUTH_ERRORS_VI } from "../constants/auth-errors.vi";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest<T>(err: Error | null, user: T): T {
    if (err || !user) {
      throw new UnauthorizedException({
        code: "UNAUTHORIZED",
        message: AUTH_ERRORS_VI.UNAUTHORIZED,
      });
    }
    return user;
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

// TODO: re-enable when GOOGLE_CLIENT_ID is configured
// @Injectable()
// export class GoogleAuthGuard extends AuthGuard("google") {}
