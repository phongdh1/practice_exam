"use client";

import { useEffect, useRef, useState } from "react";
import { handleServerTimerSyncExpiry } from "../lib/mock-exam-timer-sync";
import { cn } from "../lib/utils";

export interface MockExamTimerBarProps {
  remainingMs: number | null;
  onExpire?: () => void;
  onSync?: () => Promise<number | null>;
  screenId?: "W-32" | "Z-32";
  className?: string;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Sticky timer bar with aria-live warnings at 5:00 and 1:00 */
export function MockExamTimerBar({
  remainingMs,
  onExpire,
  onSync,
  screenId = "W-32",
  className,
}: MockExamTimerBarProps) {
  const [displayMs, setDisplayMs] = useState(remainingMs ?? 0);
  const deadlineRef = useRef<number | null>(remainingMs == null ? null : Date.now() + remainingMs);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  const onSyncRef = useRef(onSync);
  const announcedRef = useRef({ five: false, one: false });
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    onSyncRef.current = onSync;
  }, [onSync]);

  useEffect(() => {
    deadlineRef.current = remainingMs == null ? null : Date.now() + remainingMs;
    expiredRef.current = false;
    setDisplayMs(remainingMs ?? 0);
    announcedRef.current = { five: false, one: false };
  }, [remainingMs]);

  useEffect(() => {
    if (remainingMs == null) return undefined;
    function updateFromDeadline() {
      const deadline = deadlineRef.current;
      if (deadline == null) return;
      const next = Math.max(0, deadline - Date.now());
      setDisplayMs(next);
      if (next <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current?.();
      }
    }
    const interval = window.setInterval(() => {
      updateFromDeadline();
    }, 1000);
    return () => window.clearInterval(interval);
  }, [remainingMs]);

  useEffect(() => {
    if (remainingMs == null || !onSync) return undefined;
    let cancelled = false;
    let syncing = false;
    async function syncFromServer() {
      if (syncing) return;
      syncing = true;
      try {
        const nextRemainingMs = await onSyncRef.current?.();
        if (cancelled) return;
        deadlineRef.current = nextRemainingMs == null ? null : Date.now() + nextRemainingMs;
        setDisplayMs(nextRemainingMs ?? 0);
        if (
          handleServerTimerSyncExpiry(nextRemainingMs, expiredRef.current, () =>
            onExpireRef.current?.(),
          )
        ) {
          expiredRef.current = true;
        } else {
          expiredRef.current = nextRemainingMs == null ? true : nextRemainingMs <= 0;
        }
      } catch {
        // Keep the local deadline running if the periodic server resync fails transiently.
      } finally {
        syncing = false;
      }
    }
    const interval = window.setInterval(() => {
      void syncFromServer();
    }, 15000);
    const handleFocus = () => {
      void syncFromServer();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncFromServer();
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [remainingMs, onSync]);

  useEffect(() => {
    if (!liveRef.current) return;
    const minutes = displayMs / 60000;
    if (minutes <= 5 && minutes > 4.9 && !announcedRef.current.five) {
      announcedRef.current.five = true;
      liveRef.current.textContent = "Còn 5 phút";
    }
    if (minutes <= 1 && minutes > 0.9 && !announcedRef.current.one) {
      announcedRef.current.one = true;
      liveRef.current.textContent = "Còn 1 phút";
    }
  }, [displayMs]);

  const warning = displayMs > 0 && displayMs <= 5 * 60 * 1000;

  return (
    <div
      className={cn(
        "sticky top-0 z-20 border-b border-outline-variant bg-surface shadow-md",
        className,
      )}
      data-screen={screenId}
    >
      <div className="mx-auto flex max-w-content items-center justify-between px-gutter-mobile py-3 md:px-gutter-desktop">
        <span className="text-sm font-medium text-ink-muted">Thời gian phần thi</span>
        <span
          className={cn(
            "font-mono text-lg font-semibold tabular-nums",
            warning ? "text-warning" : "text-ink",
          )}
        >
          Còn {formatTime(displayMs)}
        </span>
      </div>
      <div ref={liveRef} className="sr-only" aria-live="polite" />
    </div>
  );
}
