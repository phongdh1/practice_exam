export type AdminTabMatch = "exact" | "prefix";

export interface AdminTabDefinition {
  href: string;
  label: string;
  match?: AdminTabMatch;
}

export function isAdminTabActive(
  pathname: string,
  href: string,
  match: AdminTabMatch = "prefix",
): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";

  if (match === "exact") {
    return normalized === target;
  }

  if (target === "/payments") {
    return normalized === "/payments";
  }

  if (target === "/settings/rbac") {
    return normalized === "/settings" || normalized === "/settings/rbac" || normalized.startsWith("/settings/rbac/");
  }

  return normalized === target || normalized.startsWith(`${target}/`);
}
