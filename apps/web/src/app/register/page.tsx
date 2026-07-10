"use client";

import { AuthShell } from "@practice-exam/ui";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName: displayName || undefined }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Không thể đăng ký. Vui lòng thử lại.");
        return;
      }
      router.push("/sign-in?registered=1");
    } catch {
      setError("Không thể đăng ký. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="mb-8">
        <h2 className="text-display-sm text-on-surface">Đăng ký</h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Đã có tài khoản?{" "}
          <Link href="/sign-in" className="font-bold text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="displayName" className="text-label text-on-surface-variant">
            Tên hiển thị (tuỳ chọn)
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-focus-ring w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-body"
          />
        </div>
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
            className="input-focus-ring w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-body"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-label text-on-surface-variant">
            Mật khẩu (tối thiểu 8 ký tự)
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-focus-ring w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-body"
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
          className="btn-interact w-full rounded-lg bg-primary-container py-3.5 font-heading text-on-primary shadow-sm transition-colors hover:bg-primary disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>
    </AuthShell>
  );
}
