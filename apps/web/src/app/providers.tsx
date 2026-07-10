"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { MaintenanceGate } from "@/components/maintenance-gate";
import { WebSessionProvider } from "@/components/web-session-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <WebSessionProvider>
        <MaintenanceGate>{children}</MaintenanceGate>
      </WebSessionProvider>
    </QueryClientProvider>
  );
}
