-- CreateEnum
CREATE TYPE "payment_provider" AS ENUM ('payos', 'sepay');

-- CreateEnum
CREATE TYPE "payment_channel" AS ENUM ('web', 'zalo');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'paid', 'failed', 'cancelled');

-- AlterTable
ALTER TABLE "subscriptions" ALTER COLUMN "subject_id" SET DATA TYPE UUID USING "subject_id"::uuid;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN "payment_id" UUID;

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "provider" "payment_provider" NOT NULL,
    "channel" "payment_channel" NOT NULL,
    "status" "payment_status" NOT NULL DEFAULT 'pending',
    "amount_vnd" INTEGER NOT NULL,
    "external_ref" TEXT,
    "checkout_url" TEXT,
    "promo_code" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_webhook_events" (
    "id" UUID NOT NULL,
    "provider" "payment_provider" NOT NULL,
    "external_event_id" TEXT NOT NULL,
    "payment_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'received',
    "payload" JSONB NOT NULL,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "payment_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_payment_id_key" ON "subscriptions"("payment_id");

-- CreateIndex
CREATE INDEX "payment_webhook_events_status_idx" ON "payment_webhook_events"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_webhook_events_provider_external_event_id_key" ON "payment_webhook_events"("provider", "external_event_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
