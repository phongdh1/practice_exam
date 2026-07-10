"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";

import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import {
  AdminDataTable,
  AdminIconAction,
  AdminTableActions,
  Badge,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@practice-exam/ui";
import { useQuery } from "@tanstack/react-query";
import { UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";

export default function UsersSearchPage() {
  return (
    <AdminRoleGate allowedRoles={["support", "super_admin"]}>
      <Suspense fallback={<p className="p-8 text-ink-muted">Đang tải...</p>}>
        <UsersSearchContent />
      </Suspense>
    </AdminRoleGate>
  );
}

function UsersSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState(searchParams.get("q") ?? "");

  const q = searchParams.get("q") ?? "";

  const setQuery = useCallback(
    (value: string) => {
      const params = new URLSearchParams();
      if (value.trim()) params.set("q", value.trim());
      router.push(`/users?${params.toString()}`);
    },
    [router],
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: queryKeys.users.search(q),
    queryFn: () => adminApi.adminSearchUsers(q),
    enabled: q.length >= 2,
  });

  const results = data?.data ?? [];

  return (
    <AdminPageShell
      title="Tìm kiếm người dùng"
      subtitle="Tìm theo email, SĐT (externalId), Zalo ID hoặc User ID (A-60)."
    >
      <form
        className="mb-6 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(input);
        }}
      >
        <input
          type="search"
            placeholder="Email, SĐT (externalId), Zalo ID, User ID..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-w-[280px] flex-1 rounded-lg border border-outline-variant px-3 py-2 text-body"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-body font-medium text-on-primary"
        >
          Tìm kiếm
        </button>
      </form>

      {q.length < 2 && (
        <p className="text-ink-muted">Nhập ít nhất 2 ký tự để tìm kiếm.</p>
      )}

      {q.length >= 2 && (isLoading || isFetching) && (
        <p className="text-ink-muted">Đang tìm...</p>
      )}

      {q.length >= 2 && !isLoading && results.length === 0 && (
        <p className="text-ink-muted">Không tìm thấy người dùng phù hợp.</p>
      )}

      {results.length > 0 && (
        <AdminDataTable>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Zalo ID</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.displayName ?? "—"}</div>
                  <div className="text-label text-ink-muted">{user.id}</div>
                </TableCell>
                <TableCell>{user.email ?? "—"}</TableCell>
                <TableCell>{user.zaloId ?? "—"}</TableCell>
                <TableCell>
                  {user.isSuspended ? (
                    <Badge variant="destructive">Đã khóa</Badge>
                  ) : (
                    <Badge variant="secondary">Hoạt động</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <AdminTableActions>
                    <AdminIconAction icon={UserRound} label="Hồ sơ" href={`/users/${user.id}`} />
                  </AdminTableActions>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </AdminDataTable>
      )}
    </AdminPageShell>
  );
}
