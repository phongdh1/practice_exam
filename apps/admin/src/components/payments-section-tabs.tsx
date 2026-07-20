"use client";

import { AdminTabNav } from "@/components/admin-tab-nav";
import { useAdminRole } from "@/lib/admin-role";

const PAYMENTS_TABS_BASE = [
  { href: "/payments", label: "Giao dịch", match: "exact" as const },
  { href: "/payments/reconciliation", label: "Đối soát" },
  { href: "/payments/revenue", label: "Doanh thu" },
  { href: "/payments/promo-codes", label: "Mã khuyến mãi" },
] as const;

const PROVIDER_CONFIG_TAB = {
  href: "/integrations/payments",
  label: "Cấu hình cổng",
} as const;

export function PaymentsSectionTabs() {
  const role = useAdminRole();
  const items =
    role === "super_admin"
      ? [...PAYMENTS_TABS_BASE, PROVIDER_CONFIG_TAB]
      : [...PAYMENTS_TABS_BASE];

  return <AdminTabNav items={items} aria-label="Thanh toán" />;
}
