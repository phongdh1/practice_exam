"use client";

import { CatalogSkeleton, MaintenanceScreen } from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import { maintenanceQueryOptions } from "@/lib/web-api";

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useQuery(maintenanceQueryOptions);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <CatalogSkeleton />
      </div>
    );
  }

  if (!isError && data?.data?.enabled) {
    return <MaintenanceScreen message={data.data.message} />;
  }

  return <>{children}</>;
}
