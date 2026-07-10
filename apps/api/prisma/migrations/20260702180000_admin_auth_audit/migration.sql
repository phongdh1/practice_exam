-- CreateTable
CREATE TABLE "admin_auth_audit_logs" (
    "id" UUID NOT NULL,
    "admin_id" UUID,
    "username" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_auth_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_auth_audit_logs_admin_id_idx" ON "admin_auth_audit_logs"("admin_id");

-- CreateIndex
CREATE INDEX "admin_auth_audit_logs_created_at_idx" ON "admin_auth_audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "admin_auth_audit_logs" ADD CONSTRAINT "admin_auth_audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
