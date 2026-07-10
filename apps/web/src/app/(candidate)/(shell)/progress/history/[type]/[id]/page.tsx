"use client";

import { queryKeys } from "@practice-exam/api-client";
import { webAuthFetch } from "@/lib/auth-fetch";
import { disclaimerQueryOptions } from "@/lib/web-api";
import {
  CatalogSkeleton,
  DisclaimerGate,
  FALLBACK_PLATFORM_DISCLAIMER,
  InternalLink,
  MockExamQuestionReviewScreen,
  MockExamResultsScreen,
  PracticeSessionDetailScreen,
} from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

async function fetchPracticeDetail(sessionId: string) {
  const res = await webAuthFetch(`/api/progress/attempts/practice/${sessionId}`);
  if (!res.ok) throw new Error("Failed to load detail");
  const body = await res.json();
  return body.data;
}

async function fetchMockResults(attemptId: string) {
  const res = await webAuthFetch(`/api/mock-exams/attempts/${attemptId}/results`);
  if (!res.ok) throw new Error("Failed to load results");
  const body = await res.json();
  return body.data;
}

export default function AttemptDetailPage() {
  const params = useParams<{ type: string; id: string }>();
  const router = useRouter();
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const isValidType = params.type === "practice" || params.type === "mock";
  const isPractice = params.type === "practice";

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const practiceQuery = useQuery({
    queryKey: queryKeys.progress.practiceDetail(params.id),
    queryFn: () => fetchPracticeDetail(params.id),
    enabled: isValidType && isPractice,
    retry: false,
  });

  const mockQuery = useQuery({
    queryKey: ["mock-exam", "results", params.id],
    queryFn: () => fetchMockResults(params.id),
    enabled: isValidType && !isPractice,
    retry: false,
  });

  const isLoading = isValidType && (isPractice ? practiceQuery.isLoading : mockQuery.isLoading);
  const isError = isValidType && (isPractice ? practiceQuery.isError : mockQuery.isError);
  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;

  const content = (
    <main className="mx-auto max-w-content px-gutter-mobile py-8 pb-20 md:px-gutter-desktop md:pb-8">
      <InternalLink
        href="/progress/history"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        ← Quay lại lịch sử
      </InternalLink>
      {!isValidType && (
        <p className="mt-6 text-sm text-red-600" role="alert">
          Loại phiên không hợp lệ.
        </p>
      )}
      {isValidType && isLoading && (
        <div className="mt-6">
          <CatalogSkeleton count={2} />
        </div>
      )}
      {isValidType && isError && (
        <p className="mt-6 text-sm text-red-600" role="alert">
          Không thể tải chi tiết phiên.
        </p>
      )}
      {isValidType && isPractice && practiceQuery.data && (
        <div className="mt-6">
          <PracticeSessionDetailScreen
            detail={practiceQuery.data}
            onBack={() => router.push("/progress/history")}
            screenId="W-42"
          />
        </div>
      )}
      {isValidType && !isPractice && mockQuery.data && !showReview && (
        <div className="mt-6">
          <MockExamResultsScreen
            results={mockQuery.data}
            onReviewQuestions={() => setShowReview(true)}
            onDone={() => router.push("/progress/history")}
            screenId="W-42"
          />
        </div>
      )}
      {isValidType && !isPractice && mockQuery.data?.questionReviews && showReview && (
        <div className="mt-6">
          <MockExamQuestionReviewScreen
            reviews={mockQuery.data.questionReviews}
            currentIndex={reviewIndex}
            onChangeIndex={setReviewIndex}
            onBack={() => setShowReview(false)}
            screenId="W-42"
          />
        </div>
      )}
    </main>
  );

  return (
    <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="W-42">
      {content}
    </DisclaimerGate>
  );
}
