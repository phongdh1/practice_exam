"use client";

import { useSyncExternalStore } from "react";

export const ADMIN_USER_STORAGE_KEY = "admin_user";

export type AdminCachedUser = {
  id: string;
  username: string;
  displayName: string | null;
  role: string;
};

/** Cached snapshot so useSyncExternalStore getSnapshot stays referentially stable. */
let snapshotRaw: string | null | undefined = undefined;
let snapshotUser: AdminCachedUser | null = null;

function invalidateAdminUserSnapshot(): void {
  snapshotRaw = undefined;
}

function isAdminCachedUser(value: unknown): value is AdminCachedUser {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    v.id.length > 0 &&
    typeof v.username === "string" &&
    v.username.length > 0 &&
    (v.displayName === null || typeof v.displayName === "string") &&
    typeof v.role === "string" &&
    v.role.length > 0
  );
}

/** Persist admin profile from login response. Client-only. */
export function setAdminUser(admin: AdminCachedUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(admin));
  invalidateAdminUserSnapshot();
}

/** Remove cached admin profile. Client-only. */
export function clearAdminUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
  invalidateAdminUserSnapshot();
}

/**
 * Read cached admin profile. Returns null if missing or corrupt JSON
 * (token/role path stays intact).
 */
export function getAdminUser(): AdminCachedUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ADMIN_USER_STORAGE_KEY);
  if (raw === snapshotRaw) return snapshotUser;
  snapshotRaw = raw;
  if (!raw) {
    snapshotUser = null;
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    snapshotUser = isAdminCachedUser(parsed) ? parsed : null;
  } catch {
    snapshotUser = null;
  }
  return snapshotUser;
}

/** Primary label: non-empty displayName, else username. */
export function getAdminDisplayLabel(admin: AdminCachedUser): string {
  const name = admin.displayName?.trim();
  return name ? name : admin.username;
}

function subscribeToAdminUser(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

/**
 * Hydration-safe cached admin profile for client components.
 * SSR and the hydration pass use `null`; the real profile applies after mount.
 */
export function useAdminUser(): AdminCachedUser | null {
  return useSyncExternalStore(subscribeToAdminUser, getAdminUser, () => null);
}
