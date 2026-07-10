"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import { Badge } from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CatalogSectionToolbar } from "@/components/catalog-section-tabs";
import Link from "next/link";
import { useState } from "react";

export default function CoursesPage() {
  return (
    <AdminRoleGate allowedRoles={["super_admin"]}>
      <CoursesContent />
    </AdminRoleGate>
  );
}

function CoursesContent() {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.courses.admin,
    queryFn: () => adminApi.adminListCourses(),
  });

  const visibilityMutation = useMutation({
    mutationFn: ({ id, visibility }: { id: string; visibility: "active" | "archived" }) =>
      visibility === "active" ? adminApi.adminActivateCourse(id) : adminApi.adminArchiveCourse(id),
    onSuccess: () => {
      setActionError(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses.admin });
      void queryClient.invalidateQueries({ queryKey: queryKeys.subjects.admin });
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) => adminApi.adminReorderCourses(orderedIds),
    onSuccess: () => {
      setActionError(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses.admin });
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const courses = data?.data ?? [];

  const moveCourse = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= courses.length) return;
    const next = [...courses];
    [next[index], next[target]] = [next[target], next[index]];
    reorderMutation.mutate(next.map((course) => course.id));
  };

  return (
    <AdminPageShell
      title="Khóa học"
      subtitle="Nhóm danh mục cấp Course; thanh toán và quyền truy cập vẫn ở cấp môn học."
    >
      <CatalogSectionToolbar />

      {actionError && (
        <p className="mb-4 rounded-lg border border-error/30 bg-error-container px-4 py-2 text-body-sm text-on-error-container">
          {actionError}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <table className="w-full text-left text-body">
          <thead className="bg-surface-container-low text-label">
            <tr>
              <th className="px-4 py-3">Khóa học</th>
              <th className="px-4 py-3">Thứ tự</th>
              <th className="px-4 py-3">Môn học</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  Đang tải...
                </td>
              </tr>
            )}
            {!isLoading && courses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  Chưa có khóa học.
                </td>
              </tr>
            )}
            {courses.map((course, index) => (
              <tr key={course.id} className="border-t border-outline-variant">
                <td className="px-4 py-3">
                  <div className="font-medium">{course.name}</div>
                  <div className="font-mono text-label text-ink-muted">{course.code}</div>
                  {course.description && (
                    <div className="mt-1 text-body-sm text-ink-muted">{course.description}</div>
                  )}
                </td>
                <td className="px-4 py-3">{course.displayOrder}</td>
                <td className="px-4 py-3">{course.subjectCount}</td>
                <td className="px-4 py-3">
                  <Badge variant={course.visibility === "active" ? "secondary" : "outline"}>
                    {course.visibility === "active" ? "Hoạt động" : "Lưu trữ"}
                  </Badge>
                </td>
                <td className="space-x-3 px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-primary underline disabled:opacity-40"
                    disabled={index === 0 || reorderMutation.isPending}
                    onClick={() => moveCourse(index, -1)}
                  >
                    Lên
                  </button>
                  <button
                    type="button"
                    className="text-primary underline disabled:opacity-40"
                    disabled={index === courses.length - 1 || reorderMutation.isPending}
                    onClick={() => moveCourse(index, 1)}
                  >
                    Xuống
                  </button>
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() =>
                      visibilityMutation.mutate({
                        id: course.id,
                        visibility: course.visibility === "active" ? "archived" : "active",
                      })
                    }
                  >
                    {course.visibility === "active" ? "Lưu trữ" : "Kích hoạt"}
                  </button>
                  <Link href={`/courses/${course.id}`} className="text-primary underline">
                    Sửa
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  );
}
