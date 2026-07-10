-- Bind in-flight question to session; one in-progress session per user+subject
ALTER TABLE "practice_sessions" ADD COLUMN "current_question_id" UUID;

CREATE UNIQUE INDEX "practice_sessions_user_subject_in_progress_key"
  ON "practice_sessions"("user_id", "subject_id")
  WHERE "status" = 'in_progress';
