"use client";

import { createApiClient, createUnauthorizedGuard, queryKeys, SETTINGS_QUERY_STALE_MS } from "@practice-exam/api-client";
import { clearWebSession, getWebAccessToken } from "./session";

const webOnUnauthorized = createUnauthorizedGuard({
  loginPath: "/sign-in",
  clearSession: clearWebSession,
  shouldSkipRedirect: (path) => path.startsWith("/sign-in") || path.startsWith("/register"),
});

export const webApi = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  getAccessToken: getWebAccessToken,
  onUnauthorized: webOnUnauthorized,
});

type DisclaimerQueryOptions = {
  queryKey: typeof queryKeys.settings.disclaimer;
  queryFn: () => ReturnType<typeof webApi.getPlatformDisclaimer>;
  staleTime: number;
  retry: false;
};

type MaintenanceQueryOptions = {
  queryKey: typeof queryKeys.settings.maintenance;
  queryFn: () => ReturnType<typeof webApi.getMaintenanceMode>;
  staleTime: number;
  refetchInterval: number;
  retry: false;
};

export const disclaimerQueryOptions: DisclaimerQueryOptions = {
  queryKey: queryKeys.settings.disclaimer,
  queryFn: () => webApi.getPlatformDisclaimer(),
  staleTime: SETTINGS_QUERY_STALE_MS,
  retry: false,
};

export const maintenanceQueryOptions: MaintenanceQueryOptions = {
  queryKey: queryKeys.settings.maintenance,
  queryFn: () => webApi.getMaintenanceMode(),
  staleTime: SETTINGS_QUERY_STALE_MS,
  refetchInterval: SETTINGS_QUERY_STALE_MS,
  retry: false,
};

type LandingContentQueryOptions = {
  queryKey: typeof queryKeys.settings.landingContent;
  queryFn: () => ReturnType<typeof webApi.getLandingContent>;
  staleTime: number;
  retry: false;
};

export const landingContentQueryOptions: LandingContentQueryOptions = {
  queryKey: queryKeys.settings.landingContent,
  queryFn: () => webApi.getLandingContent(),
  staleTime: SETTINGS_QUERY_STALE_MS,
  retry: false,
};

type SubscriptionsQueryOptions = {
  queryKey: typeof queryKeys.subscriptions.all;
  queryFn: typeof fetchSubscriptions;
  retry: false;
};

async function fetchSubscriptions() {
  const res = await fetch("/api/subscriptions");
  if (!res.ok) throw new Error("Failed to load subscriptions");
  return res.json();
}

export const subscriptionsQueryOptions: SubscriptionsQueryOptions = {
  queryKey: queryKeys.subscriptions.all,
  queryFn: fetchSubscriptions,
  retry: false,
};

export { webOnUnauthorized };
