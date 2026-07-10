"use client";

import { AdminSidebar, InternalLinkProvider } from "@practice-exam/ui";
import { usePathname, useRouter } from "next/navigation";
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

  return (
    <InternalLinkProvider linkComponent={ClientLink}>
      <div className="flex min-h-screen overflow-hidden bg-background">
        <AdminSidebar
          {...sidebarProps}
          hiddenNavItems={hiddenNavItems}
          showNewSubject={role === "super_admin"}
          onNewSubject={() => router.push("/subjects/new")}
        />
        <main className="ml-64 flex min-h-screen flex-1 flex-col overflow-y-auto">{children}</main>
      </div>
    </InternalLinkProvider>
  );
}
