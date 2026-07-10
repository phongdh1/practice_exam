import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

const PULL_THRESHOLD_PX = 72;

export interface PullToRefreshProps {
  onRefresh: () => Promise<unknown> | unknown;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  disabled = false,
}: PullToRefreshProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const startY = React.useRef(0);
  const pulling = React.useRef(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);

  const atScrollTop = () => {
    const el = containerRef.current;
    if (!el) return true;
    return el.scrollTop <= 0;
  };

  const runRefresh = async () => {
    if (disabled || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || refreshing || !atScrollTop()) return;
    startY.current = e.touches[0]?.clientY ?? 0;
    pulling.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling.current || disabled || refreshing) return;
    const currentY = e.touches[0]?.clientY ?? 0;
    const delta = Math.max(0, currentY - startY.current);
    if (delta > 0 && atScrollTop()) {
      setPullDistance(Math.min(delta, PULL_THRESHOLD_PX * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance >= PULL_THRESHOLD_PX && !disabled && !refreshing) {
      await runRefresh();
    }
    setPullDistance(0);
  };

  const ready = pullDistance >= PULL_THRESHOLD_PX;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-y-auto", className)}
      data-component="pull-to-refresh"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => void handleTouchEnd()}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center transition-transform"
        style={{ transform: `translateY(${Math.max(0, pullDistance - 32)}px)` }}
        aria-hidden={!refreshing && pullDistance === 0}
      >
        <span className="rounded-full bg-surface-elevated px-3 py-1 text-xs text-ink-muted shadow-sm">
          {refreshing ? "Đang làm mới..." : ready ? "Thả để làm mới" : "Kéo để làm mới"}
        </span>
      </div>
      <div className="absolute right-4 top-4 z-20">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void runRefresh()}
          disabled={disabled || refreshing}
          className="bg-surface-elevated text-ink-muted shadow-sm hover:bg-surface"
          data-action="refresh-catalog"
          aria-label="Làm mới danh mục"
        >
          {refreshing ? "Đang làm mới..." : "Làm mới"}
        </Button>
      </div>
      {children}
    </div>
  );
}
