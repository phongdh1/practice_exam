"use client";

import { AdminTabNav } from "@/components/admin-tab-nav";

const SETTINGS_TABS = [
  { href: "/settings/rbac", label: "Ma trận RBAC (A-92)" },
  { href: "/settings/admin-users", label: "Quản lý admin (A-91)" },
  { href: "/settings/system", label: "Cài đặt hệ thống (A-90)" },
] as const;

export function SettingsSectionTabs() {
  return <AdminTabNav items={SETTINGS_TABS} aria-label="Cài đặt" />;
}
