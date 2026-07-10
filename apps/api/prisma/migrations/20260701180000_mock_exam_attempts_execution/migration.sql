-- CreateEnum
CREATE TYPE "mock_exam_attempt_phase" AS ENUM ('in_section', 'review', 'completed');

-- AlterTable
ALTER TABLE "mock_exam_attempts" ADD COLUMN "phase" "mock_exam_attempt_phase" NOT NULL DEFAULT 'in_section';
ALTER TABLE "mock_exam_attempts" ADD COLUMN "current_section_index" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "mock_exam_attempts" ADD COLUMN "current_question_index" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "mock_exam_attempts" ADD COLUMN "section_ends_at" TIMESTAMP(3);
ALTER TABLE "mock_exam_attempts" ADD COLUMN "passed" BOOLEAN;
ALTER TABLE "mock_exam_attempts" ADD COLUMN "section_scores" JSONB;

-- CreateTable
CREATE TABLE "mock_exam_answers" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "section_index" INTEGER NOT NULL,
    "question_index" INTEGER NOT NULL,
    "selected_keys" JSONB NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mock_exam_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mock_exam_attempts_user_id_status_idx" ON "mock_exam_attempts"("user_id", "status");

-- CreateIndex
CREATE INDEX "mock_exam_answers_attempt_id_idx" ON "mock_exam_answers"("attempt_id");

-- CreateIndex
CREATE UNIQUE INDEX "mock_exam_answers_attempt_id_question_id_key" ON "mock_exam_answers"("attempt_id", "question_id");

-- AddForeignKey
ALTER TABLE "mock_exam_answers" ADD CONSTRAINT "mock_exam_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "mock_exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_exam_answers" ADD CONSTRAINT "mock_exam_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
