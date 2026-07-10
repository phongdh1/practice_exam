"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useWebSession } from "@/components/web-session-provider";

function OAuthCallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { invalidateSession } = useWebSession();

  useEffect(() => {
    let cancelled = false;

    async function completeOAuth() {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const mergeSummary = searchParams.get("mergeSummary");

      if (accessToken && refreshToken) {
        const res = await fetch("/api/auth/set-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken, refreshToken }),
        });
        if (!res.ok) {
          if (cancelled) return;
          router.replace("/sign-in?error=oauth_session");
          return;
        }
        await invalidateSession();
      }

      if (cancelled) return;

      if (mergeSummary) {
        router.replace(`/account/merge-summary?mergeSummary=${encodeURIComponent(mergeSummary)}`);
        return;
      }
      router.replace("/");
    }

    void completeOAuth();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router, invalidateSession]);

  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <p className="text-ink-muted">Đang hoàn tất đăng nhập...</p>
    </main>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense>
      <OAuthCallbackHandler />
    </Suspense>
  );
}
