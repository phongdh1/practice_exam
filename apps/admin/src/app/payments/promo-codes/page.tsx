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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Power } from "lucide-react";
import { PaymentsSectionTabs } from "@/components/payments-section-tabs";
import { useState } from "react";

export default function PromoCodesPage() {
  return (
    <AdminRoleGate allowedRoles={["finance", "super_admin"]}>
      <PromoCodesContent />
    </AdminRoleGate>
  );
}

function PromoCodesContent() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 10,
    expiresAt: "",
    usageLimit: 100,
    subjectIds: [] as string[],
  });

  const { data: subjectsData } = useQuery({
    queryKey: ["subjects", "admin"],
    queryFn: () => adminApi.adminListSubjects(),
  });

  const subjects = (subjectsData?.data ?? []).filter((s) => s.visibility === "active");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.paymentsAdmin.promoCodes,
    queryFn: () => adminApi.adminListPromoCodes(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.adminCreatePromoCode({
        code: form.code,
        discountType: form.discountType,
        discountValue: form.discountValue,
        expiresAt: new Date(form.expiresAt).toISOString(),
        usageLimit: form.usageLimit,
        subjectIds: form.subjectIds.length > 0 ? form.subjectIds : undefined,
      }),
    onSuccess: () => {
      setShowForm(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.paymentsAdmin.promoCodes });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.adminUpdatePromoCode(id, { isActive }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.paymentsAdmin.promoCodes });
    },
  });

  const codes = data?.data ?? [];

  return (
    <AdminPageShell>
      <PaymentsSectionTabs />

      <button
        type="button"
        className="mb-4 rounded-lg bg-primary px-4 py-2 text-on-primary"
        onClick={() => setShowForm(true)}
      >
        Tạo mã mới
      </button>

      {showForm && (
        <form
          className="mb-6 max-w-lg space-y-3 rounded-xl border p-4"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <input
            required
            placeholder="Mã (VD: LAUNCH10)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full rounded border px-3 py-2"
          />
          <select
            value={form.discountType}
            onChange={(e) =>
              setForm({ ...form, discountType: e.target.value as "percentage" | "fixed" })
            }
            className="w-full rounded border px-3 py-2"
          >
            <option value="percentage">Phần trăm (%)</option>
            <option value="fixed">Số tiền cố định (₫)</option>
          </select>
          <input
            type="number"
            required
            min={1}
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
            className="w-full rounded border px-3 py-2"
          />
          <input
            type="datetime-local"
            required
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            className="w-full rounded border px-3 py-2"
          />
          <input
            type="number"
            required
            min={1}
            value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
            className="w-full rounded border px-3 py-2"
            placeholder="Giới hạn lượt dùng"
          />
          <fieldset className="space-y-2">
            <legend className="text-body-sm text-ink-muted">
              Phạm vi môn học (để trống = tất cả môn)
            </legend>
            <div className="max-h-40 space-y-1 overflow-y-auto rounded border p-2">
              {subjects.map((subject) => (
                <label key={subject.id} className="flex items-center gap-2 text-body-sm">
                  <input
                    type="checkbox"
                    checked={form.subjectIds.includes(subject.id)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...form.subjectIds, subject.id]
                        : form.subjectIds.filter((id) => id !== subject.id);
                      setForm({ ...form, subjectIds: next });
                    }}
                  />
                  {subject.name} ({subject.code})
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-primary px-4 py-2 text-on-primary">
              Lưu
            </button>
            <button type="button" className="rounded border px-4 py-2" onClick={() => setShowForm(false)}>
              Hủy
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-ink-muted">Đang tải...</p>}

      {codes.length > 0 && (
        <AdminDataTable>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Giảm giá</TableHead>
              <TableHead>Hết hạn</TableHead>
              <TableHead>Đã dùng</TableHead>
              <TableHead>Môn học</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-mono font-medium">{promo.code}</TableCell>
                <TableCell>
                  {promo.discountType === "percentage"
                    ? `${promo.discountValue}%`
                    : `${promo.discountValue.toLocaleString("vi-VN")} ₫`}
                </TableCell>
                <TableCell>{new Date(promo.expiresAt).toLocaleDateString("vi-VN")}</TableCell>
                <TableCell>
                  {promo.usageCount} / {promo.usageLimit}
                </TableCell>
                <TableCell className="text-ink-muted">
                  {promo.subjectIds.length === 0 ? "Tất cả" : `${promo.subjectIds.length} môn`}
                </TableCell>
                <TableCell>
                  {promo.isExpired ? (
                    <Badge variant="outline">Hết hạn</Badge>
                  ) : promo.isActive ? (
                    <Badge variant="secondary">Hoạt động</Badge>
                  ) : (
                    <Badge variant="outline">Tắt</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {!promo.isExpired && (
                    <AdminTableActions>
                      <AdminIconAction
                        icon={Power}
                        label={promo.isActive ? "Tắt" : "Bật"}
                        onClick={() =>
                          toggleMutation.mutate({ id: promo.id, isActive: !promo.isActive })
                        }
                      />
                    </AdminTableActions>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </AdminDataTable>
      )}
    </AdminPageShell>
  );
}
