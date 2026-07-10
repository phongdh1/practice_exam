-- CreateEnum
CREATE TYPE "mock_exam_template_status" AS ENUM ('draft', 'approved', 'archived');

-- CreateEnum
CREATE TYPE "mock_exam_section_selection_mode" AS ENUM ('fixed', 'randomized');

-- CreateEnum
CREATE TYPE "mock_exam_attempt_status" AS ENUM ('in_progress', 'completed', 'expired');

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN "topic_tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "subjects" ALTER COLUMN "visibility" SET DEFAULT 'archived';

-- CreateTable
CREATE TABLE "mock_exam_templates" (
    "id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "mock_exam_template_status" NOT NULL DEFAULT 'draft',
    "total_duration_minutes" INTEGER NOT NULL,
    "passing_score_percent" INTEGER NOT NULL,
    "monthly_attempt_limit" INTEGER NOT NULL DEFAULT 3,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_exam_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_exam_sections" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "section_order" INTEGER NOT NULL,
    "question_count" INTEGER NOT NULL,
    "time_limit_minutes" INTEGER NOT NULL,
    "selection_mode" "mock_exam_section_selection_mode" NOT NULL,
    "weight_percent" INTEGER NOT NULL,
    "fixed_question_ids" JSONB,
    "difficulty_rules" JSONB,
    "topic_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_exam_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_exam_attempts" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "period_key" TEXT NOT NULL,
    "status" "mock_exam_attempt_status" NOT NULL DEFAULT 'in_progress',
    "score_percent" INTEGER,
    "question_ids" JSONB NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mock_exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mock_exam_templates_subject_id_status_idx" ON "mock_exam_templates"("subject_id", "status");

-- CreateIndex
CREATE INDEX "mock_exam_sections_template_id_idx" ON "mock_exam_sections"("template_id");

-- CreateIndex
CREATE INDEX "mock_exam_attempts_user_id_template_id_period_key_idx" ON "mock_exam_attempts"("user_id", "template_id", "period_key");

-- AddForeignKey
ALTER TABLE "mock_exam_templates" ADD CONSTRAINT "mock_exam_templates_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_exam_sections" ADD CONSTRAINT "mock_exam_sections_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "mock_exam_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_exam_sections" ADD CONSTRAINT "mock_exam_sections_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_exam_attempts" ADD CONSTRAINT "mock_exam_attempts_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "mock_exam_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_exam_attempts" ADD CONSTRAINT "mock_exam_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
