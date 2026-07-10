"use client";

import { createApiClient, queryKeys } from "@practice-exam/api-client";
import { disclaimerQueryOptions } from "@/lib/web-api";
import {
  DisclaimerGate,
  FALLBACK_PLATFORM_DISCLAIMER,
  InternalLink,
  PracticeFlowScreen,
  Toaster,
} from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { createWebPracticeApi } from "@/lib/practice-api";

const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
});

export default function PracticePage() {
  const params = useParams<{ id: string }>();
  const subjectId = params.id;
  const router = useRouter();

  const { data: subjectsResponse } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: () => apiClient.listSubjects(),
  });

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const subject = subjectsResponse?.data.find((item) => item.id === subjectId);
  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;
  const practiceApi = useMemo(() => createWebPracticeApi(subjectId), [subjectId]);

  const content = (
    <>
      <main className="mx-auto max-w-content px-gutter-mobile py-8 pb-20 md:px-gutter-desktop md:pb-8">
        <InternalLink
          href={`/subjects/${subjectId}`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          ← Quay lại môn học
        </InternalLink>
        {subject ? (
          <div className="mt-6">
            <PracticeFlowScreen
              subjectId={subjectId}
              subjectName={subject.name}
              monthlyPriceVnd={subject.monthlyPriceVnd}
              api={practiceApi}
              screenId="W-21"
              summaryScreenId="W-22"
              resumeScreenId="W-20"
              paywallScreenId="W-23"
              onBack={() => router.push(`/subjects/${subjectId}`)}
              onSubscribe={() => router.push(`/subjects/${subjectId}/checkout`)}
            />
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink-muted">Đang tải...</p>
        )}
      </main>
      <Toaster />
    </>
  );

  return (
    <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="W-03">
      {content}
    </DisclaimerGate>
  );
}
