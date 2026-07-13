import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

/** Wrap successful responses in { data } envelope (architecture spine) */
@Injectable()
export class ApiEnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        if (data instanceof StreamableFile) {
          return data;
        }
        return { data };
      }),
    );
  }
}
