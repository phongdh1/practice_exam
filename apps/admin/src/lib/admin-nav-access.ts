import type { AdminNavItem } from "@practice-exam/ui";
import type { AdminRoleType } from "@practice-exam/types";

/** UI nav visibility by role — mirrors API permission matrix (hint only). */
export function getHiddenNavItems(role: string | null): AdminNavItem[] {
  if (!role) return ["catalog", "course", "content", "users", "payments", "settings"];

  switch (role as AdminRoleType) {
    case "super_admin":
      return [];
    case "editor":
      return ["catalog", "course", "users", "payments", "settings"];
    case "reviewer":
      return ["catalog", "course", "users", "payments", "settings"];
    case "support":
      return ["catalog", "course", "content", "payments", "settings"];
    case "finance":
      return ["catalog", "course", "content", "users", "settings"];
    default:
      return ["catalog", "course", "content", "users", "payments", "settings"];
  }
}

export function isRoleAllowed(
  role: string | null,
  allowed: readonly AdminRoleType[],
): boolean {
  if (!role) return false;
  return allowed.includes(role as AdminRoleType);
}
