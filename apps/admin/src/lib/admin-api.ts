import { createApiClient, createUnauthorizedGuard } from "@practice-exam/api-client";
import { clearAdminUser } from "./admin-session";

export function getAdminToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("admin_access_token") ?? undefined;
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin_access_token");
  clearAdminUser();
}

export const adminOnUnauthorized = createUnauthorizedGuard({
  loginPath: "/login",
  clearSession: clearAdminSession,
});

export const adminApi = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  getAccessToken: getAdminToken,
  onUnauthorized: adminOnUnauthorized,
});
