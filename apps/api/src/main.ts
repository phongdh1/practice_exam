import "./load-env";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/filters/api-exception.filter";
import { ApiEnvelopeInterceptor } from "./common/interceptors/api-envelope.interceptor";
import { resolveCorsOptions } from "./config/cors";
import { configureBodyParsers } from "./config/body-parsers";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  configureBodyParsers(app);
  app.enableCors(resolveCorsOptions());
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ApiEnvelopeInterceptor());
  app.useGlobalFilters(new ApiExceptionFilter());
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}

void bootstrap();
