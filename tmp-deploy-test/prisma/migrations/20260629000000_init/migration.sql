-- CreateTable
CREATE TABLE "health_checks" (
    "id" UUID NOT NULL,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ok',

    CONSTRAINT "health_checks_pkey" PRIMARY KEY ("id")
);
