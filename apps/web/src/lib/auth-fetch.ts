import { UnauthorizedError } from "@practice-exam/api-client";
import { webOnUnauthorized } from "./web-api";

let refreshInFlight: Promise<Response> | undefined;

function refreshSession(): Promise<Response> {
  if (!refreshInFlight) {
    const refresh = () => fetch("/api/auth/refresh", { method: "POST" });
    refreshInFlight = (navigator.locks
      ? navigator.locks.request("practice-exam-session-refresh", refresh)
      : refresh()
    ).finally(() => {
      refreshInFlight = undefined;
    });
  }
  return refreshInFlight;
}

export async function webSessionFetch(input: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (response.status !== 401) return response;

  const refreshed = await refreshSession();
  if (refreshed.status === 401) return response;
  if (!refreshed.ok) throw new Error("Không thể gia hạn phiên. Vui lòng thử lại.");
  return fetch(input, init);
}

export async function webAuthFetch(input: string, init?: RequestInit): Promise<Response> {
  const response = await webSessionFetch(input, init);
  if (response.status === 401) {
    webOnUnauthorized();
    throw new UnauthorizedError();
  }
  return response;
}
