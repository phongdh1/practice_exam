"use client";

import { createApiClient } from "@practice-exam/api-client";
import { AuthShell } from "@practice-exam/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";
import Link from "next/link";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="mb-8">
        <h2 className="text-display-sm text-on-surface">Đăng nhập</h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-bold text-primary hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>

      {registered && (
        <p className="mb-4 rounded-lg bg-success-muted p-3 text-sm text-success" role="status">
          Đăng ký thành công. Vui lòng đăng nhập.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-label text-on-surface-variant">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="input-focus-ring w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-body transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-label text-on-surface-variant">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-focus-ring w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-body transition-all"
          />
        </div>

        {error && (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-interact mt-2 w-full rounded-lg bg-primary-container py-3.5 font-heading text-on-primary shadow-sm transition-colors hover:bg-primary disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant" />
        </div>
        <div className="relative flex justify-center text-caption">
          <span className="bg-surface-container-lowest px-3 text-ink-muted">hoặc</span>
        </div>
      </div>

      <a
        href={createApiClient({ baseUrl: apiBase }).googleSignInUrl()}
        className="btn-interact flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-heading transition-colors hover:bg-surface-container"
      >
        Đăng nhập với Google
      </a>
    </AuthShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
