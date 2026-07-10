-- CreateEnum
CREATE TYPE "question_status" AS ENUM ('draft', 'in_review', 'published', 'archived');
CREATE TYPE "question_type" AS ENUM ('single_choice', 'multiple_choice', 'true_false');
CREATE TYPE "question_difficulty" AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE "content_review_action" AS ENUM ('submit_for_review', 'approve', 'reject', 'unpublish', 'escalate');
CREATE TYPE "import_batch_status" AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE "question_flag_status" AS ENUM ('open', 'assigned', 'resolved', 'escalated');

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "status" "question_status" NOT NULL DEFAULT 'draft',
    "question_type" "question_type" NOT NULL DEFAULT 'single_choice',
    "difficulty" "question_difficulty" NOT NULL DEFAULT 'medium',
    "stem" TEXT NOT NULL,
    "explanation" TEXT,
    "correct_option_keys" JSONB NOT NULL,
    "options" JSONB NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source_ref" TEXT,
    "version_number" INTEGER NOT NULL DEFAULT 1,
    "parent_question_id" UUID,
    "reviewer_id" UUID,
    "assigned_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "question_versions" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "content_reviews" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "action" "content_review_action" NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "content_audit_logs" (
    "id" UUID NOT NULL,
    "question_id" UUID,
    "actor_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "import_batches" (
    "id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "uploaded_by_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "status" "import_batch_status" NOT NULL DEFAULT 'pending',
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "import_row_errors" (
    "id" UUID NOT NULL,
    "import_batch_id" UUID NOT NULL,
    "row_number" INTEGER NOT NULL,
    "field" TEXT,
    "message" TEXT NOT NULL,
    "raw_data" JSONB,

    CONSTRAINT "import_row_errors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "question_flags" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "comment" TEXT,
    "status" "question_flag_status" NOT NULL DEFAULT 'open',
    "assignee_id" UUID,
    "resolution_note" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolved_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_flags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "questions_subject_id_status_idx" ON "questions"("subject_id", "status");
CREATE INDEX "questions_status_idx" ON "questions"("status");
CREATE INDEX "questions_author_id_idx" ON "questions"("author_id");
CREATE INDEX "questions_reviewer_id_idx" ON "questions"("reviewer_id");
CREATE UNIQUE INDEX "question_versions_question_id_version_number_key" ON "question_versions"("question_id", "version_number");
CREATE INDEX "content_reviews_question_id_idx" ON "content_reviews"("question_id");
CREATE INDEX "content_audit_logs_question_id_idx" ON "content_audit_logs"("question_id");
CREATE INDEX "import_row_errors_import_batch_id_idx" ON "import_row_errors"("import_batch_id");
CREATE INDEX "question_flags_status_idx" ON "question_flags"("status");
CREATE INDEX "question_flags_question_id_idx" ON "question_flags"("question_id");

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "questions" ADD CONSTRAINT "questions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "questions" ADD CONSTRAINT "questions_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "questions" ADD CONSTRAINT "questions_parent_question_id_fkey" FOREIGN KEY ("parent_question_id") REFERENCES "questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "question_versions" ADD CONSTRAINT "question_versions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "content_reviews" ADD CONSTRAINT "content_reviews_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_reviews" ADD CONSTRAINT "content_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "content_audit_logs" ADD CONSTRAINT "content_audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "admin_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "import_row_errors" ADD CONSTRAINT "import_row_errors_import_batch_id_fkey" FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "question_flags" ADD CONSTRAINT "question_flags_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "question_flags" ADD CONSTRAINT "question_flags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "question_flags" ADD CONSTRAINT "question_flags_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "question_flags" ADD CONSTRAINT "question_flags_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
