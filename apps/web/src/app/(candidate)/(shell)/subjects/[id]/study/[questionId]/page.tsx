"use client";

import { createApiClient, queryKeys } from "@practice-exam/api-client";
import { disclaimerQueryOptions } from "@/lib/web-api";
import {
  DisclaimerGate,
  FALLBACK_PLATFORM_DISCLAIMER,
  InternalLink,
  StudyFlowScreen,
  Toaster,
} from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { createWebStudyApi } from "@/lib/study-api";

const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
});

export default function StudyDetailPage() {
  const params = useParams<{ id: string; questionId: string }>();
  const subjectId = params.id;
  const questionId = params.questionId;
  const router = useRouter();

  const { data: subjectsResponse, isLoading, isError } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: () => apiClient.listSubjects(),
  });

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const subject = subjectsResponse?.data.find((item) => item.id === subjectId);
  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;
  const studyApi = useMemo(() => createWebStudyApi(subjectId), [subjectId]);

  const content = (
    <>
      <main className="mx-auto max-w-content px-gutter-mobile py-8 pb-20 md:px-gutter-desktop md:pb-8">
        <InternalLink
          href={`/subjects/${subjectId}/study`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          ← Quay lại danh sách
        </InternalLink>
        {isLoading && <p className="mt-6 text-sm text-ink-muted">Đang tải...</p>}
        {isError && (
          <p className="mt-6 text-sm text-red-600" role="alert">
            Không thể tải thông tin môn học.
          </p>
        )}
        {!isLoading && !isError && subject && (
          <div className="mt-6">
            <StudyFlowScreen
              subjectId={subjectId}
              subjectName={subject.name}
              monthlyPriceVnd={subject.monthlyPriceVnd}
              api={studyApi}
              mode="detail"
              questionId={questionId}
              screenId="W-13"
              paywallScreenId="W-14"
              onBack={() => router.push(`/subjects/${subjectId}/study`)}
              onSubscribe={() => router.push(`/subjects/${subjectId}/checkout`)}
              onSelectQuestion={() => undefined}
              onFreePractice={() => router.push(`/subjects/${subjectId}/practice`)}
            />
          </div>
        )}
        {!isLoading && !isError && !subject && (
          <p className="mt-6 text-sm text-ink-muted">Không tìm thấy môn học.</p>
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
