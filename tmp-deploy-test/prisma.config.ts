import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, env } from "prisma/config";

const rootEnv = resolve(__dirname, "../../.env");
const apiEnv = resolve(__dirname, ".env");

if (existsSync(rootEnv)) {
  config({ path: rootEnv });
}
if (existsSync(apiEnv)) {
  config({ path: apiEnv, override: true });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    // Prisma CLI (migrate, db push) uses `url` — must be the direct/session connection (port 5432).
    url: env("DIRECT_URL"),
  },
});
