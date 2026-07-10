"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  StudyQuestionDetail,
  StudyQuestionListResult,
} from "@practice-exam/types";
import { CatalogSkeleton } from "./catalog-skeleton";
import { QuestionFlagDialog } from "./question-flag-dialog";
import { StudyQuestionDetail as StudyQuestionDetailView } from "./study-question-detail";
import { StudyQuestionList } from "./study-question-list";
import { StudyTierPaywall } from "./study-tier-paywall";
import { toast } from "../hooks/use-toast";

export interface StudyApiAdapter {
  listQuestions(
    subjectId: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<StudyQuestionListResult>;
  getQuestionDetail(subjectId: string, questionId: string): Promise<StudyQuestionDetail>;
  flagQuestion(questionId: string, comment?: string): Promise<void>;
}

export interface StudyFlowScreenProps {
  subjectId: string;
  subjectName: string;
  monthlyPriceVnd: number;
  api: StudyApiAdapter;
  mode: "list" | "detail";
  questionId?: string;
  screenId: "W-12" | "Z-12" | "W-13" | "Z-13";
  paywallScreenId?: "W-14" | "Z-14";
  enablePullToRefresh?: boolean;
  onBack: () => void;
  onSubscribe: () => void;
  onSelectQuestion: (questionId: string) => void;
  onFreePractice?: () => void;
  className?: string;
}

function getApiErrorCode(err: unknown): string | undefined {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

function isStudyTierExceeded(err: unknown): boolean {
  return getApiErrorCode(err) === "STUDY_TIER_EXCEEDED";
}

export function StudyFlowScreen({
  subjectId,
  subjectName,
  monthlyPriceVnd,
  api,
  mode,
  questionId,
  screenId,
  paywallScreenId,
  enablePullToRefresh = false,
  onBack,
  onSubscribe,
  onSelectQuestion,
  onFreePractice,
  className,
}: StudyFlowScreenProps) {
  const [listResult, setListResult] = useState<StudyQuestionListResult | null>(null);
  const [detail, setDetail] = useState<StudyQuestionDetail | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(
    async (nextPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.listQuestions(subjectId, { page: nextPage, pageSize: 20 });
        setListResult(result);
        setPage(nextPage);
      } catch (err) {
        setListResult(null);
        setError(err instanceof Error ? err.message : "Không thể tải danh sách câu hỏi.");
      } finally {
        setLoading(false);
      }
    },
    [api, subjectId],
  );

  const loadDetail = useCallback(async () => {
    if (!questionId) {
      setDetail(null);
      setLoading(false);
      setError("Thiếu mã câu hỏi.");
      return;
    }
    setDetail(null);
    setLoading(true);
    setError(null);
    setPaywallOpen(false);
    try {
      const result = await api.getQuestionDetail(subjectId, questionId);
      setDetail(result);
    } catch (err) {
      setDetail(null);
      if (isStudyTierExceeded(err)) {
        setPaywallOpen(true);
        return;
      }
      setError(err instanceof Error ? err.message : "Không thể tải câu hỏi.");
    } finally {
      setLoading(false);
    }
  }, [api, subjectId, questionId]);

  useEffect(() => {
    if (mode === "list") {
      void loadList(1);
      return;
    }
    void loadDetail();
  }, [mode, questionId, subjectId, loadList, loadDetail]);

  async function handleFlag(comment?: string) {
    if (!detail) return;
    setFlagSubmitting(true);
    try {
      await api.flagQuestion(detail.id, comment);
      toast({ title: "Đã gửi báo cáo" });
    } catch {
      toast({ title: "Không thể gửi báo cáo", variant: "destructive" });
    } finally {
      setFlagSubmitting(false);
    }
  }

  const studyTier = mode === "list" ? listResult?.studyTier : detail?.studyTier;
  const studyTierLimit = studyTier?.limit ?? 5;

  if (loading && mode === "list" && !listResult) {
    return (
      <div className={className}>
        <CatalogSkeleton count={4} />
      </div>
    );
  }

  if (loading && mode === "detail" && !detail && !paywallOpen) {
    return (
      <div className={className}>
        <CatalogSkeleton count={1} />
      </div>
    );
  }

  return (
    <div className={className}>
      {error && (
        <p className="mb-4 text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {mode === "list" && listResult && studyTier && (
        <StudyQuestionList
          items={listResult.items}
          studyTier={studyTier}
          total={listResult.total}
          page={listResult.page}
          pageSize={listResult.pageSize}
          loading={loading}
          screenId={screenId === "Z-12" ? "Z-12" : "W-12"}
          enablePullToRefresh={enablePullToRefresh}
          onRefresh={() => loadList(page)}
          onSelectQuestion={onSelectQuestion}
          onLockedSelect={() => setPaywallOpen(true)}
          onPageChange={(nextPage) => void loadList(nextPage)}
        />
      )}

      {mode === "detail" && detail && (
        <StudyQuestionDetailView
          question={detail}
          screenId={screenId === "Z-13" ? "Z-13" : "W-13"}
          onFlag={() => setFlagOpen(true)}
        />
      )}

      <QuestionFlagDialog
        open={flagOpen}
        onOpenChange={setFlagOpen}
        onSubmit={handleFlag}
        submitting={flagSubmitting}
      />

      <StudyTierPaywall
        open={paywallOpen}
        subjectName={subjectName}
        monthlyPriceVnd={monthlyPriceVnd}
        studyTierLimit={studyTierLimit}
        screenId={paywallScreenId}
        onSubscribe={() => {
          setPaywallOpen(false);
          onSubscribe();
        }}
        onBackToList={() => {
          if (mode === "list") {
            setPaywallOpen(false);
            return;
          }
          onBack();
        }}
        onFreePractice={onFreePractice}
      />
    </div>
  );
}
