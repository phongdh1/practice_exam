"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  PracticeAnswerFeedback,
  PracticeQuestionView as PracticeQuestionData,
  PracticeSessionSummary,
  PracticeSessionView,
} from "@practice-exam/types";
import { CatalogSkeleton } from "./catalog-skeleton";
import { FreeTierPaywall } from "./free-tier-paywall";
import { PracticeQuestionView } from "./practice-question-view";
import { PracticeResumePrompt } from "./practice-resume-prompt";
import { PracticeSessionSummaryView } from "./practice-session-summary-view";
import { QuestionFlagDialog } from "./question-flag-dialog";
import { toast } from "../hooks/use-toast";

export interface PracticeApiAdapter {
  getActiveSession(subjectId: string): Promise<PracticeSessionView | null>;
  startSession(subjectId: string, forceNew?: boolean): Promise<PracticeSessionView>;
  getQuestion(sessionId: string): Promise<PracticeQuestionData | null>;
  submitAnswer(
    sessionId: string,
    input: { questionId: string; selectedKeys: string[] },
  ): Promise<PracticeAnswerFeedback>;
  endSession(sessionId: string): Promise<PracticeSessionSummary>;
  flagQuestion(questionId: string, comment?: string): Promise<void>;
}

export interface PracticeFlowScreenProps {
  subjectId: string;
  subjectName: string;
  monthlyPriceVnd: number;
  api: PracticeApiAdapter;
  screenId: "W-21" | "Z-21";
  summaryScreenId?: "W-22" | "Z-22";
  resumeScreenId?: "W-20" | "Z-20";
  paywallScreenId?: "W-23" | "Z-23";
  onBack: () => void;
  onSubscribe: () => void;
  className?: string;
}

type Phase = "loading" | "resume" | "practice" | "summary";

