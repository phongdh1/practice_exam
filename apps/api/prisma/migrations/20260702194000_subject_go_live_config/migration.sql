-- AlterTable
ALTER TABLE "subjects"
ADD COLUMN "min_published_questions_for_go_live" INTEGER NOT NULL DEFAULT 200,
ADD COLUMN "min_approved_templates_for_go_live" INTEGER NOT NULL DEFAULT 1;
