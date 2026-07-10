"use client";

import { AdminSidebar, InternalLinkProvider, TooltipProvider } from "@practice-exam/ui";
import { usePathname, useRouter } from "next/navigation";
import { AdminNotificationBell } from "@/components/admin-notification-bell";
import { ClientLink } from "@/components/client-link";
import { resolveAdminSidebar } from "@/lib/admin-nav";
import { getHiddenNavItems } from "@/lib/admin-nav-access";
import { useAdminRole } from "@/lib/admin-role";

export function AdminAppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const role = useAdminRole();
  const isLogin = pathname.startsWith("/login");

  if (isLogin) {
    return <>{children}</>;
  }

  const hiddenNavItems = getHiddenNavItems(role);
  const sidebarProps = resolveAdminSidebar(pathname);
  const showNotifications =
    role === "super_admin" || role === "support" || role === "finance";

  return (
    <InternalLinkProvider linkComponent={ClientLink}>
      <TooltipProvider delayDuration={200}>
        <div className="flex min-h-screen overflow-hidden bg-background">
          <AdminSidebar
            {...sidebarProps}
            hiddenNavItems={hiddenNavItems}
            showNewSubject={role === "super_admin"}
            onNewSubject={() => router.push("/subjects/new")}
          />
          <div className="ml-64 flex min-h-screen flex-1 flex-col overflow-y-auto">
            {showNotifications && (
              <div className="sticky top-0 z-40 flex justify-end border-b border-outline-variant bg-surface-container-lowest px-gutter-desktop py-3">
                <AdminNotificationBell />
              </div>
            )}
            <main className="flex min-h-0 flex-1 flex-col">{children}</main>
          </div>
        </div>
      </TooltipProvider>
    </InternalLinkProvider>
  );
}
