"use client";

import { createApiClient, queryKeys } from "@practice-exam/api-client";
import { disclaimerQueryOptions } from "@/lib/web-api";
import { webAuthFetch } from "@/lib/auth-fetch";
import {
  CatalogSkeleton,
  DisclaimerGate,
  FALLBACK_PLATFORM_DISCLAIMER,
  FreeTierPaywall,
  InternalLink,
  SubjectDetailView,
} from "@practice-exam/ui";
import type { SubjectSubscriptionView } from "@practice-exam/utils";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
});

async function fetchSubjectSubscription(subjectId: string): Promise<SubjectSubscriptionView | null> {
  // Optional-auth probe: guests get 401 without a session — must not redirect (public subject detail).
  const res = await fetch(`/api/subscriptions/${subjectId}`);
  if (res.status === 401) return null;
  if (!res.ok) return null;
  const body = await res.json();
  const summary = body.data;
  if (!summary) return null;
  return { status: summary.status, expiresAt: summary.periodEnd };
}

export default function SubjectDetailPage() {
  const params = useParams<{ id: string }>();
  const subjectId = params.id;
  const router = useRouter();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: subjectsResponse, isLoading, isError } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: () => apiClient.listSubjects(),
  });

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const { data: entitlementResponse } = useQuery({
    queryKey: queryKeys.entitlements.subject(subjectId),
    queryFn: async () => {
      // Optional-auth probe: guests get 401 without a session — must not redirect (public subject detail).
      const res = await fetch(`/api/entitlements/${subjectId}`);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to load entitlement");
      return res.json();
    },
    retry: false,
  });

  const { data: studyTierResponse } = useQuery({
    queryKey: queryKeys.study.tier(subjectId),
    queryFn: async () => {
      // Optional-auth probe: guests get 401 without a session — must not redirect (public subject detail).
      const res = await fetch(`/api/study/subjects/${subjectId}/tier`);
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to load study tier");
      return res.json();
    },
    retry: false,
  });

  const { data: subscriptionResponse } = useQuery({
    queryKey: queryKeys.subscriptions.subject(subjectId),
    queryFn: () => fetchSubjectSubscription(subjectId),
    retry: false,
  });

  const subject = subjectsResponse?.data.find((item) => item.id === subjectId);
  const freeTierStatus = entitlementResponse?.data ?? null;
  const studyTierStatus = studyTierResponse?.data ?? null;
  const subscription = subscriptionResponse ?? null;
  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;

  async function handleStudy() {
    if (!subject) return;
    setActionError(null);

    const res = await webAuthFetch(`/api/study/subjects/${subjectId}/tier`);
    if (!res.ok) {
      setActionError("Không thể kiểm tra quyền ôn tập. Vui lòng thử lại.");
      return;
    }

    router.push(`/subjects/${subjectId}/study`);
  }

  async function handlePractice() {
    if (!subject) return;
    setActionError(null);

    if (freeTierStatus?.isAtLimit) {
      setPaywallOpen(true);
      return;
    }

    await webAuthFetch(`/api/practice/subjects/${subjectId}`);
    router.push(`/subjects/${subjectId}/practice`);
  }

  async function handleMockExam() {
    if (!subject) return;
    setActionError(null);

    const res = await webAuthFetch(`/api/entitlements/${subjectId}/mock-exam`);
    if (!res.ok) {
      setActionError("Không thể kiểm tra quyền thi thử. Vui lòng thử lại.");
      return;
    }

    const body = await res.json();
    if (!body.data?.allowed) {
      setPaywallOpen(true);
      return;
    }

    router.push(`/subjects/${subjectId}/mock-exams`);
  }

  const detail = (
    <main className="mx-auto max-w-content px-gutter-mobile py-8 pb-20 md:px-gutter-desktop md:pb-8">
      <InternalLink href="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        ← Quay lại danh mục
      </InternalLink>
      {actionError && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {actionError}
        </p>
      )}
      {isLoading && (
        <div className="mt-6">
          <CatalogSkeleton count={1} />
        </div>
      )}
      {isError && (
        <p className="mt-6 text-sm text-red-600" role="alert">
          Không thể tải thông tin môn học.
        </p>
      )}
      {!isLoading && !isError && subject && (
        <div className="mt-6">
          <SubjectDetailView
            subject={subject}
            subscription={subscription}
            freeTierStatus={freeTierStatus}
            studyTierStatus={studyTierStatus}
            screenId="W-11"
            onStudy={handleStudy}
            onPractice={handlePractice}
            onMockExam={handleMockExam}
            onSubscribe={() => router.push(`/subjects/${subjectId}/checkout`)}
          />
          <FreeTierPaywall
            open={paywallOpen}
            subjectName={subject.name}
            monthlyPriceVnd={subject.monthlyPriceVnd}
            screenId="W-23"
            onSubscribe={() => {
              setPaywallOpen(false);
              router.push(`/subjects/${subjectId}/checkout`);
            }}
            onDismiss={() => setPaywallOpen(false)}
          />
        </div>
      )}
      {!isLoading && !isError && !subject && (
        <p className="mt-6 text-sm text-ink-muted">Không tìm thấy môn học.</p>
      )}
    </main>
  );

  return (
    <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="W-03">
      {detail}
    </DisclaimerGate>
  );
}
