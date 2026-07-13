-- CreateEnum
CREATE TYPE "subject_visibility" AS ENUM ('active', 'archived');

-- CreateTable
CREATE TABLE "subjects" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "subject_visibility" NOT NULL DEFAULT 'active',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subject_pricing" (
    "id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "monthly_amount_vnd" INTEGER NOT NULL,
    "free_tier_limit" INTEGER NOT NULL DEFAULT 20,

    CONSTRAINT "subject_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");

-- CreateIndex
CREATE UNIQUE INDEX "subject_pricing_subject_id_key" ON "subject_pricing"("subject_id");

-- AddForeignKey
ALTER TABLE "subject_pricing" ADD CONSTRAINT "subject_pricing_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
