-- CreateEnum
CREATE TYPE "practice_session_status" AS ENUM ('in_progress', 'completed', 'expired');

-- AlterTable practice_sessions
ALTER TABLE "practice_sessions"
  ADD COLUMN "status" "practice_session_status" NOT NULL DEFAULT 'in_progress',
  ADD COLUMN "answered_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "correct_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "expires_at" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
  ADD COLUMN "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "completed_at" TIMESTAMP(3);

-- Backfill subject_id for any legacy rows (delete orphans without subject)
DELETE FROM "practice_sessions" WHERE "subject_id" IS NULL;

ALTER TABLE "practice_sessions"
  ALTER COLUMN "subject_id" SET NOT NULL,
  ALTER COLUMN "subject_id" TYPE UUID USING "subject_id"::uuid;

-- CreateIndex
CREATE INDEX "practice_sessions_user_id_subject_id_status_idx" ON "practice_sessions"("user_id", "subject_id", "status");

-- AddForeignKey
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "practice_answers" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "selected_keys" JSONB NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practice_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "practice_answers_session_id_idx" ON "practice_answers"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "practice_answers_session_id_question_id_key" ON "practice_answers"("session_id", "question_id");

-- AddForeignKey
ALTER TABLE "practice_answers" ADD CONSTRAINT "practice_answers_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "practice_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_answers" ADD CONSTRAINT "practice_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
