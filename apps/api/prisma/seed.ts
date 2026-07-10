import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { createPrismaAdapter } from "../src/prisma/create-prisma-adapter";

const rootEnv = resolve(__dirname, "../../../.env");
const apiEnv = resolve(__dirname, "../.env");

if (existsSync(rootEnv)) {
  config({ path: rootEnv });
}
if (existsSync(apiEnv)) {
  config({ path: apiEnv, override: true });
}

const prisma = new PrismaClient({ adapter: createPrismaAdapter() });

const DEFAULT_ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME ?? "admin";
const DEFAULT_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin@123";
const DEFAULT_ADMIN_ID = "00000000-0000-4000-8000-000000000001";

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

  await prisma.adminUser.upsert({
    where: { username: DEFAULT_ADMIN_USERNAME },
    create: {
      id: DEFAULT_ADMIN_ID,
      username: DEFAULT_ADMIN_USERNAME,
      passwordHash,
      displayName: "Super Admin",
      role: "super_admin",
      isDisabled: false,
    },
    update: {
      passwordHash,
      displayName: "Super Admin",
      role: "super_admin",
      isDisabled: false,
    },
  });

  console.log(`Seeded admin user "${DEFAULT_ADMIN_USERNAME}" (super_admin)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
