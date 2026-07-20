"use client";
import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";

import { adminApi } from "@/lib/admin-api";
import { useAdminRole } from "@/lib/admin-role";
import { toastApiError, toastApiSuccess } from "@/lib/admin-toast";
import { queryKeys } from "@practice-exam/api-client";
import { Badge, MaterialIcon } from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function UserProfilePage() {
  return (
    <AdminRoleGate allowedRoles={["support", "super_admin"]}>
      <UserProfileContent />
    </AdminRoleGate>
  );
}

function UserProfileContent() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const queryClient = useQueryClient();

  const [grantSubjectId, setGrantSubjectId] = useState("");
  const [grantReason, setGrantReason] = useState("");
  const [revokeReason, setRevokeReason] = useState("");
  const [revokeTargetId, setRevokeTargetId] = useState("");
  const [mergeSurvivorId, setMergeSurvivorId] = useState(userId);
  const [mergeDuplicateId, setMergeDuplicateId] = useState("");
  const [mergeTicket, setMergeTicket] = useState("");
  const [mergePreview, setMergePreview] = useState<{
    summary: {
      identitiesToMerge: number;
      subscriptionsToMerge: number;
      practiceSessionsToMerge: number;
      mockExamAttemptsToMerge: number;
      duplicateSubscriptionsResolved: number;
    };
  } | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [unsuspendReason, setUnsuspendReason] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.users.profile(userId),
    queryFn: () => adminApi.adminGetUserProfile(userId),
  });

  const { data: subjectsData } = useQuery({
    queryKey: ["subjects", "admin"],
    queryFn: () => adminApi.adminListSubjects(),
  });

  const profile = data?.data;
  const subjects = (subjectsData?.data ?? []).filter((s) => s.visibility === "active");
  const adminRole = useAdminRole();
  const canUnsuspend = adminRole === "super_admin";

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(userId) });
  };

  const grantMutation = useMutation({
    mutationFn: () =>
      adminApi.adminGrantSubscription(userId, {
        subjectId: grantSubjectId,
        reason: grantReason,
      }),
    onSuccess: () => {
      setActionMessage("Đã cấp gói đăng ký.");
      toastApiSuccess("Đã cấp gói đăng ký");
      setGrantReason("");
      invalidate();
    },
    onError: (error) => toastApiError(error, "Không cấp được gói"),
  });

  const revokeMutation = useMutation({
    mutationFn: () => adminApi.adminRevokeSubscription(userId, revokeTargetId, revokeReason),
    onSuccess: () => {
      setActionMessage("Đã thu hồi gói đăng ký.");
      toastApiSuccess("Đã thu hồi gói đăng ký");
      setRevokeReason("");
      setRevokeTargetId("");
      invalidate();
    },
    onError: (error) => toastApiError(error, "Không thu hồi được gói"),
  });

  const mergePreviewMutation = useMutation({
    mutationFn: () => adminApi.adminPreviewMerge(mergeSurvivorId, mergeDuplicateId),
    onSuccess: (res) => setMergePreview(res.data ?? null),
    onError: (error) => toastApiError(error, "Xem trước gộp thất bại"),
  });

  const mergeMutation = useMutation({
    mutationFn: () =>
      adminApi.adminForceMerge({
        survivorId: mergeSurvivorId,
        duplicateId: mergeDuplicateId,
        ticketReference: mergeTicket,
      }),
    onSuccess: () => {
      setActionMessage("Đã gộp tài khoản.");
      toastApiSuccess("Đã gộp tài khoản");
      setMergePreview(null);
      setMergeDuplicateId("");
      setMergeTicket("");
      invalidate();
    },
    onError: (error) => toastApiError(error, "Gộp tài khoản thất bại"),
  });

  const suspendMutation = useMutation({
    mutationFn: () => adminApi.adminSuspendUser(userId, suspendReason),
    onSuccess: () => {
      setActionMessage("Đã tạm khóa tài khoản.");
      toastApiSuccess("Đã tạm khóa tài khoản");
      setSuspendReason("");
      invalidate();
    },
    onError: (error) => toastApiError(error, "Không khóa được tài khoản"),
  });

  const unsuspendMutation = useMutation({
    mutationFn: () => adminApi.adminUnsuspendUser(userId, unsuspendReason),
    onSuccess: () => {
      setActionMessage("Đã mở khóa tài khoản.");
      toastApiSuccess("Đã mở khóa tài khoản");
      setUnsuspendReason("");
      invalidate();
    },
    onError: (error) => toastApiError(error, "Không mở khóa được tài khoản"),
  });

  const handleExport = async (format: "json" | "csv") => {
    const blob = await adminApi.adminExportUser(userId, format);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user-${userId}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setActionMessage(`Đã xuất dữ liệu (${format.toUpperCase()}).`);
  };

  if (isLoading || !profile) {
    return (
      <AdminPageShell>
        <p className="p-8 text-ink-muted">Đang tải...</p>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      <div className="mb-4">
        <Link href="/users" className="inline-flex items-center gap-1 text-primary hover:underline">
          <MaterialIcon name="arrow_back" className="text-base" />
          Quay lại tìm kiếm
        </Link>
      </div>

      {actionMessage && (
        <p className="mb-4 rounded-lg bg-surface-container-high px-4 py-2 text-body">{actionMessage}</p>
      )}

      <section className="mb-8 grid gap-4 rounded-xl border border-outline-variant p-4 md:grid-cols-2">
        <div>
          <h2 className="mb-2 text-title font-medium">Thông tin cơ bản</h2>
          <p>Trạng thái: {profile.isSuspended ? <Badge variant="destructive">Đã khóa</Badge> : <Badge variant="secondary">Hoạt động</Badge>}</p>
          <p className="text-ink-muted">Tạo lúc: {new Date(profile.createdAt).toLocaleString("vi-VN")}</p>
        </div>
        <div>
          <h2 className="mb-2 text-title font-medium">Định danh đăng nhập</h2>
          <ul className="space-y-1 text-body">
            {profile.identities.map((identity) => (
              <li key={`${identity.provider}-${identity.externalId}`}>
                <span className="font-medium capitalize">{identity.provider}</span>: {identity.externalId}
                <span className="text-ink-muted"> · {new Date(identity.linkedAt).toLocaleDateString("vi-VN")}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-outline-variant p-4">
        <h2 className="mb-3 text-title font-medium">Gói đăng ký (A-62)</h2>
        {profile.subscriptions.length === 0 ? (
          <p className="mb-3 text-ink-muted">Chưa có gói đăng ký.</p>
        ) : (
          <ul className="mb-4 space-y-2">
            {profile.subscriptions.map((sub) => (
              <li key={sub.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface-container-low px-3 py-2">
                <span>
                  Môn {sub.subjectId} · {sub.status} · đến {new Date(sub.periodEnd).toLocaleDateString("vi-VN")}
                </span>
                <button
                  type="button"
                  className="text-sm text-error hover:underline"
                  onClick={() => setRevokeTargetId(sub.id)}
                >
                  Thu hồi
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-outline-variant p-3">
            <h3 className="mb-2 font-medium">Cấp gói thủ công</h3>
            <select
              value={grantSubjectId}
              onChange={(e) => setGrantSubjectId(e.target.value)}
              className="mb-2 w-full rounded border border-outline-variant px-2 py-1"
            >
              <option value="">Chọn môn học</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
            <input
              placeholder="Lý do (bắt buộc)"
              value={grantReason}
              onChange={(e) => setGrantReason(e.target.value)}
              className="mb-2 w-full rounded border border-outline-variant px-2 py-1"
            />
            <button
              type="button"
              disabled={!grantSubjectId || !grantReason || grantMutation.isPending}
              onClick={() => grantMutation.mutate()}
              className="rounded bg-primary px-3 py-1 text-on-primary disabled:opacity-50"
            >
              Cấp gói
            </button>
          </div>

          <div className="rounded-lg border border-outline-variant p-3">
            <h3 className="mb-2 font-medium">Thu hồi gói</h3>
            <input
              placeholder="Subscription ID"
              value={revokeTargetId}
              onChange={(e) => setRevokeTargetId(e.target.value)}
              className="mb-2 w-full rounded border border-outline-variant px-2 py-1"
            />
            <input
              placeholder="Lý do (bắt buộc)"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              className="mb-2 w-full rounded border border-outline-variant px-2 py-1"
            />
            <button
              type="button"
              disabled={!revokeTargetId || !revokeReason || revokeMutation.isPending}
              onClick={() => revokeMutation.mutate()}
              className="rounded bg-error px-3 py-1 text-on-error disabled:opacity-50"
            >
              Thu hồi
            </button>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-outline-variant p-4">
          <h2 className="mb-2 text-title font-medium">Luyện tập gần đây</h2>
          <ul className="space-y-1 text-body">
            {profile.practiceSessions.slice(0, 5).map((s) => (
              <li key={s.id}>
                {s.subjectName}: {s.answeredCount} câu ({s.status})
              </li>
            ))}
            {profile.practiceSessions.length === 0 && <li className="text-ink-muted">Chưa có.</li>}
          </ul>
        </div>
        <div className="rounded-xl border border-outline-variant p-4">
          <h2 className="mb-2 text-title font-medium">Thi thử gần đây</h2>
          <ul className="space-y-1 text-body">
            {profile.mockExamAttempts.slice(0, 5).map((a) => (
              <li key={a.id}>
                {a.templateName}: {a.status}
                {a.scorePercent != null ? ` · ${a.scorePercent}%` : ""}
              </li>
            ))}
            {profile.mockExamAttempts.length === 0 && <li className="text-ink-muted">Chưa có.</li>}
          </ul>
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-outline-variant p-4">
        <h2 className="mb-3 text-title font-medium">Dòng thời gian</h2>
        <ul className="max-h-48 space-y-2 overflow-y-auto text-body">
          {profile.timeline.map((event) => (
            <li key={event.id} className="rounded bg-surface-container-low px-3 py-2">
              <div className="font-medium">{event.action}</div>
              <div className="text-label text-ink-muted">
                {new Date(event.createdAt).toLocaleString("vi-VN")}
              </div>
            </li>
          ))}
          {profile.timeline.length === 0 && <li className="text-ink-muted">Chưa có sự kiện.</li>}
        </ul>
      </section>

      <section className="mb-8 rounded-xl border border-outline-variant p-4">
        <h2 className="mb-3 text-title font-medium">Gộp tài khoản (A-63)</h2>
        <div className="grid gap-2 md:grid-cols-2">
          <input
            placeholder="Survivor User ID"
            value={mergeSurvivorId}
            onChange={(e) => setMergeSurvivorId(e.target.value)}
            className="rounded border border-outline-variant px-2 py-1"
          />
          <input
            placeholder="Duplicate User ID"
            value={mergeDuplicateId}
            onChange={(e) => setMergeDuplicateId(e.target.value)}
            className="rounded border border-outline-variant px-2 py-1"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!mergeSurvivorId || !mergeDuplicateId || mergePreviewMutation.isPending}
            onClick={() => mergePreviewMutation.mutate()}
            className="rounded border border-outline-variant px-3 py-1"
          >
            Xem trước
          </button>
        </div>
        {mergePreview && (
          <div className="mt-3 rounded-lg bg-surface-container-low p-3 text-body">
            <p>Gộp {mergePreview.summary.identitiesToMerge} định danh, {mergePreview.summary.subscriptionsToMerge} gói, {mergePreview.summary.practiceSessionsToMerge} phiên luyện tập, {mergePreview.summary.mockExamAttemptsToMerge} lượt thi thử.</p>
            <p>Trùng gói: {mergePreview.summary.duplicateSubscriptionsResolved}</p>
            <input
              placeholder="Mã ticket hỗ trợ (bắt buộc)"
              value={mergeTicket}
              onChange={(e) => setMergeTicket(e.target.value)}
              className="mt-2 w-full rounded border border-outline-variant px-2 py-1"
            />
            <button
              type="button"
              disabled={!mergeTicket || mergeMutation.isPending}
              onClick={() => mergeMutation.mutate()}
              className="mt-2 rounded bg-primary px-3 py-1 text-on-primary disabled:opacity-50"
            >
              Xác nhận gộp
            </button>
          </div>
        )}
      </section>

      <section className="mb-8 rounded-xl border border-outline-variant p-4">
        <h2 className="mb-3 text-title font-medium">Xuất dữ liệu (A-64)</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => void handleExport("json")} className="rounded border border-outline-variant px-3 py-1">
            Tải JSON
          </button>
          <button type="button" onClick={() => void handleExport("csv")} className="rounded border border-outline-variant px-3 py-1">
            Tải CSV
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant p-4">
        <h2 className="mb-3 text-title font-medium">Tạm khóa tài khoản (A-65)</h2>
        {profile.isSuspended ? (
          canUnsuspend ? (
          <div>
            <input
              placeholder="Lý do mở khóa (super admin)"
              value={unsuspendReason}
              onChange={(e) => setUnsuspendReason(e.target.value)}
              className="mb-2 w-full rounded border border-outline-variant px-2 py-1"
            />
            <button
              type="button"
              disabled={!unsuspendReason || unsuspendMutation.isPending}
              onClick={() => unsuspendMutation.mutate()}
              className="rounded bg-primary px-3 py-1 text-on-primary disabled:opacity-50"
            >
              Mở khóa
            </button>
          </div>
          ) : (
            <p className="text-ink-muted">Chỉ super admin mới có thể mở khóa tài khoản.</p>
          )
        ) : (
          <div>
            <input
              placeholder="Lý do tạm khóa (bắt buộc)"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="mb-2 w-full rounded border border-outline-variant px-2 py-1"
            />
            <button
              type="button"
              disabled={!suspendReason || suspendMutation.isPending}
              onClick={() => suspendMutation.mutate()}
              className="rounded bg-error px-3 py-1 text-on-error disabled:opacity-50"
            >
              Tạm khóa
            </button>
          </div>
        )}
      </section>
    </AdminPageShell>
  );
}
