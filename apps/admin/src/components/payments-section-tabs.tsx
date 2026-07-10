"use client";

import { AdminTabNav } from "@/components/admin-tab-nav";

const PAYMENTS_TABS = [
  { href: "/payments", label: "Giao dịch", match: "exact" as const },
  { href: "/payments/reconciliation", label: "Đối soát" },
  { href: "/payments/revenue", label: "Doanh thu" },
  { href: "/payments/promo-codes", label: "Mã khuyến mãi" },
] as const;

export function PaymentsSectionTabs() {
  return <AdminTabNav items={PAYMENTS_TABS} aria-label="Thanh toán" />;
}
