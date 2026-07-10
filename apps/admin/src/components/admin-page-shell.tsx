"use client";

import type { AdminShellProps } from "@practice-exam/ui";

/** Admin page header + content area (sidebar lives in `admin-app-frame.tsx`). */
export function AdminPageShell({
  title,
  subtitle,
  children,
}: Pick<AdminShellProps, "title" | "subtitle" | "children">) {
  return (
    <>
      {(title || subtitle) && (
        <header className="border-b border-outline-variant bg-surface-container-lowest px-gutter-desktop py-6">
          {title && <h1 className="text-display-sm text-primary">{title}</h1>}
          {subtitle && <p className="mt-1 text-body-sm text-ink-muted">{subtitle}</p>}
        </header>
      )}
      <div className="flex-1 p-gutter-desktop">{children}</div>
    </>
  );
}
