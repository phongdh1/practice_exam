import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const message =
        typeof payload === "string"
          ? payload
          : ((payload as { message?: string | string[] }).message ?? exception.message);
      const code =
        typeof payload === "object" && payload !== null && "code" in payload
          ? String((payload as { code: string }).code)
          : HttpStatus[status] ?? "HTTP_ERROR";

      const body: ApiErrorBody = {
        error: {
          code,
          message: Array.isArray(message) ? message.join(", ") : message,
          details:
            typeof payload === "object" && payload !== null && "details" in payload
              ? (payload as { details: Record<string, unknown> }).details
              : undefined,
        },
      };
      response.status(status).json(body);
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Đã xảy ra lỗi. Vui lòng thử lại.",
      },
    } satisfies ApiErrorBody);
  }
}
