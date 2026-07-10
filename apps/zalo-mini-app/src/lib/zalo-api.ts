import { createApiClient, queryKeys, SETTINGS_QUERY_STALE_MS } from "@practice-exam/api-client";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export const zaloApi = createApiClient({
  baseUrl: API_URL,
  getAccessToken: () => localStorage.getItem("access_token") ?? undefined,
});

type DisclaimerQueryOptions = {
  queryKey: typeof queryKeys.settings.disclaimer;
  queryFn: () => ReturnType<typeof zaloApi.getPlatformDisclaimer>;
  staleTime: number;
  retry: false;
};

type MaintenanceQueryOptions = {
  queryKey: typeof queryKeys.settings.maintenance;
  queryFn: () => ReturnType<typeof zaloApi.getMaintenanceMode>;
  staleTime: number;
  refetchInterval: number;
  retry: false;
};

export const disclaimerQueryOptions: DisclaimerQueryOptions = {
  queryKey: queryKeys.settings.disclaimer,
  queryFn: () => zaloApi.getPlatformDisclaimer(),
  staleTime: SETTINGS_QUERY_STALE_MS,
  retry: false,
};

export const maintenanceQueryOptions: MaintenanceQueryOptions = {
  queryKey: queryKeys.settings.maintenance,
  queryFn: () => zaloApi.getMaintenanceMode(),
  staleTime: SETTINGS_QUERY_STALE_MS,
  refetchInterval: SETTINGS_QUERY_STALE_MS,
  retry: false,
};
