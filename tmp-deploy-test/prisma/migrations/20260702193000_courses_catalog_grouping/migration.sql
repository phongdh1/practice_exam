-- CreateEnum
CREATE TYPE "course_visibility" AS ENUM ('active', 'archived');

-- CreateTable
CREATE TABLE "courses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "course_visibility" NOT NULL DEFAULT 'archived',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");

-- AlterTable with backfill for existing Subjects.
ALTER TABLE "subjects" ADD COLUMN "course_id" UUID;

INSERT INTO "courses" ("code", "name", "description", "visibility", "display_order", "updated_at")
VALUES (
    'default',
    'Default Course',
    'Backfilled course for existing subjects before course catalog grouping.',
    'active',
    0,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("code") DO NOTHING;

UPDATE "subjects"
SET "course_id" = (SELECT "id" FROM "courses" WHERE "code" = 'default')
WHERE "course_id" IS NULL;

ALTER TABLE "subjects" ALTER COLUMN "course_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "subjects_course_id_idx" ON "subjects"("course_id");

-- AddForeignKey
ALTER TABLE "subjects"
ADD CONSTRAINT "subjects_course_id_fkey"
FOREIGN KEY ("course_id") REFERENCES "courses"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
