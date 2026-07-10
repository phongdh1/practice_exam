"use client";

import { cn } from "../lib/utils";
import { InternalLink } from "./internal-link";
import { MaterialIcon } from "./material-icon";
import type { CandidateNavItem } from "./candidate-top-nav";

export interface CandidateBottomNavProps {
  active?: CandidateNavItem;
  subjectsHref?: string;
  progressHref?: string;
  accountHref?: string;
  className?: string;
}

const tabs: { id: CandidateNavItem; label: string; icon: string }[] = [
  { id: "subjects", label: "Trang chủ", icon: "home" },
  { id: "progress", label: "Tiến độ", icon: "trending_up" },
  { id: "account", label: "Tài khoản", icon: "person" },
];

export function CandidateBottomNav({
  active = "subjects",
  subjectsHref = "/",
  progressHref = "/progress",
  accountHref = "/account",
  className,
}: CandidateBottomNavProps) {
  const hrefs: Record<CandidateNavItem, string> = {
    subjects: subjectsHref,
    progress: progressHref,
    account: accountHref,
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 z-50 flex w-full justify-around border-t border-outline-variant bg-surface-container-lowest px-gutter-mobile py-2 shadow-lg md:hidden",
        className,
      )}
      data-component="candidate-bottom-nav"
    >
      {tabs.map((tab) => (
        <InternalLink
          key={tab.id}
          href={hrefs[tab.id]}
          className={cn(
            "flex flex-col items-center gap-0.5 px-3 py-1 text-caption",
            active === tab.id ? "font-bold text-primary" : "text-on-surface-variant",
          )}
        >
          <MaterialIcon name={tab.icon} size={22} filled={active === tab.id} />
          <span>{tab.label}</span>
        </InternalLink>
      ))}
    </nav>
  );
}
