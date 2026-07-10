export function getWebAccessToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((c) => c.startsWith("access_token="))
    ?.split("=")[1];
}

export function clearWebSession(): void {
  if (typeof document === "undefined") return;
  document.cookie = "access_token=; path=/; max-age=0; samesite=lax";
  document.cookie = "refresh_token=; path=/; max-age=0; samesite=lax";
}
