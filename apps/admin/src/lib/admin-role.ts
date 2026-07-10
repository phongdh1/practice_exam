"use client";

import { useSyncExternalStore } from "react";

/** Decode admin role from JWT payload (UI hint only — API enforces RBAC). */
export function getAdminRoleFromToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("admin_access_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as { role?: string };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

function subscribeToAdminRole(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

/**
 * Hydration-safe admin role for client components.
 * SSR and the hydration pass use `null`; the real JWT role applies after mount.
 */
export function useAdminRole(): string | null {
  return useSyncExternalStore(subscribeToAdminRole, getAdminRoleFromToken, () => null);
}
