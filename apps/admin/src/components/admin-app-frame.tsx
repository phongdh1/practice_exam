"use client";

import { AdminSidebar, InternalLinkProvider, MaterialIcon, TooltipProvider } from "@practice-exam/ui";
import { usePathname, useRouter } from "next/navigation";
import { AdminNotificationBell } from "@/components/admin-notification-bell";
import { ClientLink } from "@/components/client-link";
import { clearAdminSession } from "@/lib/admin-api";
import { resolveAdminSidebar, resolveAdminTopHeader } from "@/lib/admin-nav";
import { getHiddenNavItems } from "@/lib/admin-nav-access";
import { useAdminRole } from "@/lib/admin-role";
import { getAdminDisplayLabel, useAdminUser } from "@/lib/admin-session";

export function AdminAppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const role = useAdminRole();
  const adminUser = useAdminUser();
  const isLogin = pathname.startsWith("/login");

  if (isLogin) {
    return <>{children}</>;
  }

  const hiddenNavItems = getHiddenNavItems(role);
  const sidebarProps = resolveAdminSidebar(pathname);
  const pageHeader = resolveAdminTopHeader(pathname);
  const showNotifications =
    role === "super_admin" || role === "support" || role === "finance";
  const showUserChip = Boolean(adminUser);
  const showTopBar = Boolean(pageHeader) || showNotifications || showUserChip;

  function handleSignOut() {
    clearAdminSession();
    router.push("/login");
    router.refresh();
  }

  return (
    <InternalLinkProvider linkComponent={ClientLink}>
      <TooltipProvider delayDuration={200}>
        <div className="flex min-h-screen overflow-hidden bg-background">
          <AdminSidebar
            {...sidebarProps}
            hiddenNavItems={hiddenNavItems}
            showNewSubject={role === "super_admin"}
            onNewSubject={() => router.push("/subjects/new")}
            onSignOut={handleSignOut}
          />
          <div className="ml-64 flex min-h-screen flex-1 flex-col overflow-y-auto">
            {showTopBar && (
              <div className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-outline-variant bg-surface-container-lowest px-gutter-desktop py-3">
                <div className="min-w-0 flex-1">
                  {pageHeader && (
                    <div>
                      <h1 className="text-display-sm text-primary">{pageHeader.title}</h1>
                      {pageHeader.subtitle && (
                        <p className="mt-0.5 text-body-sm text-ink-muted">{pageHeader.subtitle}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {showNotifications && <AdminNotificationBell />}
                  {adminUser && (
                    <div className="flex items-center gap-2" data-testid="admin-user-chip">
                      <MaterialIcon name="account_circle" size={28} className="text-primary" />
                      <div className="min-w-0 text-right">
                        <p className="truncate text-label font-medium text-on-surface">
                          {getAdminDisplayLabel(adminUser)}
                        </p>
                        <p className="truncate text-body-sm text-ink-muted">{adminUser.role}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <main className="flex min-h-0 flex-1 flex-col">{children}</main>
          </div>
        </div>
      </TooltipProvider>
    </InternalLinkProvider>
  );
}
