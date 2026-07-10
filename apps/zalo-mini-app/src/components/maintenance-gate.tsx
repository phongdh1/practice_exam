import { MaintenanceScreen } from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import { maintenanceQueryOptions } from "../lib/zalo-api";

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useQuery(maintenanceQueryOptions);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-body-sm text-ink-muted">
        Đang tải...
      </div>
    );
  }

  if (!isError && data?.data?.enabled) {
    return <MaintenanceScreen message={data.data.message} />;
  }

  return <>{children}</>;
}
