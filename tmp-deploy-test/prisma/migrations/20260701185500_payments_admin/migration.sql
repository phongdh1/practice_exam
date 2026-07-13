-- EPIC-11: Payments Admin & Finance — refunds and promo codes

ALTER TYPE "payment_status" ADD VALUE IF NOT EXISTS 'refunded';

CREATE TYPE "refund_status" AS ENUM ('pending', 'confirmed', 'failed');
CREATE TYPE "promo_discount_type" AS ENUM ('percentage', 'fixed');

CREATE TABLE "payment_refunds" (
    "id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "amount_vnd" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "refund_status" NOT NULL DEFAULT 'pending',
    "provider_ref" TEXT,
    "admin_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "payment_refunds_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "promo_codes" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "discount_type" "promo_discount_type" NOT NULL,
    "discount_value" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "usage_limit" INTEGER NOT NULL,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "subject_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");
CREATE INDEX "payment_refunds_payment_id_idx" ON "payment_refunds"("payment_id");
CREATE INDEX "payment_refunds_status_idx" ON "payment_refunds"("status");
CREATE INDEX "payments_provider_idx" ON "payments"("provider");
CREATE INDEX "payments_paid_at_idx" ON "payments"("paid_at");

ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
