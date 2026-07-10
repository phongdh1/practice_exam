"use client";

import { isAdminTabActive, type AdminTabDefinition } from "@/lib/admin-tab-match";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ACTIVE_SM = "rounded-lg bg-primary px-3 py-1.5 text-label text-on-primary";
const INACTIVE_SM =
  "rounded-lg border border-outline px-3 py-1.5 text-label hover:bg-surface-container-low";
const ACTIVE_MD = "rounded-lg bg-primary px-4 py-2 text-label text-on-primary";
const INACTIVE_MD =
  "rounded-lg border border-outline px-4 py-2 text-label hover:bg-surface-container-low";

type AdminTabNavProps = {
  items: readonly AdminTabDefinition[];
  className?: string;
  size?: "sm" | "md";
  "aria-label"?: string;
};

export function AdminTabNav({
  items,
  className = "mb-6 flex flex-wrap gap-2 text-body-sm",
  size = "sm",
  "aria-label": ariaLabel,
}: AdminTabNavProps) {
  const pathname = usePathname();
  const activeClass = size === "md" ? ACTIVE_MD : ACTIVE_SM;
  const inactiveClass = size === "md" ? INACTIVE_MD : INACTIVE_SM;

  return (
    <nav className={className} aria-label={ariaLabel}>
      {items.map((item) => {
        const active = isAdminTabActive(pathname, item.href, item.match ?? "prefix");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={active ? activeClass : inactiveClass}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
