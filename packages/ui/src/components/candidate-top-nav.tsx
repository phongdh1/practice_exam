"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { InternalLink } from "./internal-link";
import { MaterialIcon } from "./material-icon";

export type CandidateNavItem = "subjects" | "progress" | "account";

export interface CandidateTopNavProps {
  active?: CandidateNavItem;
  brandHref?: string;
  subjectsHref?: string;
  progressHref?: string;
  accountHref?: string;
  accountAction?: React.ReactNode;
  className?: string;
}

const navItems: { id: CandidateNavItem; label: string; key: keyof CandidateTopNavProps }[] = [
  { id: "subjects", label: "Môn học", key: "subjectsHref" },
  { id: "progress", label: "Tiến độ", key: "progressHref" },
  { id: "account", label: "Tài khoản", key: "accountHref" },
];

export function CandidateTopNav({
  active = "subjects",
  brandHref = "/",
  subjectsHref = "/",
  progressHref = "/progress",
  accountHref = "/account",
  accountAction,
  className,
}: CandidateTopNavProps) {
  const hrefs: Record<CandidateNavItem, string> = {
    subjects: subjectsHref,
    progress: progressHref,
    account: accountHref,
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-16 w-full items-center justify-between bg-surface px-gutter-mobile shadow-sm md:px-gutter-desktop",
        className,
      )}
      data-component="candidate-top-nav"
    >
      <div className="flex items-center gap-8">
        <InternalLink href={brandHref} className="text-display-lg font-bold text-primary">
          CNVCK Prep
        </InternalLink>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <InternalLink
              key={item.id}
              href={hrefs[item.id]}
              className={cn(
                "text-heading font-heading transition-colors",
                active === item.id
                  ? "border-b-2 border-primary pb-1 font-bold text-primary"
                  : "text-on-surface-variant hover:text-primary",
              )}
            >
              {item.label}
            </InternalLink>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {accountAction ?? (
          <InternalLink href={accountHref} aria-label="Tài khoản">
            <MaterialIcon name="account_circle" className="text-primary" />
          </InternalLink>
        )}
      </div>
    </header>
  );
}
