-- AlterTable
ALTER TABLE "subjects" ADD COLUMN "cover_image_url" TEXT;
ALTER TABLE "subjects" ADD COLUMN "is_hot" BOOLEAN NOT NULL DEFAULT false;
