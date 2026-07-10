"use client";

import type { AttemptHistoryItem } from "@practice-exam/types";
import { cn } from "../lib/utils";
import { InternalLink } from "./internal-link";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { MaterialIcon } from "./material-icon";

export interface AttemptHistoryListProps {
  items: AttemptHistoryItem[];
  onItemClick?: (item: AttemptHistoryItem) => void;
  getItemHref?: (item: AttemptHistoryItem) => string;
  screenId?: "W-41" | "Z-41";
  className?: string;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function AttemptHistoryList({
  items,
  onItemClick,
  getItemHref,
  screenId = "W-41",
  className,
}: AttemptHistoryListProps) {
  if (items.length === 0) {
    return (
      <div
        className={cn("mx-auto max-w-lg rounded-xl border border-outline-variant p-8 text-center", className)}
        data-screen={screenId}
      >
        <MaterialIcon name="history" size={48} className="mx-auto text-ink-muted" />
        <h2 className="mt-4 text-display-sm font-heading text-primary">Chưa có lịch sử</h2>
        <p className="mt-2 text-body-sm text-ink-muted">
          Bạn chưa hoàn thành phiên luyện tập hoặc thi thử nào.
        </p>
        <Button asChild className="mt-6">
          <InternalLink href="/">Bắt đầu luyện tập</InternalLink>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)} data-screen={screenId}>
      {items.map((item) => {
        const content = (
          <Card className="transition-colors hover:bg-surface-container-low">
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  item.type === "mock" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary",
                )}
              >
                <MaterialIcon
                  name={item.type === "mock" ? "assignment" : "quiz"}
                  size={20}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{item.label}</p>
                <p className="text-sm text-ink-muted">
                  {item.subjectName} · {formatDate(item.date)}
                </p>
              </div>
              {item.scorePercent !== null && (
                <p className="text-lg font-semibold text-primary">{item.scorePercent}%</p>
              )}
              <MaterialIcon name="chevron_right" size={20} className="text-ink-muted" />
            </CardContent>
          </Card>
        );

        if (onItemClick) {
          return (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              className="w-full text-left"
              onClick={() => onItemClick(item)}
            >
              {content}
            </button>
          );
        }

        const href = getItemHref?.(item) ?? `/progress/history/${item.type}/${item.id}`;
        return (
          <InternalLink key={`${item.type}-${item.id}`} href={href} className="block">
            {content}
          </InternalLink>
        );
      })}
    </div>
  );
}
