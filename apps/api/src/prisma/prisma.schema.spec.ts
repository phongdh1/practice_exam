import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Prisma schema configuration", () => {
  const schemaPath = resolve(__dirname, "../../prisma/schema.prisma");
  const schema = readFileSync(schemaPath, "utf-8");
  const prismaConfigPath = resolve(__dirname, "../../prisma.config.ts");
  const prismaConfig = readFileSync(prismaConfigPath, "utf-8");

  it("uses DATABASE_URL for runtime pooler connection through the Prisma adapter", () => {
    const adapterPath = resolve(__dirname, "create-prisma-adapter.ts");
    const adapter = readFileSync(adapterPath, "utf-8");
    expect(adapter).toContain("process.env.DATABASE_URL");
  });

  it("uses DIRECT_URL for migrations via Prisma config", () => {
    expect(prismaConfig).toContain('url: env("DIRECT_URL")');
  });

  it("defines Question model for EPIC-8 question bank", () => {
    expect(schema).toContain("model Question");
    expect(schema).toContain("enum QuestionStatus");
    expect(schema).toContain("model ImportBatch");
    expect(schema).toContain("model QuestionFlag");
  });
});
