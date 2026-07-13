export interface DatabaseUrlValidation {
  valid: boolean;
  error?: string;
  hint?: string;
}

const POSTGRES_PREFIX = /^postgres(ql)?:\/\//;

const ENCODE_HINT =
  "URL-encode special characters in your database password (e.g. @ → %40, # → %23, ! → %21). Example password P@ss#w!rd → P%40ss%23w%21rd. See docs/DATABASE_URL.md.";

export function validateDatabaseUrl(
  url: string | undefined,
  varName = "DATABASE_URL",
): DatabaseUrlValidation {
  if (!url?.trim()) {
    return {
      valid: false,
      error: `${varName} is not set`,
      hint: "Copy .env.example to the monorepo root (.env) and set your Supabase connection strings.",
    };
  }

  const trimmed = url.trim();

  if (/\[[A-Z0-9_]+\]/.test(trimmed)) {
    return {
      valid: false,
      error: `${varName} still contains template placeholders (e.g. [PROJECT_REF])`,
      hint: "Set real Supabase credentials in apps/api/.env or the monorepo root .env. See .env.example.",
    };
  }

  if (!POSTGRES_PREFIX.test(trimmed)) {
    return {
      valid: false,
      error: `${varName} must start with postgresql://`,
      hint: "See .env.example for the Supabase pooler URL format.",
    };
  }

  const afterScheme = trimmed.replace(POSTGRES_PREFIX, "");
  const atCount = (afterScheme.match(/@/g) ?? []).length;
  if (atCount > 1) {
    return {
      valid: false,
      error: `${varName} has multiple @ characters — password likely contains unencoded special characters`,
      hint: ENCODE_HINT,
    };
  }

  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname) {
      return {
        valid: false,
        error: `${varName} has an empty host`,
        hint: ENCODE_HINT,
      };
    }
  } catch {
    return {
      valid: false,
      error: `${varName} is not a valid PostgreSQL connection URL`,
      hint: ENCODE_HINT,
    };
  }

  return { valid: true };
}

export function assertDatabaseEnv(): void {
  for (const varName of ["DATABASE_URL", "DIRECT_URL"] as const) {
    const result = validateDatabaseUrl(process.env[varName], varName);
    if (!result.valid) {
      const message = [
        `[Prisma] ${result.error}`,
        result.hint,
        "Docs: docs/DATABASE_URL.md",
      ]
        .filter(Boolean)
        .join("\n");
      throw new Error(message);
    }
  }
}
