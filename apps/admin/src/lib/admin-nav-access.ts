import type { AdminNavItem } from "@practice-exam/ui";
import type { AdminRoleType } from "@practice-exam/types";

/** UI nav visibility by role — mirrors API permission matrix (hint only). */
export function getHiddenNavItems(role: string | null): AdminNavItem[] {
  if (!role) return ["catalog", "content", "users", "payments", "settings"];

  switch (role as AdminRoleType) {
    case "super_admin":
      return [];
    case "editor":
      return ["catalog", "users", "payments", "settings"];
    case "reviewer":
      return ["catalog", "users", "payments", "settings"];
    case "support":
      return ["catalog", "content", "payments", "settings"];
    case "finance":
      return ["catalog", "content", "users", "settings"];
    default:
      return ["catalog", "content", "users", "payments", "settings"];
  }
}

export function isRoleAllowed(
  role: string | null,
  allowed: readonly AdminRoleType[],
): boolean {
  if (!role) return false;
  return allowed.includes(role as AdminRoleType);
}
