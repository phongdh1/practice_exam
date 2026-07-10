"use client";

import type { AdminRoleType } from "@practice-exam/types";
import { InternalLink, MaterialIcon } from "@practice-exam/ui";
import type { ReactNode } from "react";
import { isRoleAllowed } from "@/lib/admin-nav-access";
import { useAdminRole } from "@/lib/admin-role";

interface AdminRoleGateProps {
  allowedRoles: readonly AdminRoleType[];
  children: ReactNode;
}

export function AdminRoleGate({ allowedRoles, children }: AdminRoleGateProps) {
  const role = useAdminRole();
  if (!isRoleAllowed(role, allowedRoles)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <MaterialIcon name="lock" size={48} className="text-error" />
        <h2 className="text-heading font-heading text-primary">Không có quyền truy cập</h2>
        <p className="max-w-md text-body text-ink-muted">
          Tài khoản của bạn không có quyền xem trang này. Liên hệ Super Admin nếu bạn cần quyền
          truy cập.
        </p>
        <InternalLink
          href="/"
          className="text-label text-primary underline"
        >
          Về trang chủ
        </InternalLink>
      </div>
    );
  }
  return <>{children}</>;
}
