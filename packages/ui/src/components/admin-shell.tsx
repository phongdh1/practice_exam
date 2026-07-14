"use client";

import type * as React from "react";
import { cn } from "../lib/utils";
import { InternalLink } from "./internal-link";
import { MaterialIcon } from "./material-icon";

export type AdminNavItem = "dashboard" | "catalog" | "content" | "users" | "payments" | "settings";

export type AdminSettingsSubNav = "rbac" | "admin-users" | "system";

export interface AdminSidebarProps {
  active?: AdminNavItem;
  dashboardHref?: string;
  catalogHref?: string;
  contentHref?: string;
  usersHref?: string;
  paymentsHref?: string;
  settingsHref?: string;
  settingsAdminUsersHref?: string;
  settingsSystemHref?: string;
  /** Which settings sub-page is active when `active` is `settings`. */
  settingsSubActive?: AdminSettingsSubNav;
  /** Nav sections hidden for the current admin role (UI hint — API enforces RBAC). */
  hiddenNavItems?: AdminNavItem[];
  /** Show the "New Subject" quick action. Defaults to true; gate to super_admin (UI hint). */
  showNewSubject?: boolean;
  onNewSubject?: () => void;
  /** When provided, Sign Out runs this instead of a dead `#` link. */
  onSignOut?: () => void;
  className?: string;
}

const navItems: { id: AdminNavItem; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "catalog", label: "Catalog", icon: "category" },
  { id: "content", label: "Content", icon: "edit_note" },
  { id: "users", label: "Users", icon: "group" },
  { id: "payments", label: "Payments", icon: "payments" },
];

/** Fixed class strings — no cn()/twMerge so SSR and client always match on first paint. */
const NAV_LINK_BASE =
  "flex items-center gap-3 rounded-lg px-4 py-3 transition-all active:scale-95";
const NAV_LINK_ACTIVE = `${NAV_LINK_BASE} bg-primary-container font-bold text-on-primary`;
const NAV_LINK_INACTIVE = `${NAV_LINK_BASE} text-on-primary/80 hover:bg-on-primary/10 hover:text-on-primary`;

export function AdminSidebar({
  active = "dashboard",
  dashboardHref = "/",
  catalogHref = "/subjects",
  contentHref = "/questions",
  usersHref = "/users",
  paymentsHref = "/payments",
  settingsHref = "/settings/rbac",
  settingsAdminUsersHref = "/settings/admin-users",
  settingsSystemHref = "/settings/system",
  settingsSubActive,
  hiddenNavItems = [],
  showNewSubject = true,
  onNewSubject,
  onSignOut,
  className,
}: AdminSidebarProps) {
  const hidden = new Set(hiddenNavItems);
  const hrefs: Record<AdminNavItem, string> = {
    dashboard: dashboardHref,
    catalog: catalogHref,
    content: contentHref,
    users: usersHref,
    payments: paymentsHref,
    settings: settingsHref,
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col gap-4 bg-primary p-4 shadow-sm",
        className,
      )}
      data-component="admin-sidebar"
    >
      <div className="mb-4 flex flex-col gap-1 px-2">
        <h1 className="text-display-sm text-on-primary">CNVCK Back-Office</h1>
        <p className="text-label text-on-primary/60">Certification Management</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navItems
          .filter((item) => !hidden.has(item.id))
          .map((item) => (
            <InternalLink
              key={item.id}
              href={hrefs[item.id]}
              className={active === item.id ? NAV_LINK_ACTIVE : NAV_LINK_INACTIVE}
            >
              <MaterialIcon name={item.icon} size={20} />
              <span className="text-label">{item.label}</span>
            </InternalLink>
          ))}
        {!hidden.has("settings") && (
          <>
            <InternalLink
              href={hrefs.settings}
              className={
                active === "settings" &&
                (settingsSubActive === "rbac" || settingsSubActive === undefined)
                  ? NAV_LINK_ACTIVE
                  : NAV_LINK_INACTIVE
              }
            >
              <MaterialIcon name="admin_panel_settings" size={20} />
              <span className="text-label">RBAC</span>
            </InternalLink>
            <InternalLink
              href={settingsAdminUsersHref}
              className={
                active === "settings" && settingsSubActive === "admin-users"
                  ? NAV_LINK_ACTIVE
                  : NAV_LINK_INACTIVE
              }
            >
              <MaterialIcon name="manage_accounts" size={20} />
              <span className="text-label">Admin Users</span>
            </InternalLink>
            <InternalLink
              href={settingsSystemHref}
              className={
                active === "settings" && settingsSubActive === "system"
                  ? NAV_LINK_ACTIVE
                  : NAV_LINK_INACTIVE
              }
            >
              <MaterialIcon name="tune" size={20} />
              <span className="text-label">System</span>
            </InternalLink>
          </>
        )}
      </nav>
      <div className="mt-auto flex flex-col gap-1 border-t border-on-primary/10 pt-4">
        {showNewSubject && (
          <button
            type="button"
            onClick={onNewSubject}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-on-primary py-3 font-bold text-primary transition-colors hover:bg-surface-container-lowest"
          >
            <MaterialIcon name="add" size={20} />
            <span className="text-label">New Subject</span>
          </button>
        )}
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-4 py-2 text-on-primary/80 transition-all hover:bg-on-primary/10 hover:text-on-primary"
        >
          <MaterialIcon name="contact_support" size={20} />
          <span className="text-label">Support</span>
        </a>
        {onSignOut ? (
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-on-primary/80 transition-all hover:bg-on-primary/10 hover:text-on-primary"
          >
            <MaterialIcon name="logout" size={20} />
            <span className="text-label">Sign Out</span>
          </button>
        ) : (
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-on-primary/80 transition-all hover:bg-on-primary/10 hover:text-on-primary"
          >
            <MaterialIcon name="logout" size={20} />
            <span className="text-label">Sign Out</span>
          </a>
        )}
      </div>
    </aside>
  );
}

export interface AdminShellProps {
  children: React.ReactNode;
  sidebar: AdminSidebarProps;
  title?: string;
  subtitle?: string;
}

export function AdminShell({ children, sidebar, title, subtitle }: AdminShellProps) {
  return (
    <div className="flex min-h-screen overflow-hidden bg-background">
      <AdminSidebar {...sidebar} />
      <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-y-auto">
        {(title || subtitle) && (
          <header className="border-b border-outline-variant bg-surface-container-lowest px-gutter-desktop py-6">
            {title && <h1 className="text-display-sm text-primary">{title}</h1>}
            {subtitle && <p className="mt-1 text-body-sm text-ink-muted">{subtitle}</p>}
          </header>
        )}
        <div className="flex-1 p-gutter-desktop">{children}</div>
      </main>
    </div>
  );
}
