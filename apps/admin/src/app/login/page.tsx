"use client";

import { AuthShell } from "@practice-exam/ui";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAdminUser, setAdminUser, type AdminCachedUser } from "@/lib/admin-session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        const err = body as { error?: { message?: string }; message?: string };
        setError(err.error?.message ?? err.message ?? "Tên đăng nhập hoặc mật khẩu không đúng.");
        return;
      }
      localStorage.setItem("admin_access_token", body.data.tokens.accessToken);
      // Drop any prior profile so a partial login payload cannot leave a stale chip.
      clearAdminUser();
      const admin = body.data.admin as AdminCachedUser | undefined;
      if (admin?.id && admin.username && admin.role) {
        setAdminUser({
          id: admin.id,
          username: admin.username,
          displayName: admin.displayName ?? null,
          role: admin.role,
        });
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Không thể đăng nhập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="mb-8">
        <h2 className="text-display-sm text-on-surface">Admin Back-Office</h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">A-01 — Đăng nhập quản trị</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="username" className="text-label text-on-surface-variant">
            Tên đăng nhập
          </label>
          <input
            id="username"
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-focus-ring w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-body"
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
            autoComplete="current-password"
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
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </form>
    </AuthShell>
  );
}
