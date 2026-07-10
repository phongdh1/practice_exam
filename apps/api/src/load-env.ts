import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Resolve monorepo root `.env` and optional `apps/api/.env` fallback.
 * Works when compiled to `dist/` or run from `src/` via Nest watch.
 */
function resolveEnvPaths(): { rootEnv: string; apiEnv: string } {
  const fromDir = __dirname;
  const rootEnv = resolve(fromDir, "../../../.env");
  const apiEnv = resolve(fromDir, "../.env");
  return { rootEnv, apiEnv };
}

export function loadEnv(): void {
  const { rootEnv, apiEnv } = resolveEnvPaths();

  // Shared defaults from monorepo root; app-specific `apps/api/.env` wins.
  if (existsSync(rootEnv)) {
    config({ path: rootEnv });
  }
  if (existsSync(apiEnv)) {
    config({ path: apiEnv, override: true });
  }
}

loadEnv();
