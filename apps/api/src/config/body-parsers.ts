import type { NestExpressApplication } from "@nestjs/platform-express";

export function configureBodyParsers(app: NestExpressApplication): void {
  // A 10 MiB subject cover expands to about 13.33 MiB when encoded as base64.
  app.useBodyParser("json", { limit: "16mb" });
  app.useBodyParser("urlencoded", { extended: true });
}
