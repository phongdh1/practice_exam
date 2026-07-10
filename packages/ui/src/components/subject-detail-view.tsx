import type { FreeTierStatus, StudyTierStatus, SubjectCatalogItem } from "@practice-exam/types";
import {
  formatFreeTierMeter,
  formatMonthlyPriceVnd,
  type SubjectSubscriptionView,
} from "@practice-exam/utils";
import { cn } from "../lib/utils";
import { MaterialIcon } from "./material-icon";
import { StudyMeterBadge } from "./study-meter-badge";
import {
  resolveHasSubscription,
  resolveSubjectDetailMeterVisibility,
} from "./subject-detail-display";

export interface SubjectDetailViewProps {
  subject: SubjectCatalogItem;
  subscription?: SubjectSubscriptionView | null;
  freeTierUsed?: number;
  freeTierStatus?: FreeTierStatus | null;
  studyTierStatus?: StudyTierStatus | null;
  onStudy?: () => void;
  onPractice?: () => void;
  onMockExam?: () => void;
  onSubscribe?: () => void;
  screenId?: "Z-11" | "W-11";
  className?: string;
}

function freeTierProgress(used: number, limit: number) {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

/** Stitch W-11 / Z-11 bento subject detail */
export function SubjectDetailView({
  subject,
  subscription,
  freeTierUsed = 0,
  freeTierStatus,
  studyTierStatus,
  onStudy,
  onPractice,
  onMockExam,
  onSubscribe,
  screenId = "W-11",
  className,
}: SubjectDetailViewProps) {
  const used = freeTierStatus?.used ?? freeTierUsed;
  const limit = subject.freeTierLimit;
  const isAtLimit = freeTierStatus?.isAtLimit ?? used >= limit;
  const hasSubscription = resolveHasSubscription({ freeTierStatus, subscription });
  const { showFreeTierSection, showStudyMeter } = resolveSubjectDetailMeterVisibility({
    hasSubscription,
    studyTierStatus,
  });
  const progress = freeTierProgress(used, limit);

  return (
    <article
      className={cn("grid grid-cols-1 gap-8 md:grid-cols-12", className)}
      data-component="subject-detail"
      data-screen={screenId}
    >
      <div className="space-y-8 md:col-span-8">
        <header className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-caption text-primary">
            <MaterialIcon name="school" size={16} />
            <span>Môn học CNVCK</span>
          </div>
          <h1 className="text-display-lg text-primary">{subject.name}</h1>
          <p className="mt-4 text-2xl font-bold text-price-highlight">
            {formatMonthlyPriceVnd(subject.monthlyPriceVnd)}
          </p>
          {subject.description && (
            <p className="mt-4 text-body text-on-surface-variant">{subject.description}</p>
          )}
          {hasSubscription ? (
            <span
              className={cn(
                "mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm",
                subscription?.status === "expiring"
                  ? "bg-warning-muted text-warning"
                  : "bg-success-muted text-subscription-active",
              )}
              data-subscription-status={subscription?.status ?? "active"}
            >
              <MaterialIcon name="verified" size={16} filled />
              {subscription?.status === "expiring" ? "Sắp hết hạn" : "Đang hoạt động"}
              {subscription?.expiresAt
                ? ` — ${new Intl.DateTimeFormat("vi-VN", {
                    timeZone: "Asia/Ho_Chi_Minh",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }).format(new Date(subscription.expiresAt))}`
                : ""}
            </span>
          ) : null}
        </header>

        {showFreeTierSection && (
          <section className="rounded-xl border-2 border-dashed border-outline-variant bg-surface-subtle p-8">
            <div className="flex flex-col gap-6">
              <div className="flex-1">
                <h3 className="mb-2 flex items-center gap-2 text-heading font-heading text-primary">
                  <MaterialIcon name="analytics" size={20} />
                  Hạn mức miễn phí
                </h3>
                <p className="mb-4 text-body text-on-surface-variant">
                  {formatFreeTierMeter(used, limit)}
                </p>
                <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-primary-container transition-all duration-1000"
                    style={{ width: `${Math.max(progress, 2)}%` }}
                  />
                </div>
                {showStudyMeter && studyTierStatus && (
                  <StudyMeterBadge studyTier={studyTierStatus} />
                )}
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={onStudy}
            disabled={!onStudy}
            className="rounded-lg border border-primary px-6 py-3 font-heading text-primary transition-all hover:bg-primary/5 disabled:opacity-50"
            data-action="study"
          >
            Xem tất cả câu hỏi
          </button>
          <button
            type="button"
            onClick={onPractice}
            disabled={!onPractice}
            className="rounded-lg bg-primary px-8 py-3 font-heading text-on-primary shadow-md transition-all hover:opacity-90 disabled:opacity-50"
            data-action="practice"
          >
            Luyện tập
          </button>
          <button
            type="button"
            onClick={onMockExam}
            disabled={!onMockExam}
            className="rounded-lg border border-outline-variant bg-surface-container-low px-6 py-3 font-heading text-primary transition-all hover:bg-surface-container disabled:opacity-50"
            data-action="mock-exam-cta"
          >
            Thi thử
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 card-hover">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <MaterialIcon name="menu_book" className="text-primary" />
            </div>
            <h4 className="mb-2 text-heading font-heading text-primary">Chương trình chuẩn</h4>
            <p className="text-caption text-ink-muted">
              Bám sát khung nội dung thi của Ủy ban Chứng khoán Nhà nước (UBCKNN).
            </p>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 card-hover">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <MaterialIcon name="quiz" className="text-success" />
            </div>
            <h4 className="mb-2 text-heading font-heading text-primary">Ngân hàng câu hỏi</h4>
            <p className="text-caption text-ink-muted">
              Câu hỏi trắc nghiệm có giải thích chi tiết đáp án và căn cứ pháp lý.
            </p>
          </div>
        </div>
      </div>

      <aside className="space-y-6 md:col-span-4">
        <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low p-8 card-hover">
          <MaterialIcon
            name="lock"
            className="absolute right-4 top-4 text-8xl text-primary opacity-10"
          />
          <h3 className="mb-4 flex items-center gap-2 text-heading font-heading text-primary">
            <MaterialIcon name="timer" size={20} />
            Thi thử Mock Exam
          </h3>
          <p className="mb-6 text-body-sm leading-relaxed text-on-surface-variant">
            Trải nghiệm áp lực phòng thi thật với bộ đề chuẩn thời gian. Tự động chấm điểm và phân
            tích kết quả.
          </p>
          <button
            type="button"
            onClick={onMockExam}
            disabled={!hasSubscription || !onMockExam}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg py-3 font-heading transition-all",
              hasSubscription
                ? "bg-primary text-on-primary hover:opacity-90"
                : "cursor-not-allowed border border-secondary/30 bg-secondary/20 text-secondary",
            )}
            data-action="mock-exam"
          >
            <MaterialIcon name={hasSubscription ? "play_arrow" : "lock"} size={20} />
            {hasSubscription ? "Bắt đầu thi thử" : "Mở khóa bằng Gói Pro"}
          </button>
          {!hasSubscription && (
            <p className="mt-3 text-center text-[11px] italic text-ink-muted">
              Yêu cầu đăng ký gói thành viên để truy cập
            </p>
          )}
        </div>

        {!hasSubscription && onSubscribe && (
          <button
            type="button"
            onClick={onSubscribe}
            className="w-full rounded-lg bg-primary-container py-3 font-heading text-on-primary shadow-sm transition-all hover:opacity-90"
            data-action="subscribe"
          >
            Đăng ký — {formatMonthlyPriceVnd(subject.monthlyPriceVnd)}
          </button>
        )}

        {hasSubscription && subscription?.status === "expiring" && onSubscribe && (
          <button
            type="button"
            onClick={onSubscribe}
            className="w-full rounded-lg border border-warning py-3 text-sm font-medium text-warning"
            data-action="renew"
          >
            Gia hạn ngay
          </button>
        )}

        <div className="rounded-xl border border-disclaimer-border bg-disclaimer-bg p-5">
          <div className="flex gap-3">
            <MaterialIcon name="warning" className="text-warning" size={20} />
            <p className="text-caption leading-relaxed text-on-surface">
              <strong>Lưu ý:</strong> Nội dung học tập không trực thuộc UBCKNN. Luôn kiểm tra văn
              bản mới nhất từ Cổng thông tin điện tử UBCKNN.
            </p>
          </div>
        </div>
      </aside>

      {showFreeTierSection && isAtLimit && (
        <p className="md:col-span-12 text-sm text-warning" role="status">
          Bạn đã dùng hết lượt miễn phí tháng này. Đăng ký để tiếp tục luyện tập.
        </p>
      )}
    </article>
  );
}
