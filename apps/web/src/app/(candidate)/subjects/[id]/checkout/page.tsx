"use client";

import { createApiClient, queryKeys } from "@practice-exam/api-client";
import { webAuthFetch } from "@/lib/auth-fetch";
import { disclaimerQueryOptions } from "@/lib/web-api";
import {
  CheckoutView,
  DisclaimerGate,
  FALLBACK_PLATFORM_DISCLAIMER,
  InternalLink,
} from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const apiClient = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
});

export default function SubjectCheckoutPage() {
  const params = useParams<{ id: string }>();
  const subjectId = params.id;
  const router = useRouter();
  const [provider, setProvider] = useState<"payos" | "sepay">("payos");
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: subjectsResponse, isLoading } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: () => apiClient.listSubjects(),
  });

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const subject = subjectsResponse?.data.find((item) => item.id === subjectId);
  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function handleSubmit() {
    if (!subject) return;
    setLoading(true);
    setError(null);
    try {
      const res = await webAuthFetch("/api/checkout/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          channel: "web",
          provider,
          promoCode: promoCode || undefined,
          returnUrl: `${origin}/checkout/pending?subjectId=${subjectId}`,
          cancelUrl: `${origin}/subjects/${subjectId}`,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? "Không thể bắt đầu thanh toán.");
      }

      const paymentId = body.data.paymentId as string;
      const checkoutUrl = body.data.checkoutUrl as string;
      const checkoutMode = body.data.checkoutMode as string | undefined;

      if (checkoutMode === "vietqr" || body.data.qrImageUrl) {
        router.push(`/checkout/pending?paymentId=${paymentId}&subjectId=${subjectId}`);
        return;
      }

      if (checkoutUrl.includes("/mock-checkout")) {
        await webAuthFetch(`/api/payments/${paymentId}?provider=${provider}`, { method: "POST" });
        router.push(`/checkout/pending?paymentId=${paymentId}&subjectId=${subjectId}`);
        return;
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể bắt đầu thanh toán.");
    } finally {
      setLoading(false);
    }
  }

  const content = (
    <main className="mx-auto max-w-lg p-8">
      <InternalLink href={`/subjects/${subjectId}`} className="text-sm text-primary underline">
        ← Quay lại chi tiết môn
      </InternalLink>
      <p className="mt-4 text-sm text-ink-muted">W-24 — Thanh toán đăng ký</p>
      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {isLoading && <p className="mt-6 text-sm text-ink-muted">Đang tải...</p>}
      {!isLoading && subject && (
        <div className="mt-6">
          <CheckoutView
            subjectName={subject.name}
            monthlyPriceVnd={subject.monthlyPriceVnd}
            provider={provider}
            promoCode={promoCode}
            loading={loading}
            onProviderChange={setProvider}
            onPromoCodeChange={setPromoCode}
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/subjects/${subjectId}`)}
            screenId="W-24"
          />
        </div>
      )}
    </main>
  );

  return (
    <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="W-03">
      {content}
    </DisclaimerGate>
  );
}
