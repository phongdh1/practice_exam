"use client";

import { queryKeys } from "@practice-exam/api-client";
import { disclaimerQueryOptions } from "@/lib/web-api";
import { webAuthFetch } from "@/lib/auth-fetch";
import {
  AttemptHistoryList,
  CatalogSkeleton,
  DisclaimerGate,
  FALLBACK_PLATFORM_DISCLAIMER,
  InternalLink,
} from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";

async function fetchAttemptHistory() {
  const res = await webAuthFetch("/api/progress/attempts");
  if (!res.ok) throw new Error("Failed to load history");
  const body = await res.json();
  return body.data;
}

export default function AttemptHistoryPage() {
  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.progress.attempts,
    queryFn: fetchAttemptHistory,
    retry: false,
  });

  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;

  const content = (
    <main
      id="main-content"
      className="mx-auto max-w-content px-gutter-mobile py-8 pb-20 md:px-gutter-desktop md:pb-8"
      tabIndex={-1}
    >
      <InternalLink href="/progress" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        ← Quay lại tiến độ
      </InternalLink>
      <h1 className="mt-4 text-display-sm font-heading text-primary">Lịch sử luyện tập</h1>
      {isLoading && (
        <div className="mt-6">
          <CatalogSkeleton count={3} />
        </div>
      )}
      {isError && (
        <p className="mt-6 text-sm text-red-600" role="alert">
          Không thể tải lịch sử. Vui lòng đăng nhập và thử lại.
        </p>
      )}
      {data && (
        <div className="mt-6">
          <AttemptHistoryList items={data.items} screenId="W-41" />
        </div>
      )}
    </main>
  );

  return (
    <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="W-41">
      {content}
    </DisclaimerGate>
  );
}
