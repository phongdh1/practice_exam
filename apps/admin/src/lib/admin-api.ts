import { createApiClient } from "@practice-exam/api-client";

export function getAdminToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("admin_access_token") ?? undefined;
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin_access_token");
}

export function redirectToAdminLogin(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;
  window.location.assign("/login");
}

export const adminApi = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  getAccessToken: getAdminToken,
  onUnauthorized: () => {
    clearAdminSession();
    redirectToAdminLogin();
  },
});
