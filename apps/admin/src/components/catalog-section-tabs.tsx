"use client";

import { AdminTabNav } from "@/components/admin-tab-nav";
import { MaterialIcon } from "@practice-exam/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

const CATALOG_TABS = [
  { href: "/subjects", label: "Quản lý môn học" },
  { href: "/courses", label: "Quản lý khóa học" },
] as const;

/** Shared Catalog list table chrome (aligned with Question Bank A-30). */
export const catalogTableHeadRowClassName = "bg-surface-container-low/50";
export const catalogTableHeadClassName =
  "px-6 text-xs font-bold uppercase tracking-wider text-on-surface-variant";
export const catalogTableCellClassName = "px-6";
export const catalogTableRowClassName = "hover:bg-surface-subtle";
export const catalogTableFooterClassName =
  "border-t border-outline-variant bg-surface-container-low/30 px-6 py-4 text-xs text-on-surface-variant";
export const catalogCheckboxClassName =
  "rounded border-outline-variant text-primary focus:ring-primary/20 disabled:opacity-40";

function CatalogCreateAction() {
  const pathname = usePathname();
  const isCourses = pathname.startsWith("/courses");
  const href = isCourses ? "/courses/new" : "/subjects/new";
  const label = isCourses ? "Tạo khóa học" : "Tạo môn học";

  return (
    <Link
      href={href}
      className="ml-auto flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-label font-bold text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95"
    >
      <MaterialIcon name="add" size={18} />
      {label}
    </Link>
  );
}

export function CatalogSectionToolbar() {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <AdminTabNav
        items={CATALOG_TABS}
        className="flex flex-wrap gap-2"
        size="md"
        aria-label="Quản lý danh mục"
      />
      <CatalogCreateAction />
    </div>
  );
}
