-- CreateTable
CREATE TABLE "free_tier_usage" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "period_key" TEXT NOT NULL,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "free_tier_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "free_tier_usage_user_id_period_key_idx" ON "free_tier_usage"("user_id", "period_key");

-- CreateIndex
CREATE UNIQUE INDEX "free_tier_usage_user_id_subject_id_period_key_key" ON "free_tier_usage"("user_id", "subject_id", "period_key");

-- AddForeignKey
ALTER TABLE "free_tier_usage" ADD CONSTRAINT "free_tier_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default platform disclaimer (FR-15 CMS field)
INSERT INTO "system_settings" ("key", "value", "updated_at")
VALUES (
    'platform_disclaimer',
    'Practice Exam là nền tảng luyện thi độc lập, không phải sản phẩm thi chính thức của UBCKNN. Nội dung mang tính tham khảo và không đảm bảo kết quả thi.',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO NOTHING;
