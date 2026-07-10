-- EPIC-12: Zalo integration admin, payment merchant config, webhook logs
ALTER TABLE "payments" ADD COLUMN "is_test" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "integration_audit_logs" (
    "id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "integration" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "zalo_oauth_events" (
    "id" UUID NOT NULL,
    "external_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'received',
    "payload" JSONB NOT NULL,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "zalo_oauth_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "integration_audit_logs_integration_idx" ON "integration_audit_logs"("integration");
CREATE INDEX "integration_audit_logs_created_at_idx" ON "integration_audit_logs"("created_at");
CREATE INDEX "zalo_oauth_events_status_idx" ON "zalo_oauth_events"("status");
CREATE INDEX "zalo_oauth_events_created_at_idx" ON "zalo_oauth_events"("created_at");

ALTER TABLE "integration_audit_logs" ADD CONSTRAINT "integration_audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
