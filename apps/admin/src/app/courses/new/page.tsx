"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCoursePage() {
  return (
    <AdminRoleGate allowedRoles={["super_admin"]}>
      <NewCourseContent />
    </AdminRoleGate>
  );
}

function NewCourseContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    displayOrder: 0,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.adminCreateCourse({
        code: form.code,
        name: form.name,
        description: form.description || null,
        displayOrder: form.displayOrder,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses.admin });
      router.push("/courses");
    },
  });

  return (
    <AdminPageShell>
      <CourseForm
        form={form}
        saving={createMutation.isPending}
        submitLabel="Tạo khóa học"
        onChange={setForm}
        onSubmit={() => createMutation.mutate()}
      />
      <Link href="/courses" className="mt-4 inline-block text-primary underline">
        Quay lại danh sách
      </Link>
    </AdminPageShell>
  );
}

function CourseForm({
  form,
  saving,
  submitLabel,
  onChange,
  onSubmit,
}: {
  form: { code: string; name: string; description: string; displayOrder: number };
  saving: boolean;
  submitLabel: string;
  onChange: (form: { code: string; name: string; description: string; displayOrder: number }) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="max-w-xl space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <input
        required
        placeholder="Mã khóa học"
        value={form.code}
        onChange={(event) => onChange({ ...form, code: event.target.value })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2"
      />
      <input
        required
        placeholder="Tên khóa học"
        value={form.name}
        onChange={(event) => onChange({ ...form, name: event.target.value })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2"
      />
      <textarea
        placeholder="Mô tả"
        value={form.description}
        onChange={(event) => onChange({ ...form, description: event.target.value })}
        className="min-h-24 w-full rounded-lg border border-outline-variant px-3 py-2"
      />
      <input
        type="number"
        value={form.displayOrder}
        onChange={(event) => onChange({ ...form, displayOrder: Number(event.target.value) })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-primary px-4 py-2 text-label text-on-primary disabled:opacity-50"
      >
        {saving ? "Đang lưu..." : submitLabel}
      </button>
    </form>
  );
}
