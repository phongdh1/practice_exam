"use client";

import type { MergeSummary } from "@practice-exam/api-client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function MergeSummaryContent() {
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState<MergeSummary | null>(null);

  useEffect(() => {
    const raw = searchParams.get("mergeSummary");
    if (raw) {
      try {
        setSummary(JSON.parse(raw) as MergeSummary);
      } catch {
        setSummary(null);
      }
    }
  }, [searchParams]);

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-display-sm font-semibold text-primary">Tài khoản đã được gộp</h1>
      <p className="mt-2 text-ink-muted">W-52 — Tóm tắt sau khi liên kết</p>

      {summary ? (
        <ul className="mt-6 space-y-2 text-sm text-ink">
          <li>Gói đăng ký đã gộp: {summary.subscriptionsMerged}</li>
          <li>Lịch sử luyện tập đã gộp: {summary.practiceSessionsMerged} phiên</li>
          <li>Gói trùng đã xử lý: {summary.duplicateSubscriptionsResolved}</li>
        </ul>
      ) : (
        <p className="mt-6 text-ink-muted">Tiến độ và gói đăng ký đã được đồng bộ.</p>
      )}

      <Link
        href="/"
        className="mt-8 inline-block rounded-md bg-primary px-4 py-2 font-medium text-white"
      >
        Tiếp tục
      </Link>
    </main>
  );
}

export default function MergeSummaryPage() {
  return (
    <Suspense>
      <MergeSummaryContent />
    </Suspense>
  );
}
