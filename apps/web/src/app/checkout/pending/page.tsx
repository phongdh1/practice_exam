"use client";

import { webAuthFetch } from "@/lib/auth-fetch";
import {
  PaymentConfirmationView,
  PaymentFailedView,
  PaymentPendingView,
} from "@practice-exam/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

async function fetchPayment(paymentId: string) {
  const res = await webAuthFetch(`/api/payments/${paymentId}`);
  if (!res.ok) throw new Error("Failed to load payment");
  return res.json();
}

async function fetchSubjectName(subjectId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/v1/subjects`);
  const body = await res.json();
  return body.data?.find((s: { id: string }) => s.id === subjectId)?.name ?? "môn học";
}

function CheckoutPendingContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const subjectId = searchParams.get("subjectId");
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isError } = useQuery({
    queryKey: ["payments", paymentId],
    queryFn: () => fetchPayment(paymentId!),
    enabled: Boolean(paymentId),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (status === "paid" || status === "failed" || status === "cancelled") return false;
      return 2000;
    },
  });

  const payment = data?.data;
  const terminal = payment?.status === "paid" || payment?.status === "failed" || payment?.status === "cancelled";

  useEffect(() => {
    if (payment?.status === "paid") {
      void queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      void queryClient.invalidateQueries({ queryKey: ["entitlements"] });
    }
  }, [payment?.status, queryClient]);

  if (!paymentId) {
    return (
      <main className="mx-auto max-w-lg p-8">
        <p className="text-sm text-red-600">Thiếu mã giao dịch.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg p-8">
      <p className="text-sm text-ink-muted">W-25 / W-26 — Xác nhận thanh toán</p>

      {!terminal && !isError && <PaymentPendingView screenId="W-25" className="mt-6" />}

      {payment?.status === "paid" && payment.subscription && (
        <PaymentConfirmationView
          className="mt-6"
          subjectName={subjectId ?? "môn học"}
          expiresAt={payment.subscription.periodEnd}
          screenId="W-26"
          onContinue={() => router.push(subjectId ? `/subjects/${subjectId}` : "/")}
        />
      )}

      {(payment?.status === "failed" || payment?.status === "cancelled" || isError) && (
        <PaymentFailedView
          className="mt-6"
          screenId="W-25"
          onRetry={() => router.push(subjectId ? `/subjects/${subjectId}/checkout` : "/")}
          onDismiss={() => router.push(subjectId ? `/subjects/${subjectId}` : "/")}
        />
      )}

      <Link href="/" className="mt-6 inline-block text-sm text-primary underline">
        Về trang chủ
      </Link>
    </main>
  );
}

export default function CheckoutPendingPage() {
  return (
    <Suspense>
      <CheckoutPendingContent />
    </Suspense>
  );
}
