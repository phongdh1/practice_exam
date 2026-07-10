import { validateDatabaseUrl } from "./database-url";

describe("validateDatabaseUrl", () => {
  const validUrl =
    "postgresql://postgres.testref:P%40ssw%23rd@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

  it("accepts a properly encoded PostgreSQL URL", () => {
    expect(validateDatabaseUrl(validUrl)).toEqual({ valid: true });
  });

  it("rejects missing URL", () => {
    const result = validateDatabaseUrl(undefined);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("not set");
  });

  it("rejects empty URL", () => {
    const result = validateDatabaseUrl("   ");
    expect(result.valid).toBe(false);
  });

  it("rejects non-postgresql scheme", () => {
    const result = validateDatabaseUrl("mysql://user:pass@localhost/db");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("postgresql://");
  });

  it("rejects unencoded @ in password (empty host / P1013)", () => {
    const result = validateDatabaseUrl(
      "postgresql://postgres.testref:P@ss#w!rd@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain("@");
    expect(result.hint).toContain("%40");
  });

  it("includes var name in error messages", () => {
    const result = validateDatabaseUrl(undefined, "DIRECT_URL");
    expect(result.error).toContain("DIRECT_URL");
  });

  it("rejects template placeholders such as [PROJECT_REF]", () => {
    const result = validateDatabaseUrl(
      "postgresql://postgres.[PROJECT_REF]:P%40ssw%23rd@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain("[PROJECT_REF]");
  });
});
