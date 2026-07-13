-- CreateEnum
CREATE TYPE "admin_role" AS ENUM ('super_admin', 'editor', 'reviewer', 'finance', 'support');

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT,
    "role" "admin_role" NOT NULL DEFAULT 'super_admin',
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- Seed default super admin (username: admin, password: Admin@123)
INSERT INTO "admin_users" ("id", "username", "password_hash", "display_name", "role", "is_disabled", "updated_at")
VALUES (
    '00000000-0000-4000-8000-000000000001',
    'admin',
    '$2b$10$GBXsJbVGEz9Wm8BPuAHUcOuLN54Fnn5QBOKjWHBE4VkKSP32YmAf.',
    'Super Admin',
    'super_admin',
    false,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("username") DO UPDATE SET
    "password_hash" = EXCLUDED."password_hash",
    "display_name" = EXCLUDED."display_name",
    "role" = EXCLUDED."role",
    "is_disabled" = false,
    "updated_at" = CURRENT_TIMESTAMP;
