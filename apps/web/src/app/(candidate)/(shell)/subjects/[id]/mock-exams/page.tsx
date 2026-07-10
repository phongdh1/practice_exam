"use client";

import { createApiClient, queryKeys } from "@practice-exam/api-client";
import { disclaimerQueryOptions } from "@/lib/web-api";
import {
  DisclaimerGate,
  FALLBACK_PLATFORM_DISCLAIMER,
  InternalLink,
  MockExamFlowScreen,
  Toaster,
} from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { createWebMockExamApi } from "@/lib/mock-exam-api";
import { useCandidateShell } from "@/components/candidate-shell-context";

const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
});

export default function MockExamsPage() {
  const params = useParams<{ id: string }>();
  const subjectId = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTemplateId = searchParams.get("templateId") ?? undefined;
  const mockExamApi = useMemo(() => createWebMockExamApi(), []);
  const [activeExam, setActiveExam] = useState(false);

  const { data: subjectsResponse } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: () => apiClient.listSubjects(),
  });

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const subject = subjectsResponse?.data.find((item) => item.id === subjectId);
  const subjectNamesById = useMemo(() => {
    const map = new Map((subjectsResponse?.data ?? []).map((item) => [item.id, item.name]));
    if (subject) {
      map.set(subject.id, subject.name);
    }
    return map;
  }, [subjectsResponse?.data, subject]);
  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;
  const handleActiveExamChange = useCallback((active: boolean) => {
    setActiveExam(active);
  }, []);

  useCandidateShell({ hideBottomNav: activeExam });

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
            <MockExamFlowScreen
              subjectId={subjectId}
              subjectName={subject.name}
              api={mockExamApi}
              initialTemplateId={initialTemplateId}
              subjectNamesById={subjectNamesById}
              onActiveExamChange={handleActiveExamChange}
              onBack={() => router.push(`/subjects/${subjectId}/mock-exams`)}
              onDone={() => router.push(`/subjects/${subjectId}`)}
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
