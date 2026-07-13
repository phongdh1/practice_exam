import "./load-env";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/filters/api-exception.filter";
import { ApiEnvelopeInterceptor } from "./common/interceptors/api-envelope.interceptor";
import { resolveCorsOptions } from "./config/cors";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(resolveCorsOptions());
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ApiEnvelopeInterceptor());
  app.useGlobalFilters(new ApiExceptionFilter());
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

void bootstrap();
