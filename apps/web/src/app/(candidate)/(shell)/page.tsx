"use client";

import { createApiClient, queryKeys } from "@practice-exam/api-client";
import { disclaimerQueryOptions } from "@/lib/web-api";
import {
  CatalogSkeleton,
  CandidateFooter,
  DisclaimerGate,
  FALLBACK_PLATFORM_DISCLAIMER,
  LandingHero,
  PullToRefresh,
  SubjectCatalogGrid,
} from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useWebSession } from "@/components/web-session-provider";

const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
});

async function fetchFreeTierUsage() {
  // Optional-auth probe: guests get 401 without a session — must not redirect (public catalog).
  const res = await fetch("/api/entitlements/free-tier");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to load entitlements");
  return res.json();
}

export default function HomePage() {
  const { isAuthenticated, user } = useWebSession();
  const {
    data: subjectsResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: () => apiClient.listSubjects(),
  });

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const { data: entitlementsResponse } = useQuery({
    queryKey: queryKeys.entitlements.freeTier,
    queryFn: fetchFreeTierUsage,
    retry: false,
  });

  const subjects = subjectsResponse?.data ?? [];
  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;
  const freeTierUsedBySubjectId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of entitlementsResponse?.data?.items ?? []) {
      map[item.subjectId] = item.used;
    }
    return map;
  }, [entitlementsResponse]);

  const content = (
    <>
      {!isAuthenticated && <LandingHero catalogHref="#catalog" />}
      <PullToRefresh
        className="min-h-screen pb-20 md:pb-0"
        onRefresh={() => refetch()}
        disabled={isFetching}
      >
        <main
          id="catalog"
          className="mx-auto max-w-content px-gutter-mobile py-8 md:px-gutter-desktop"
        >
          <div className="mt-8">
            {isLoading && <CatalogSkeleton />}
            {isError && (
              <p className="text-sm text-error" role="alert">
                Không thể tải danh mục môn học. Kéo xuống để thử lại.
              </p>
            )}
            {!isLoading && !isError && (
              <SubjectCatalogGrid
                subjects={subjects}
                userName={isAuthenticated ? (user?.displayName ?? "Học viên") : undefined}
                freeTierUsedBySubjectId={freeTierUsedBySubjectId}
                getSubjectHref={(subject) => `/subjects/${subject.id}`}
              />
            )}
          </div>
        </main>
      </PullToRefresh>
      <CandidateFooter />
    </>
  );

  return (
    <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="W-03">
      {content}
    </DisclaimerGate>
  );
}
