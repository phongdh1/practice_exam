import { createUnauthorizedGuard } from "@practice-exam/api-client";

export function clearZaloSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export const zaloOnUnauthorized = createUnauthorizedGuard({
  loginPath: "/auth",
  clearSession: clearZaloSession,
});
