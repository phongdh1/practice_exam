"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { MaintenanceGate } from "@/components/maintenance-gate";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <MaintenanceGate>{children}</MaintenanceGate>
    </QueryClientProvider>
  );
}
