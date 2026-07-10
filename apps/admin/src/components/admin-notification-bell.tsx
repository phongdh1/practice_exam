"use client";

import { adminApi } from "@/lib/admin-api";
import { ADMIN_NOTIFICATIONS_POLL_MS, queryKeys } from "@practice-exam/api-client";
import type { AdminNotificationItem } from "@practice-exam/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

const LAST_SEEN_KEY = "admin_notifications_last_seen";

function getLastSeen(): string {
  if (typeof window === "undefined") {
    return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  }
  return (
    localStorage.getItem(LAST_SEEN_KEY) ??
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  );
}

function formatNotificationDetail(item: AdminNotificationItem): string {
  if (item.type === "registration") {
    return item.metadata?.userDisplayName ?? item.metadata?.userId ?? "Người dùng mới";
  }
  const amount = item.metadata?.amountVnd?.toLocaleString("vi-VN");
  const subject = item.metadata?.subjectName;
  if (amount && subject) return `${amount} ₫ · ${subject}`;
  if (amount) return `${amount} ₫`;
  return item.metadata?.userDisplayName ?? "Thanh toán mới";
}

export function AdminNotificationBell() {
  const [lastSeen, setLastSeen] = useState(getLastSeen);
  const [open, setOpen] = useState(false);

  const sinceForQuery = useMemo(
    () => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    [],
  );

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.notifications.recent(sinceForQuery),
    queryFn: () => adminApi.adminListRecentNotifications(sinceForQuery),
    refetchInterval: ADMIN_NOTIFICATIONS_POLL_MS,
  });

  const items = data?.data?.items ?? [];
  const unreadCount = items.filter((item) => item.occurredAt > lastSeen).length;

  const markSeen = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem(LAST_SEEN_KEY, now);
    setLastSeen(now);
  }, []);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) markSeen();
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-primary hover:bg-surface-container-low"
          aria-label="Thông báo admin"
        >
          <Bell className="h-5 w-5" aria-hidden />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Hoạt động gần đây</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading && (
          <p className="px-2 py-3 text-body-sm text-ink-muted">Đang tải thông báo...</p>
        )}
        {!isLoading && items.length === 0 && (
          <p className="px-2 py-3 text-body-sm text-ink-muted">Không có hoạt động mới.</p>
        )}
        {items.map((item) => (
          <DropdownMenuItem key={item.id} asChild>
            <Link href={item.href} className="flex flex-col items-start gap-0.5">
              <span className="font-medium">{item.title}</span>
              <span className="text-label text-ink-muted">{formatNotificationDetail(item)}</span>
              <span className="text-label text-ink-muted">
                {new Date(item.occurredAt).toLocaleString("vi-VN")}
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
