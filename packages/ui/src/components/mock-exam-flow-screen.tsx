"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  MockExamAttemptView,
  MockExamCandidateTemplateView,
  MockExamQuestionView,
  MockExamResultsView,
  MockExamReviewItem,
} from "@practice-exam/types";
import { CatalogSkeleton } from "./catalog-skeleton";
import { MockExamBriefing } from "./mock-exam-briefing";
import { MockExamQuestionReviewScreen } from "./mock-exam-question-review-screen";
import { MockExamResultsScreen } from "./mock-exam-results-screen";
import { MockExamReviewGrid } from "./mock-exam-review-grid";
import { MockExamSectionQuestion } from "./mock-exam-section-question";
import { MockExamTemplateList } from "./mock-exam-template-list";
import { MockExamTimerBar } from "./mock-exam-timer-bar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { toast } from "../hooks/use-toast";

export interface MockExamApiAdapter {
  listTemplates(subjectId: string): Promise<MockExamCandidateTemplateView[]>;
  getActiveAttempt(templateId: string): Promise<MockExamAttemptView | null>;
  startAttempt(templateId: string): Promise<MockExamAttemptView>;
  getAttempt(attemptId: string): Promise<MockExamAttemptView>;
  getQuestion(attemptId: string, questionId?: string): Promise<MockExamQuestionView | null>;
  saveAnswer(
    attemptId: string,
    input: { questionId: string; selectedKeys: string[] },
  ): Promise<{ attempt: MockExamAttemptView }>;
  advanceSection(attemptId: string): Promise<MockExamAttemptView>;
  getReview(attemptId: string): Promise<MockExamReviewItem[]>;
  submitAttempt(attemptId: string): Promise<MockExamResultsView>;
  getResults(attemptId: string): Promise<MockExamResultsView>;
}

export interface MockExamFlowScreenProps {
  subjectId: string;
  subjectName: string;
  api: MockExamApiAdapter;
  initialTemplateId?: string;
  subjectNamesById?: ReadonlyMap<string, string>;
  screenIds?: {
    list?: "W-30" | "Z-30";
    briefing?: "W-31" | "Z-31";
    section?: "W-32" | "Z-32";
    review?: "W-33" | "Z-33";
    results?: "W-34" | "Z-34";
    questionReview?: "W-35" | "Z-35";
  };
  onBack: () => void;
  onDone: () => void;
  onActiveExamChange?: (active: boolean) => void;
  className?: string;
}

type Phase = "loading" | "list" | "briefing" | "section" | "review" | "results" | "question-review";

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return fallback;
}

