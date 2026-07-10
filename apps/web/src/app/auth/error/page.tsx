"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") ?? "auth";

  const message =
    provider === "zalo"
      ? "Không thể đăng nhập Zalo. Thử lại."
      : provider === "google"
        ? "Không thể đăng nhập Google. Thử lại."
        : "Không thể đăng nhập. Thử lại.";

  return (
    <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-display-sm font-semibold text-primary">Lỗi xác thực</h1>
      <p className="mt-4 text-ink-muted">{message}</p>
      <p className="mt-2 text-sm text-ink-muted">W-91 / Z-91</p>
      <Link
        href="/sign-in"
        className="mt-6 inline-block rounded-md bg-primary px-4 py-2 font-medium text-white"
      >
        Thử lại
      </Link>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
