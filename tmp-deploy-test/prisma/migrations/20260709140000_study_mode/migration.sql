-- Study Mode: tier usage tracking, view logs, and per-subject study tier limit
ALTER TABLE "subject_pricing" ADD COLUMN "study_tier_limit" INTEGER NOT NULL DEFAULT 5;

CREATE TABLE "study_tier_usage" (
    "user_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "period_key" TEXT NOT NULL,
    "viewed_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "study_tier_usage_pkey" PRIMARY KEY ("user_id","subject_id","period_key")
);

CREATE TABLE "study_view_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "period_key" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_view_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "study_view_logs_user_id_subject_id_question_id_period_key_key" ON "study_view_logs"("user_id", "subject_id", "question_id", "period_key");

CREATE INDEX "study_view_logs_user_id_subject_id_period_key_idx" ON "study_view_logs"("user_id", "subject_id", "period_key");

ALTER TABLE "study_tier_usage" ADD CONSTRAINT "study_tier_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "study_view_logs" ADD CONSTRAINT "study_view_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "study_view_logs" ADD CONSTRAINT "study_view_logs_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
