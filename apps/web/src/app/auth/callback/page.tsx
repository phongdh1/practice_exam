"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

function OAuthCallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const mergeSummary = searchParams.get("mergeSummary");

    if (accessToken && refreshToken) {
      document.cookie = `access_token=${accessToken}; path=/; max-age=${15 * 60}; samesite=lax`;
      document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
    }

    if (mergeSummary) {
      router.replace(`/account/merge-summary?mergeSummary=${encodeURIComponent(mergeSummary)}`);
      return;
    }
    router.replace("/");
  }, [searchParams, router]);

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
