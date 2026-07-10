"use client";

import { AdminTabNav } from "@/components/admin-tab-nav";
import Link from "next/link";
import { usePathname } from "next/navigation";

const CATALOG_TABS = [
  { href: "/subjects", label: "Quản lý môn học" },
  { href: "/courses", label: "Quản lý khóa học" },
] as const;

function CatalogCreateAction() {
  const pathname = usePathname();
  const isCourses = pathname.startsWith("/courses");
  const href = isCourses ? "/courses/new" : "/subjects/new";
  const label = isCourses ? "Tạo khóa học" : "Tạo môn học";

  return (
    <Link
      href={href}
      className="rounded-lg bg-primary px-4 py-2 text-label text-on-primary"
    >
      {label}
    </Link>
  );
}

export function CatalogSectionToolbar() {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
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
