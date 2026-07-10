"use client";

import { queryKeys } from "@practice-exam/api-client";
import { disclaimerQueryOptions } from "@/lib/web-api";
import {
  CatalogSkeleton,
  DisclaimerGate,
  FALLBACK_PLATFORM_DISCLAIMER,
  ProgressDashboard,
} from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

async function fetchProgressSummary(days: 30 | 90) {
  const res = await fetch(`/api/progress/subjects?days=${days}`);
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error("Failed to load progress");
  const body = await res.json();
  return body.data;
}

export default function ProgressPage() {
  const router = useRouter();
  const [days, setDays] = useState<30 | 90>(30);

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.progress.summary(days),
    queryFn: () => fetchProgressSummary(days),
    retry: false,
  });

  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;

  const content = (
    <main
      id="main-content"
      className="mx-auto max-w-content px-gutter-mobile py-8 pb-20 md:px-gutter-desktop md:pb-8"
      tabIndex={-1}
    >
      {isLoading && <CatalogSkeleton count={2} />}
      {isError && (
        <p className="text-sm text-red-600" role="alert">
          Không thể tải tiến độ. Vui lòng đăng nhập và thử lại.
        </p>
      )}
      {data && (
        <ProgressDashboard
          summaries={data.subjects}
          days={days}
          onDaysChange={setDays}
          onPractice={(subjectId) => router.push(`/subjects/${subjectId}`)}
          screenId="W-40"
        />
      )}
    </main>
  );

  return (
    <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="W-40">
      {content}
    </DisclaimerGate>
  );
}