export function MockExamFlowScreen({
  subjectId,
  subjectName,
  api,
  initialTemplateId,
  subjectNamesById,
  screenIds,
  onBack,
  onDone,
  onActiveExamChange,
  className,
}: MockExamFlowScreenProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [templates, setTemplates] = useState<MockExamCandidateTemplateView[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MockExamCandidateTemplateView | null>(null);
  const [attempt, setAttempt] = useState<MockExamAttemptView | null>(null);
  const [question, setQuestion] = useState<MockExamQuestionView | null>(null);
  const [reviewItems, setReviewItems] = useState<MockExamReviewItem[]>([]);
  const [results, setResults] = useState<MockExamResultsView | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [reviewQuestionId, setReviewQuestionId] = useState<string | null>(null);
  const [questionReviewIndex, setQuestionReviewIndex] = useState(0);
  const [starting, setStarting] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipAutoSaveRef = useRef(true);

  const enrichedSubjectNamesById = useMemo(() => {
    const map = new Map(subjectNamesById ?? []);
    map.set(subjectId, subjectName);
    return map;
  }, [subjectNamesById, subjectId, subjectName]);

  const saveCurrentAnswerIfAny = useCallback(async () => {
    if (!attempt || !question || selectedKeys.length === 0) return;
    await api.saveAnswer(attempt.id, {
      questionId: question.id,
      selectedKeys,
    });
  }, [api, attempt, question, selectedKeys]);

  const syncPhaseFromAttempt = useCallback((next: MockExamAttemptView) => {
    setAttempt(next);
    if (next.status === "completed") {
      setPhase("results");
      return;
    }
    if (next.phase === "review") {
      setPhase("review");
      return;
    }
    setPhase("section");
  }, []);

  const loadQuestion = useCallback(
    async (attemptId: string, questionId?: string) => {
      const nextQuestion = await api.getQuestion(attemptId, questionId);
      setQuestion(nextQuestion);
      setSelectedKeys(nextQuestion?.selectedKeys ?? []);
      return nextQuestion;
    },
    [api],
  );

  const loadReview = useCallback(
    async (attemptId: string) => {
      const items = await api.getReview(attemptId);
      setReviewItems(items);
      return items;
    },
    [api],
  );

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const list = await api.listTemplates(subjectId);
        if (cancelled) return;
        setTemplates(list);
        if (initialTemplateId) {
          const template = list.find((item) => item.id === initialTemplateId);
          if (template?.canStart) {
            setSelectedTemplate(template);
            const active = await api.getActiveAttempt(initialTemplateId);
            if (cancelled) return;
            if (active) {
              syncPhaseFromAttempt(active);
              if (active.phase === "review") {
                await loadReview(active.id);
              } else if (active.phase === "in_section") {
                await loadQuestion(active.id);
              } else if (active.status === "completed") {
                const result = await api.getResults(active.id);
                if (!cancelled) setResults(result);
              }
            } else {
              setPhase("briefing");
            }
            return;
          }
        }
        setPhase("list");
      } catch (err) {
        if (!cancelled) {
          toast({
            title: "Không thể tải đề thi thử",
            description: getApiErrorMessage(err, "Vui lòng thử lại."),
            variant: "destructive",
          });
          setPhase("list");
        }
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [api, subjectId, initialTemplateId, syncPhaseFromAttempt, loadQuestion, loadReview]);

  useEffect(() => {
    if (phase !== "review" || !attempt) return;
    void loadReview(attempt.id);
  }, [phase, attempt, loadReview]);

  useEffect(() => {
    onActiveExamChange?.(phase === "section" || phase === "review");
  }, [phase, onActiveExamChange]);

  useEffect(() => {
    skipAutoSaveRef.current = true;
  }, [question?.id]);

  useEffect(() => {
    if (phase !== "section" || !attempt || !question || reviewQuestionId) return undefined;
    if (skipAutoSaveRef.current) {
      skipAutoSaveRef.current = false;
      return undefined;
    }
    if (selectedKeys.length === 0) return undefined;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      void api
        .saveAnswer(attempt.id, {
          questionId: question.id,
          selectedKeys,
        })
        .catch(() => {
          // Auto-save is best-effort; explicit save still available.
        });
    }, 800);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [api, attempt, phase, question, reviewQuestionId, selectedKeys]);

  const currentTemplateMeta = useMemo(() => {
    if (!attempt) return selectedTemplate;
    return templates.find((item) => item.id === attempt.templateId) ?? selectedTemplate;
  }, [attempt, selectedTemplate, templates]);

  const isLastInSection = useMemo(() => {
    if (!attempt || !question) return false;
    const section = attempt.sections[attempt.currentSectionIndex];
    if (!section) return false;
    return question.questionIndex >= section.questionCount - 1;
  }, [attempt, question]);

  async function handleSelectTemplate(templateId: string) {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setSelectedTemplate(template);
    try {
      const active = await api.getActiveAttempt(templateId);
      if (active) {
        syncPhaseFromAttempt(active);
        if (active.phase === "review") {
          await loadReview(active.id);
        } else if (active.phase === "in_section") {
          await loadQuestion(active.id);
        }
        return;
      }
      setPhase("briefing");
    } catch (err) {
      toast({
        title: "Không thể mở đề thi",
        description: getApiErrorMessage(err, "Vui lòng thử lại."),
        variant: "destructive",
      });
    }
  }

  async function handleStart() {
    if (!selectedTemplate) return;
    setStarting(true);
    try {
      const started = await api.startAttempt(selectedTemplate.id);
      syncPhaseFromAttempt(started);
      await loadQuestion(started.id);
    } catch (err) {
      toast({
        title: "Không thể bắt đầu thi",
        description: getApiErrorMessage(err, "Vui lòng thử lại."),
        variant: "destructive",
      });
    } finally {
      setStarting(false);
    }
  }

  async function handleSaveAndNext() {
    if (!attempt || !question) return;
    setSaving(true);
    try {
      const { attempt: updated } = await api.saveAnswer(attempt.id, {
        questionId: question.id,
        selectedKeys,
      });
      setAttempt(updated);
      if (isLastInSection) return;
      await loadQuestion(updated.id);
      toast({ title: "Đã lưu câu trả lời." });
    } catch (err) {
      toast({
        title: "Không thể lưu câu trả lời",
        description: getApiErrorMessage(err, "Vui lòng thử lại."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleFinishSection() {
    if (!attempt || !question) return;
    setSaving(true);
    try {
      await api.saveAnswer(attempt.id, {
        questionId: question.id,
        selectedKeys,
      });
      const updated = await api.advanceSection(attempt.id);
      syncPhaseFromAttempt(updated);
      if (updated.phase === "review") {
        await loadReview(updated.id);
      } else {
        await loadQuestion(updated.id);
      }
    } catch (err) {
      toast({
        title: "Không thể chuyển phần thi",
        description: getApiErrorMessage(err, "Vui lòng thử lại."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveReviewAnswer() {
    if (!attempt || !question) return;
    setSaving(true);
    try {
      const { attempt: updated } = await api.saveAnswer(attempt.id, {
        questionId: question.id,
        selectedKeys,
      });
      setAttempt(updated);
      await loadReview(updated.id);
      setReviewQuestionId(null);
      setPhase("review");
      toast({ title: "Đã lưu câu trả lời." });
    } catch (err) {
      toast({
        title: "Không thể lưu câu trả lời",
        description: getApiErrorMessage(err, "Vui lòng thử lại."),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleTimerExpire() {
    if (!attempt) return;
    try {
      await saveCurrentAnswerIfAny();
      const updated = await api.advanceSection(attempt.id);
      syncPhaseFromAttempt(updated);
      toast({ title: "Hết thời gian phần thi", description: "Đã chuyển sang phần tiếp theo." });
      if (updated.phase === "review") {
        await loadReview(updated.id);
      } else {
        await loadQuestion(updated.id);
      }
    } catch {
      const refreshed = await api.getAttempt(attempt.id);
      syncPhaseFromAttempt(refreshed);
      if (refreshed.phase === "review") {
        await loadReview(refreshed.id);
      }
    }
  }

  async function handleJumpToQuestion(questionId: string) {
    if (!attempt) return;
    try {
      setReviewQuestionId(questionId);
      const loaded = await loadQuestion(attempt.id, questionId);
      if (!loaded) {
        setReviewQuestionId(null);
        setPhase("review");
        toast({
          title: "Không thể mở câu hỏi",
          description: "Câu hỏi không còn khả dụng.",
          variant: "destructive",
        });
        return;
      }
      setPhase("section");
    } catch (err) {
      setReviewQuestionId(null);
      setPhase("review");
      toast({
        title: "Không thể mở câu hỏi",
        description: getApiErrorMessage(err, "Vui lòng thử lại."),
        variant: "destructive",
      });
    }
  }

  async function handleSubmit() {
    if (!attempt) return;
    setSubmitting(true);
    try {
      const result = await api.submitAttempt(attempt.id);
      setResults(result);
      setConfirmSubmitOpen(false);
      setPhase("results");
    } catch (err) {
      toast({
        title: "Không thể nộp bài",
        description: getApiErrorMessage(err, "Vui lòng thử lại."),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTimerSync() {
    if (!attempt) return null;
    const refreshed = await api.getAttempt(attempt.id);
    syncPhaseFromAttempt(refreshed);
    if (refreshed.phase === "review") {
      await loadReview(refreshed.id);
    } else if (refreshed.phase === "in_section") {
      await loadQuestion(refreshed.id);
    }
    return refreshed.sectionRemainingMs;
  }

  async function handleReviewQuestions() {
    if (!attempt) return;
    const result = await api.getResults(attempt.id);
    setResults(result);
    setQuestionReviewIndex(0);
    setPhase("question-review");
  }

  function handleToggleOption(key: string) {
    if (!question) return;
    if (question.questionType === "multiple_choice") {
      setSelectedKeys((prev) =>
        prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
      );
      return;
    }
    setSelectedKeys([key]);
  }

  if (phase === "loading") {
    return (
      <div className={className}>
        <CatalogSkeleton count={2} />
      </div>
    );
  }

  return (
    <div className={className}>
      {phase === "list" && (
        <div className="space-y-4">
          <div>
            <h1 className="text-headline font-semibold text-ink">Thi thử — {subjectName}</h1>
            <p className="mt-2 text-sm text-ink-muted">Chọn đề thi thử để xem chi tiết và bắt đầu.</p>
          </div>
          <MockExamTemplateList
            templates={templates}
            onSelect={handleSelectTemplate}
            subjectNamesById={enrichedSubjectNamesById}
            screenId={screenIds?.list ?? "W-30"}
          />
          <Button type="button" variant="outline" onClick={onBack}>
            Quay lại
          </Button>
        </div>
      )}

      {phase === "briefing" && attempt && currentTemplateMeta && (
        <MockExamBriefing
          attempt={attempt}
          attemptsRemaining={currentTemplateMeta.attempts.remaining}
          attemptsLimit={currentTemplateMeta.attempts.limit}
          onStart={handleStart}
          onBack={() => setPhase("list")}
          loading={starting}
          screenId={screenIds?.briefing ?? "W-31"}
        />
      )}

      {phase === "briefing" && !attempt && selectedTemplate && (
        <MockExamBriefing
          attempt={{
            id: "",
            templateId: selectedTemplate.id,
            templateName: selectedTemplate.name,
            subjectId: selectedTemplate.subjectId,
            status: "in_progress",
            phase: "in_section",
            passingScorePercent: selectedTemplate.passingScorePercent,
            totalDurationMinutes: selectedTemplate.totalDurationMinutes,
            totalQuestions: selectedTemplate.totalQuestions,
            currentSectionIndex: 0,
            currentQuestionIndex: 0,
            sectionCount: selectedTemplate.sections.length,
            sectionRemainingMs: null,
            sections: selectedTemplate.sections.map((section, sectionIndex) => ({
              sectionIndex,
              ...section,
            })),
            startedAt: new Date().toISOString(),
            completedAt: null,
          }}
          attemptsRemaining={selectedTemplate.attempts.remaining}
          attemptsLimit={selectedTemplate.attempts.limit}
          onStart={handleStart}
          onBack={() => setPhase("list")}
          loading={starting}
          screenId={screenIds?.briefing ?? "W-31"}
        />
      )}

      {(phase === "section" || reviewQuestionId) && attempt && question && (
        <>
          {attempt.phase === "in_section" && !reviewQuestionId && (
            <MockExamTimerBar
              remainingMs={attempt.sectionRemainingMs}
              onExpire={() => void handleTimerExpire()}
              onSync={() => handleTimerSync()}
              screenId={screenIds?.section ?? "W-32"}
            />
          )}
          <div className="mt-6">
            <MockExamSectionQuestion
              question={question}
              sectionLabel={`Phần ${question.sectionIndex + 1}`}
              selectedKeys={selectedKeys}
              onToggleOption={handleToggleOption}
              onSaveAndNext={async () => {
                if (reviewQuestionId) {
                  await handleSaveReviewAnswer();
                  return;
                }
                await handleSaveAndNext();
              }}
              onFinishSection={async () => {
                if (reviewQuestionId) {
                  await handleSaveReviewAnswer();
                  return;
                }
                await handleFinishSection();
              }}
              isLastInSection={reviewQuestionId ? true : isLastInSection}
              saving={saving}
              onExit={() => setExitConfirmOpen(true)}
              screenId={screenIds?.section ?? "W-32"}
            />
          </div>
        </>
      )}

      {phase === "review" && attempt && (
        <MockExamReviewGrid
          items={reviewItems}
          sectionCount={attempt.sectionCount}
          onJumpToQuestion={(questionId) => void handleJumpToQuestion(questionId)}
          onSubmit={() => void handleSubmit()}
          submitting={submitting}
          confirmOpen={confirmSubmitOpen}
          onConfirmOpenChange={setConfirmSubmitOpen}
          screenId={screenIds?.review ?? "W-33"}
        />
      )}

      {phase === "results" && results && (
        <MockExamResultsScreen
          results={results}
          onReviewQuestions={() => void handleReviewQuestions()}
          onDone={onDone}
          screenId={screenIds?.results ?? "W-34"}
        />
      )}

      {phase === "question-review" && results?.questionReviews && (
        <MockExamQuestionReviewScreen
          reviews={results.questionReviews}
          currentIndex={questionReviewIndex}
          onChangeIndex={setQuestionReviewIndex}
          onBack={() => setPhase("results")}
          screenId={screenIds?.questionReview ?? "W-35"}
        />
      )}

      <Dialog open={exitConfirmOpen} onOpenChange={setExitConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thoát bài thi?</DialogTitle>
            <DialogDescription>
              Tiến độ hiện tại đã được lưu. Bạn có thể quay lại tiếp tục sau.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setExitConfirmOpen(false)}>
              Ở lại
            </Button>
            <Button
              type="button"
              onClick={() => {
                void (async () => {
                  setExitConfirmOpen(false);
                  try {
                    await saveCurrentAnswerIfAny();
                  } catch (err) {
                    toast({
                      title: "Không thể lưu câu trả lời",
                      description: getApiErrorMessage(err, "Vui lòng thử lại."),
                      variant: "destructive",
                    });
                    return;
                  }
                  onBack();
                })();
              }}
            >
              Thoát
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
