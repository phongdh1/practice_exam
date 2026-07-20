"use client";

import { createApiClient, queryKeys } from "@practice-exam/api-client";
import { disclaimerQueryOptions, landingContentQueryOptions } from "@/lib/web-api";
import {
  CatalogPagination,
  CatalogSkeleton,
  CandidateFooter,
  DisclaimerGate,
  FALLBACK_PLATFORM_DISCLAIMER,
  LandingCtaBand,
  LandingFeaturedSubjects,
  LandingFeatures,
  LandingHero,
  mergeLandingContent,
  PullToRefresh,
  SubjectCatalogGrid,
} from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useWebSession } from "@/components/web-session-provider";

const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
});

const CATALOG_PAGE_SIZE = 12;

type CatalogSubject = Awaited<
  ReturnType<typeof apiClient.listSubjectsPaginated>
>["data"]["items"][number];

async function fetchFreeTierUsage() {
  const res = await fetch("/api/entitlements/free-tier");
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to load entitlements");
  return res.json();
}

export default function HomePage() {
  const { isAuthenticated, user } = useWebSession();
  const [page, setPage] = useState(1);
  const [featuredPool, setFeaturedPool] = useState<CatalogSubject[]>([]);

  const {
    data: subjectsResponse,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.subjects.catalogPage(page, CATALOG_PAGE_SIZE),
    queryFn: () => apiClient.listSubjectsPaginated({ page, limit: CATALOG_PAGE_SIZE }),
  });

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const { data: landingContentResponse } = useQuery({
    ...landingContentQueryOptions,
    enabled: !isAuthenticated,
  });

  const { data: entitlementsResponse } = useQuery({
    queryKey: queryKeys.entitlements.freeTier,
    queryFn: fetchFreeTierUsage,
    retry: false,
  });

  const catalog = subjectsResponse?.data;
  const subjects = catalog?.items ?? [];
  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;
  const disclaimerText = disclaimer.text?.trim() || FALLBACK_PLATFORM_DISCLAIMER.text;
  const landingContent = mergeLandingContent(landingContentResponse?.data);
  const freeTierUsedBySubjectId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of entitlementsResponse?.data?.items ?? []) {
      map[item.subjectId] = item.used;
    }
    return map;
  }, [entitlementsResponse]);

  useEffect(() => {
    if (page === 1 && !isLoading && !isError) {
      setFeaturedPool(subjects);
    }
  }, [page, isLoading, isError, subjects]);

  const getSubjectHref = (subject: { id: string }) => `/subjects/${subject.id}`;

  const content = (
    <div className="pb-20 md:pb-0">
      {!isAuthenticated && (
        <>
          <LandingHero content={landingContent} catalogHref="#catalog" />
          <LandingFeatures />
          {featuredPool.length > 0 && (
            <LandingFeaturedSubjects
              subjects={featuredPool}
              getSubjectHref={getSubjectHref}
              catalogHref="#catalog"
            />
          )}
        </>
      )}
      <PullToRefresh
        className="min-h-screen"
        onRefresh={() => refetch()}
        disabled={isFetching}
      >
        <main
          id="catalog"
          className="mx-auto max-w-content scroll-mt-20 px-gutter-mobile py-8 md:px-gutter-desktop"
        >
          <div className={!isAuthenticated ? "mt-4" : "mt-8"}>
            {isLoading && <CatalogSkeleton />}
            {isError && (
              <p className="text-sm text-error" role="alert">
                Không thể tải danh mục môn học. Kéo xuống để thử lại.
              </p>
            )}
            {!isLoading && !isError && (
              <>
                <SubjectCatalogGrid
                  subjects={subjects}
                  totalCount={catalog?.total}
                  userName={isAuthenticated ? (user?.displayName ?? "Học viên") : undefined}
                  freeTierUsedBySubjectId={freeTierUsedBySubjectId}
                  getSubjectHref={getSubjectHref}
                />
                {catalog && (
                  <CatalogPagination
                    page={catalog.page}
                    totalPages={catalog.totalPages}
                    total={catalog.total}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </PullToRefresh>
      {!isAuthenticated && <LandingCtaBand />}
      <CandidateFooter
        variant={isAuthenticated ? "compact" : "marketing"}
        disclaimerText={disclaimerText}
      />
    </div>
  );

  return (
    <DisclaimerGate text={disclaimerText} version={disclaimer.version} screenId="W-03">
      {content}
    </DisclaimerGate>
  );
}
