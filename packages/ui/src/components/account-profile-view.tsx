"use client";

import type { AttemptHistoryItem, AuthIdentityLinkedView, SubscriptionSummary } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { InternalLink } from "./internal-link";
import { MaterialIcon } from "./material-icon";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export interface AccountProfileUser {
  displayName: string | null;
  avatarUrl: string | null;
  email?: string;
  identities: AuthIdentityLinkedView[];
}

export interface AccountProfileViewProps {
  user: AccountProfileUser;
  subscriptions: SubscriptionSummary[];
  attempts: AttemptHistoryItem[];
  renewHref: string;
  disclaimerText?: string;
  className?: string;
}

function formatExpiryDate(iso: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

function formatAttemptDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Hôm nay, ${new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)}`;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isZaloLinked(identities: AuthIdentityLinkedView[]): boolean {
  return identities.some((identity) => identity.provider === "zalo");
}

function subscriptionBorderClass(status: SubscriptionSummary["status"]): string {
  if (status === "expiring") return "border-warning";
  if (status === "active") return "border-success";
  return "border-outline-variant";
}

function scoreBadgeClass(scorePercent: number | null): string {
  if (scorePercent === null) return "bg-surface-container text-on-surface-variant";
  if (scorePercent >= 70) return "bg-success-muted text-success";
  return "bg-error-muted text-error";
}

function getAttemptHref(item: AttemptHistoryItem): string {
  return `/progress/history/${item.type}/${item.id}`;
}

export function AccountProfileView({
  user,
  subscriptions,
  attempts,
  renewHref,
  disclaimerText,
  className,
}: AccountProfileViewProps) {
  const displayName = user.displayName ?? "Học viên";
  const hasEmail = Boolean(user.email);
  const zaloLinked = isZaloLinked(user.identities);
  const activeSubscriptions = subscriptions.filter((sub) => sub.status !== "expired");
  const visibleSubscriptions = activeSubscriptions.length > 0 ? activeSubscriptions : subscriptions;

  return (
    <div
      className={cn("grid grid-cols-1 gap-6 lg:grid-cols-12", className)}
      data-screen="W-50"
      data-component="account-profile"
    >
      <div className="space-y-6 lg:col-span-4">
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Avatar className="mb-4 h-24 w-24 ring-4 ring-primary-fixed">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt="" />
              ) : (
                <AvatarFallback className="bg-surface-container text-primary">
                  <MaterialIcon name="person" size={40} />
                </AvatarFallback>
              )}
            </Avatar>
            <h2 className="text-display-sm font-heading text-primary">{displayName}</h2>
            {user.email && <p className="mt-1 text-body text-ink-muted">{user.email}</p>}
            {hasEmail && (
              <div className="mt-4 flex items-center gap-2 rounded-full bg-success-muted px-3 py-1">
                <MaterialIcon name="verified" size={16} className="text-success" filled />
                <span className="text-label font-medium text-success">Đã xác thực</span>
              </div>
            )}
          </div>
          <div className="mt-8 border-t border-outline-variant pt-6">
            <div className="flex items-center justify-between">
              <span className="text-label text-on-surface-variant">Zalo ID</span>
              <span
                className={cn(
                  "text-label",
                  zaloLinked ? "font-medium text-success" : "italic text-ink-disabled",
                )}
              >
                {zaloLinked ? "Đã liên kết" : "Chưa liên kết"}
              </span>
            </div>
          </div>
        </section>

        {!zaloLinked && (
          <section className="relative overflow-hidden rounded-xl bg-primary p-6 shadow-lg transition-transform hover:scale-[1.01]">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-on-primary-fixed-variant opacity-20 blur-2xl" />
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-on-primary">
                  <MaterialIcon name="sync_alt" size={20} className="text-primary" />
                </div>
                <h3 className="text-heading font-heading text-on-primary">Liên kết Zalo</h3>
              </div>
              <p className="mb-6 text-body-sm text-on-primary/90">
                Đồng bộ lịch học, nhận thông báo nhắc hẹn thi và kết quả luyện tập trực tiếp qua Zalo
                OA.
              </p>
              <InternalLink
                href="/account/link/zalo"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-on-primary py-3 text-label font-bold text-primary transition-colors hover:bg-primary-fixed"
              >
                Liên kết tài khoản
                <MaterialIcon name="arrow_forward" size={16} />
              </InternalLink>
            </div>
          </section>
        )}
      </div>

      <div className="space-y-6 lg:col-span-8">
        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-display-sm font-heading text-primary">Gói đăng ký của tôi</h3>
            <InternalLink href={renewHref} className="text-label text-primary hover:underline">
              Gia hạn ngay
            </InternalLink>
          </div>
          {visibleSubscriptions.length === 0 ? (
            <p className="text-body-sm text-ink-muted">Chưa có gói đăng ký.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {visibleSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className={cn(
                    "rounded-lg border-l-4 bg-surface-subtle p-4",
                    subscriptionBorderClass(sub.status),
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="text-heading font-heading text-on-surface">
                      {sub.subjectName ?? "Môn học"}
                    </span>
                    <MaterialIcon
                      name={sub.status === "expiring" ? "schedule" : "check_circle"}
                      size={20}
                      className={sub.status === "expiring" ? "text-warning" : "text-success"}
                      filled={sub.status !== "expiring"}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <MaterialIcon name="event" size={16} />
                    <span
                      className={cn(
                        "text-caption",
                        sub.status === "expiring" && "font-bold text-warning",
                      )}
                    >
                      Hết hạn: {formatExpiryDate(sub.periodEnd)}
                      {sub.status === "expiring" ? " (Sắp tới)" : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-display-sm font-heading text-primary">Lịch sử làm bài gần đây</h3>
            <InternalLink href="/progress/history" aria-label="Xem toàn bộ lịch sử">
              <MaterialIcon name="history" size={24} className="text-ink-muted" />
            </InternalLink>
          </div>
          {attempts.length === 0 ? (
            <div className="text-center">
              <p className="text-body-sm text-ink-muted">Chưa có lịch sử luyện tập.</p>
              <InternalLink
                href="/progress/history"
                className="mt-2 inline-block text-label text-primary hover:underline"
              >
                Xem tiến độ
              </InternalLink>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="py-3 text-label text-ink-muted">Môn học</th>
                    <th className="py-3 text-label text-ink-muted">Ngày</th>
                    <th className="py-3 text-right text-label text-ink-muted">Kết quả</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm">
                  {attempts.map((item) => (
                    <tr
                      key={`${item.type}-${item.id}`}
                      className="border-b border-outline-variant/50 transition-colors hover:bg-surface-subtle"
                    >
                      <td className="py-4">
                        <InternalLink
                          href={getAttemptHref(item)}
                          className="font-medium text-on-surface hover:text-primary"
                        >
                          {item.subjectName}
                        </InternalLink>
                      </td>
                      <td className="py-4 text-on-surface-variant">{formatAttemptDate(item.date)}</td>
                      <td className="py-4 text-right">
                        <span
                          className={cn(
                            "inline-block rounded-full px-3 py-1 font-bold",
                            scoreBadgeClass(item.scorePercent),
                          )}
                        >
                          {item.scorePercent !== null ? `${item.scorePercent}%` : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <h4 className="mb-4 text-heading font-heading text-primary">Cài đặt bảo mật</h4>
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MaterialIcon name="policy" size={20} className="text-ink-muted" />
                  <span className="text-body text-on-surface">Chính sách bảo mật</span>
                </div>
                <MaterialIcon name="chevron_right" size={20} className="text-ink-disabled" />
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MaterialIcon name="download" size={20} className="text-ink-muted" />
                  <span className="text-body text-on-surface">Xuất dữ liệu học tập</span>
                </div>
                <MaterialIcon name="chevron_right" size={20} className="text-ink-disabled" />
              </li>
            </ul>
            <p className="mt-4 text-caption text-ink-muted">
              Để xuất dữ liệu học tập, vui lòng liên hệ hỗ trợ qua email được cung cấp trong chính
              sách bảo mật.
            </p>
          </div>
          <div className="rounded-xl border border-disclaimer-border bg-warning-muted p-6">
            <div className="flex items-start gap-3">
              <MaterialIcon name="info" size={24} className="shrink-0 text-warning" />
              <div>
                <h4 className="mb-2 text-heading font-heading text-warning">Miễn trừ trách nhiệm</h4>
                <p className="text-caption text-secondary">
                  {disclaimerText ??
                    "Hệ thống cung cấp nội dung luyện tập dựa trên giáo trình chính thống. Chúng tôi không đảm bảo kết quả thi tại UBCKNN."}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
