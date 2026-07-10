"use client";

import type { SubjectPerformanceSummary } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { InternalLink } from "./internal-link";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export interface SubjectPerformanceCardProps {
  summary: SubjectPerformanceSummary;
  onPractice?: (subjectId: string) => void;
  screenId?: "W-40" | "Z-40";
  className?: string;
}

export function SubjectPerformanceCard({
  summary,
  onPractice,
  screenId = "W-40",
  className,
}: SubjectPerformanceCardProps) {
  if (!summary.hasAttempts) {
    return (
      <Card className={className} data-screen={screenId}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{summary.subjectName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-ink-muted">Chưa có dữ liệu trong khoảng thời gian này.</p>
          {onPractice ? (
            <Button type="button" variant="outline" size="sm" onClick={() => onPractice(summary.subjectId)}>
              Bắt đầu luyện tập
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm">
              <InternalLink href={`/subjects/${summary.subjectId}`}>Bắt đầu luyện tập</InternalLink>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} data-screen={screenId}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{summary.subjectName}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-ink-muted">Câu đã làm</dt>
            <dd className="font-semibold text-primary">{summary.questionsAttempted}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Tỷ lệ đúng</dt>
            <dd className="font-semibold text-primary">{summary.correctnessRate}%</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Thi thử</dt>
            <dd className="font-semibold text-primary">{summary.mockAttemptsCount}</dd>
          </div>
          <div>
            <dt className="text-ink-muted">Điểm TB thi thử</dt>
            <dd className="font-semibold text-primary">
              {summary.averageMockScore !== null ? `${summary.averageMockScore}%` : "—"}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

export interface ProgressDashboardProps {
  summaries: SubjectPerformanceSummary[];
  days: 30 | 90;
  onDaysChange: (days: 30 | 90) => void;
  onPractice?: (subjectId: string) => void;
  historyHref?: string;
  screenId?: "W-40" | "Z-40";
  className?: string;
}

export function ProgressDashboard({
  summaries,
  days,
  onDaysChange,
  onPractice,
  historyHref = "/progress/history",
  screenId = "W-40",
  className,
}: ProgressDashboardProps) {
  return (
    <div className={cn("space-y-6", className)} data-screen={screenId}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display-sm font-heading text-primary">Tiến độ học tập</h1>
          <p className="mt-1 text-body-sm text-ink-muted">Theo dõi kết quả luyện tập và thi thử theo môn.</p>
        </div>
        <Button asChild variant="outline">
          <InternalLink href={historyHref}>Xem lịch sử đầy đủ</InternalLink>
        </Button>
      </div>

      <Tabs
        value={String(days)}
        onValueChange={(value) => onDaysChange(value === "90" ? 90 : 30)}
      >
        <TabsList aria-label="Khoảng thời gian thống kê">
          <TabsTrigger value="30">30 ngày</TabsTrigger>
          <TabsTrigger value="90">90 ngày</TabsTrigger>
        </TabsList>
        <TabsContent value={String(days)} className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {summaries.map((summary) => (
              <SubjectPerformanceCard
                key={summary.subjectId}
                summary={summary}
                onPractice={onPractice}
                screenId={screenId}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
