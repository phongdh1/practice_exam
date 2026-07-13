"use client";

import { queryKeys } from "@practice-exam/api-client";
import {
  AccountProfileView,
  CandidateFooter,
  CatalogSkeleton,
  DisclaimerGate,
  FALLBACK_PLATFORM_DISCLAIMER,
} from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useWebSession } from "@/components/web-session-provider";
import { webAuthFetch } from "@/lib/auth-fetch";
import { disclaimerQueryOptions, subscriptionsQueryOptions } from "@/lib/web-api";

const RECENT_ATTEMPTS_LIMIT = 5;

type AttemptHistoryItem = {
  id: string;
  type: "practice" | "mock";
  subjectId: string;
  subjectName: string;
  date: string;
  scorePercent: number | null;
  label: string;
};

async function fetchAttemptHistory(): Promise<AttemptHistoryItem[]> {
  const res = await webAuthFetch("/api/progress/attempts");
  if (!res.ok) throw new Error("Failed to load history");
  const body = await res.json();
  return (body.data?.items ?? []) as AttemptHistoryItem[];
}

function resolveRenewHref(subscriptions: { status: string; subjectId: string }[]): string {
  const expiring = subscriptions.find((sub) => sub.status === "expiring");
  if (expiring) return `/subjects/${expiring.subjectId}`;
  return "/";
}

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: sessionLoading } = useWebSession();

  useEffect(() => {
    if (!sessionLoading && !isAuthenticated) {
      router.replace("/sign-in?returnTo=/account");
    }
  }, [isAuthenticated, router, sessionLoading]);

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const {
    data: subscriptionsResponse,
    isLoading: subscriptionsLoading,
    isError: subscriptionsError,
  } = useQuery({
    ...subscriptionsQueryOptions,
    enabled: isAuthenticated,
  });

  const {
    data: attempts,
    isLoading: attemptsLoading,
    isError: attemptsError,
  } = useQuery({
    queryKey: queryKeys.progress.attempts,
    queryFn: fetchAttemptHistory,
    enabled: isAuthenticated,
    retry: false,
  });

  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;
  const subscriptions = subscriptionsResponse?.data ?? [];
  const recentAttempts = useMemo(
    () => (attempts ?? []).slice(0, RECENT_ATTEMPTS_LIMIT),
    [attempts],
  );
  const renewHref = resolveRenewHref(subscriptions);

  const dataLoading =
    sessionLoading || (isAuthenticated && (subscriptionsLoading || attemptsLoading));
  const dataError = subscriptionsError || attemptsError;

  if (!sessionLoading && !isAuthenticated) {
    return null;
  }

  const content = (
    <>
      <main
        id="main-content"
        className="mx-auto max-w-7xl px-gutter-mobile py-8 pb-20 md:px-gutter-desktop md:pb-8"
        tabIndex={-1}
      >
        {dataLoading && <CatalogSkeleton count={4} />}
        {dataError && (
          <p className="text-sm text-error" role="alert">
            Không thể tải thông tin tài khoản. Vui lòng thử lại sau.
          </p>
        )}
        {!dataLoading && !dataError && user && (
          <AccountProfileView
            user={user}
            subscriptions={subscriptions}
            attempts={recentAttempts}
            renewHref={renewHref}
            disclaimerText={disclaimer.text}
          />
        )}
      </main>
      <CandidateFooter />
    </>
  );

  return (
    <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="W-50">
      {content}
    </DisclaimerGate>
  );
}
