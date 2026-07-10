"use client";

import { createApiClient } from "@practice-exam/api-client";
import Link from "next/link";
import { useState } from "react";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function LinkZaloPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLink() {
    setError(null);
    setLoading(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("access_token="))
        ?.split("=")[1];

      if (!token) {
        setError("Bạn cần đăng nhập để liên kết tài khoản.");
        return;
      }

      const client = createApiClient({
        baseUrl: apiBase,
        getAccessToken: () => token,
      });

      // In production, zmp-sdk provides the token; test flow uses mock token
      const zaloToken = "test-zalo-link-user";
      const result = await client.linkZalo(zaloToken);

      if (result.data.mergeSummary) {
        const params = new URLSearchParams({
          mergeSummary: JSON.stringify(result.data.mergeSummary),
        });
        window.location.href = `/account/merge-summary?${params.toString()}`;
        return;
      }
      window.location.href = "/";
    } catch {
      setError("Không thể đăng nhập Zalo. Thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-display-sm font-semibold text-primary">Liên kết Zalo</h1>
      <p className="mt-2 text-ink-muted">
        W-51 — Liên kết tài khoản để đồng bộ tiến độ và gói đăng ký.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleLink}
        disabled={loading}
        className="mt-6 w-full rounded-md bg-primary px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        {loading ? "Đang xử lý..." : "Liên kết với Zalo"}
      </button>

      <Link href="/" className="mt-4 block text-center text-sm text-primary underline">
        Quay lại
      </Link>
    </main>
  );
}
