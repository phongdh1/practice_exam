"use client";

import { createApiClient, queryKeys } from "@practice-exam/api-client";
import { disclaimerQueryOptions } from "@/lib/web-api";
import {
  Button,
  DisclaimerGate,
  FALLBACK_PLATFORM_DISCLAIMER,
  InternalLink,
  PracticeFlowScreen,
  Toaster,
} from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createWebPracticeApi } from "@/lib/practice-api";

import { useWebSession } from "@/components/web-session-provider";

interface Bookmark {
  id: string;
  stem: string;
}

function PracticeWithBookmarks({
  storageKey,
  subjectId,
  subjectName,
  monthlyPriceVnd,
}: {
  storageKey?: string;
  subjectId: string;
  subjectName: string;
  monthlyPriceVnd: number;
}) {
  const router = useRouter();
  const api = useMemo(() => createWebPracticeApi(subjectId), [subjectId]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkError, setBookmarkError] = useState(false);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      if (Array.isArray(stored)) setBookmarks(stored);
    } catch {
      setBookmarkError(true);
    }
  }, [storageKey]);

  function toggleBookmark(bookmark: Bookmark) {
    if (!storageKey) return;
    const next = bookmarks.some((item) => item.id === bookmark.id)
      ? bookmarks.filter((item) => item.id !== bookmark.id)
      : [...bookmarks, bookmark];
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setBookmarks(next);
      setBookmarkError(false);
    } catch {
      setBookmarkError(true);
    }
  }

  return (
    <>
      {bookmarks.length > 0 && (
        <details className="mb-4 rounded-xl border border-outline-variant p-4">
          <summary className="cursor-pointer font-medium">Câu hỏi đã lưu ({bookmarks.length})</summary>
          <ul className="mt-3 space-y-2">
            {bookmarks.map((bookmark) => (
              <li key={bookmark.id} className="flex items-start justify-between gap-2">
                <InternalLink href={`/subjects/${subjectId}/study/${bookmark.id}`} className="text-sm text-primary hover:underline">
                  {bookmark.stem}
                </InternalLink>
                <Button type="button" variant="ghost" size="sm" onClick={() => toggleBookmark(bookmark)}>
                  Bỏ lưu
                </Button>
              </li>
            ))}
          </ul>
        </details>
      )}
      {bookmarkError && <p role="alert" className="mb-4 text-sm text-error">Không thể truy cập câu hỏi đã lưu.</p>}
      <PracticeFlowScreen
        subjectId={subjectId}
        subjectName={subjectName}
        monthlyPriceVnd={monthlyPriceVnd}
        api={api}
        screenId="W-21"
        summaryScreenId="W-22"
        resumeScreenId="W-20"
        paywallScreenId="W-23"
        onBack={() => router.push(`/subjects/${subjectId}`)}
        onSubscribe={() => router.push(`/subjects/${subjectId}/checkout`)}
        renderQuestionAction={storageKey ? (question) => {
          const saved = bookmarks.some((item) => item.id === question.questionId);
          return (
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={saved}
              onClick={() => toggleBookmark({ id: question.questionId, stem: question.stem })}
            >
              {saved ? "Đã lưu câu hỏi" : "Lưu câu hỏi"}
            </Button>
          );
        } : undefined}
      />
    </>
  );
}

const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
});

export default function PracticePage() {
  const params = useParams<{ id: string }>();
  const subjectId = params.id;
  const { user, isLoading: sessionLoading } = useWebSession();
  const storageKey = user ? `practice-bookmarks:${user.id}:${subjectId}` : undefined;

  const { data: subjectsResponse } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: () => apiClient.listSubjects(),
  });

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const subject = subjectsResponse?.data.find((item) => item.id === subjectId);
  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;

  const content = (
    <>
      <main className="mx-auto max-w-content px-gutter-mobile py-8 pb-20 md:px-gutter-desktop md:pb-8">
        <InternalLink
          href={`/subjects/${subjectId}`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          ← Quay lại môn học
        </InternalLink>
        {subject && !sessionLoading ? (
          <div className="mt-6">
            <PracticeWithBookmarks
              key={storageKey ?? subjectId}
              storageKey={storageKey}
              subjectId={subjectId}
              subjectName={subject.name}
              monthlyPriceVnd={subject.monthlyPriceVnd}
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
