import type { AdminNavItem, AdminSettingsSubNav, AdminSidebarProps } from "@practice-exam/ui";

export function resolveAdminSidebar(pathname: string): Pick<
  AdminSidebarProps,
  "active" | "settingsSubActive" | "paymentsHref" | "contentHref"
> {
  if (pathname.startsWith("/settings/admin-users")) {
    return { active: "settings", settingsSubActive: "admin-users" as AdminSettingsSubNav };
  }
  if (pathname.startsWith("/settings/system")) {
    return { active: "settings", settingsSubActive: "system" as AdminSettingsSubNav };
  }
  if (pathname.startsWith("/settings")) {
    return { active: "settings", settingsSubActive: "rbac" as AdminSettingsSubNav };
  }
  if (pathname.startsWith("/integrations")) {
    return { active: "payments", paymentsHref: "/integrations/payments" };
  }
  if (pathname.startsWith("/payments")) {
    return { active: "payments" };
  }
  if (pathname.startsWith("/users")) {
    return { active: "users" };
  }
  if (
    pathname.startsWith("/questions") ||
    pathname.startsWith("/review") ||
    pathname.startsWith("/flags")
  ) {
    return { active: "content", contentHref: "/questions" };
  }
  if (pathname.startsWith("/subjects") || pathname.startsWith("/courses")) {
    return { active: "catalog" };
  }

  return { active: "dashboard" as AdminNavItem };
}
