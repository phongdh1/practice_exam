import type { CandidateNavItem } from "@practice-exam/ui";

export function resolveActiveNav(pathname: string): CandidateNavItem {
  if (pathname.startsWith("/progress")) return "progress";
  if (pathname.startsWith("/account")) return "account";
  return "subjects";
}
