"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditCoursePage() {
  return (
    <AdminRoleGate allowedRoles={["super_admin"]}>
      <EditCourseContent />
    </AdminRoleGate>
  );
}

function EditCourseContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    displayOrder: 0,
    visibility: "archived" as "active" | "archived",
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.courses.admin,
    queryFn: () => adminApi.adminListCourses(),
  });

  const course = data?.data.find((item) => item.id === params.id);

  useEffect(() => {
    if (!course) return;
    setForm({
      code: course.code,
      name: course.name,
      description: course.description ?? "",
      displayOrder: course.displayOrder,
      visibility: course.visibility,
    });
  }, [course]);

  const updateMutation = useMutation({
    mutationFn: () =>
      adminApi.adminUpdateCourse(params.id, {
        code: form.code,
        name: form.name,
        description: form.description || null,
        displayOrder: form.displayOrder,
        visibility: form.visibility,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses.admin });
      router.push("/courses");
    },
  });

  return (
    <AdminPageShell>
      {isLoading && <p className="text-ink-muted">Đang tải...</p>}
      {!isLoading && !course && <p className="text-error">Không tìm thấy khóa học.</p>}
      {course && (
        <form
          className="max-w-xl space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
          onSubmit={(event) => {
            event.preventDefault();
            updateMutation.mutate();
          }}
        >
          <input
            required
            value={form.code}
            onChange={(event) => setForm({ ...form, code: event.target.value })}
            className="w-full rounded-lg border border-outline-variant px-3 py-2"
          />
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="w-full rounded-lg border border-outline-variant px-3 py-2"
          />
          <textarea
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            className="min-h-24 w-full rounded-lg border border-outline-variant px-3 py-2"
          />
          <input
            type="number"
            value={form.displayOrder}
            onChange={(event) => setForm({ ...form, displayOrder: Number(event.target.value) })}
            className="w-full rounded-lg border border-outline-variant px-3 py-2"
          />
          <select
            value={form.visibility}
            onChange={(event) =>
              setForm({ ...form, visibility: event.target.value as "active" | "archived" })
            }
            className="w-full rounded-lg border border-outline-variant px-3 py-2"
          >
            <option value="active">Hoạt động</option>
            <option value="archived">Lưu trữ</option>
          </select>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-label text-on-primary disabled:opacity-50"
          >
            {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      )}
      <Link href="/courses" className="mt-4 inline-block text-primary underline">
        Quay lại danh sách
      </Link>
    </AdminPageShell>
  );
}
