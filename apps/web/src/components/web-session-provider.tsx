"use client";

import { queryKeys, type AuthMeUser } from "@practice-exam/api-client";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

async function fetchWebSession(): Promise<AuthMeUser | null> {
  // Optional-auth probe: guests get 401 — must not redirect (public shell pages).
  const res = await fetch("/api/auth/me");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to load session");
  const body = await res.json();
  return body.data as AuthMeUser;
}

interface WebSessionContextValue {
  user: AuthMeUser | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  invalidateSession: () => Promise<void>;
}

const WebSessionContext = createContext<WebSessionContextValue | null>(null);

export function invalidateWebSessionQueries(queryClient: QueryClient): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.me }),
    queryClient.invalidateQueries({ queryKey: queryKeys.entitlements.freeTier }),
  ]).then(() => undefined);
}

export function WebSessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: fetchWebSession,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const invalidateSession = useCallback(
    () => invalidateWebSessionQueries(queryClient),
    [queryClient],
  );

  const value = useMemo<WebSessionContextValue>(
    () => ({
      user,
      isAuthenticated: user != null,
      isLoading,
      invalidateSession,
    }),
    [user, isLoading, invalidateSession],
  );

  return <WebSessionContext.Provider value={value}>{children}</WebSessionContext.Provider>;
}

export function useWebSession(): WebSessionContextValue {
  const ctx = useContext(WebSessionContext);
  if (!ctx) {
    throw new Error("useWebSession must be used within WebSessionProvider");
  }
  return ctx;
}