function getApiErrorCode(err: unknown): string | undefined {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

function isFreeTierExceeded(err: unknown): boolean {
  return getApiErrorCode(err) === "FREE_TIER_EXCEEDED";
}

export function PracticeFlowScreen({
  subjectId,
  subjectName,
  monthlyPriceVnd,
  api,
  screenId,
  summaryScreenId,
  resumeScreenId,
  paywallScreenId,
  onBack,
  onSubscribe,
  className,
}: PracticeFlowScreenProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<PracticeSessionView | null>(null);
  const [pendingResume, setPendingResume] = useState<PracticeSessionView | null>(null);
  const [question, setQuestion] = useState<PracticeQuestionData | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<PracticeAnswerFeedback | null>(null);
  const [summary, setSummary] = useState<PracticeSessionSummary | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bootstrappedRef = useRef(false);

  const loadQuestion = useCallback(async (sessionId: string) => {
    try {
      const next = await api.getQuestion(sessionId);
      if (!next) {
        const ended = await api.endSession(sessionId);
        setSummary(ended);
        setPhase("summary");
        return;
      }
      setQuestion(next);
      setSelectedKeys([]);
      setRevealed(false);
      setFeedback(null);
      setPhase("practice");
    } catch (err) {
      if (isFreeTierExceeded(err)) {
        setPaywallOpen(true);
        const ended = await api.endSession(sessionId);
        setSummary(ended);
        setPhase("summary");
        return;
      }
      const message = err instanceof Error ? err.message : "Không thể tải câu hỏi.";
      setError(message);
    }
  }, [api]);

  const bootstrap = useCallback(async () => {
    setError(null);
    setPhase("loading");
    try {
      const active = await api.getActiveSession(subjectId);
      if (active && active.resumable) {
        setPendingResume(active);
        setPhase("resume");
        return;
      }
      const started = active ?? (await api.startSession(subjectId));
      setSession(started);
      await loadQuestion(started.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể bắt đầu luyện tập.");
    }
  }, [api, subjectId, loadQuestion]);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;
    void bootstrap();
  }, [bootstrap]);

  function toggleOption(key: string) {
    if (!question || revealed) return;
    if (question.questionType === "multiple_choice") {
      setSelectedKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
      );
    } else {
      setSelectedKeys([key]);
    }
  }

  async function handleConfirm() {
    if (!session || !question) return;
    setConfirming(true);
    setError(null);
    try {
      const result = await api.submitAnswer(session.id, {
        questionId: question.questionId,
        selectedKeys,
      });
      setFeedback(result);
      setRevealed(true);
      setSession((prev) =>
        prev
          ? {
              ...prev,
              answeredCount: result.answeredCount,
              correctCount: result.correctCount,
              freeTierAtLimit: result.freeTierAtLimit,
            }
          : prev,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi câu trả lời.");
    } finally {
      setConfirming(false);
    }
  }

  async function handleNext() {
    if (!session) return;
    setLoadingNext(true);
    try {
      if (session.freeTierAtLimit || feedback?.freeTierAtLimit) {
        setPaywallOpen(true);
        const ended = await api.endSession(session.id);
        setSummary(ended);
        setPhase("summary");
        return;
      }
      await loadQuestion(session.id);
    } finally {
      setLoadingNext(false);
    }
  }

  async function handleEnd() {
    if (!session) return;
    const ended = await api.endSession(session.id);
    setSummary(ended);
    setPhase("summary");
  }

  async function handleFlag(comment?: string) {
    if (!question) return;
    setFlagSubmitting(true);
    try {
      await api.flagQuestion(question.questionId, comment);
      toast({ title: "Đã gửi báo cáo" });
    } catch {
      toast({ title: "Không thể gửi báo cáo", variant: "destructive" });
    } finally {
      setFlagSubmitting(false);
    }
  }

  async function handleResume() {
    if (!pendingResume) return;
    setError(null);
    try {
      setSession(pendingResume);
      setPendingResume(null);
      await loadQuestion(pendingResume.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tiếp tục phiên luyện tập.");
    }
  }

  async function handleStartNew() {
    setError(null);
    try {
      const started = await api.startSession(subjectId, true);
      setSession(started);
      setPendingResume(null);
      await loadQuestion(started.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể bắt đầu phiên mới.");
    }
  }

  if (phase === "loading") {
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

      <PracticeResumePrompt
        open={phase === "resume" && pendingResume !== null}
        subjectName={subjectName}
        answeredCount={pendingResume?.answeredCount ?? 0}
        onResume={() => void handleResume()}
        onStartNew={() => void handleStartNew()}
        screenId={resumeScreenId}
      />

      {phase === "practice" && question && session && (
        <PracticeQuestionView
          question={question}
          questionNumber={question.questionNumber}
          selectedKeys={selectedKeys}
          revealed={revealed}
          isCorrect={feedback?.isCorrect ?? null}
          correctOptionKeys={feedback?.correctOptionKeys ?? []}
          explanation={feedback?.explanation ?? null}
          onToggleOption={toggleOption}
          onConfirm={() => void handleConfirm()}
          onNext={() => void handleNext()}
          onEnd={() => void handleEnd()}
          onFlag={() => setFlagOpen(true)}
          confirming={confirming}
          loadingNext={loadingNext}
          screenId={screenId}
        />
      )}

      {phase === "summary" && summary && (
        <PracticeSessionSummaryView
          summary={summary}
          screenId={summaryScreenId}
          onPracticeAgain={
            summary.freeTierAtLimit ? undefined : () => void bootstrap()
          }
          onSubscribe={summary.freeTierAtLimit ? onSubscribe : undefined}
          onBack={onBack}
        />
      )}

      <QuestionFlagDialog
        open={flagOpen}
        onOpenChange={setFlagOpen}
        onSubmit={handleFlag}
        submitting={flagSubmitting}
      />

      <FreeTierPaywall
        open={paywallOpen}
        subjectName={subjectName}
        monthlyPriceVnd={monthlyPriceVnd}
        screenId={paywallScreenId}
        onSubscribe={() => {
          setPaywallOpen(false);
          onSubscribe();
        }}
        onDismiss={() => setPaywallOpen(false)}
      />
    </div>
  );
}
