"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import {
  AdminDataTable,
  AdminIconAction,
  AdminTableActions,
  AdminTableEmpty,
  Badge,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, ArrowDown, ArrowUp, Check, Pencil } from "lucide-react";
import { CatalogSectionToolbar } from "@/components/catalog-section-tabs";
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

      <AdminDataTable>
        <TableHeader>
          <TableRow>
            <TableHead>Khóa học</TableHead>
            <TableHead>Thứ tự</TableHead>
            <TableHead>Môn học</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[180px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <AdminTableEmpty colSpan={5}>Đang tải...</AdminTableEmpty>}
          {!isLoading && courses.length === 0 && (
            <AdminTableEmpty colSpan={5}>Chưa có khóa học.</AdminTableEmpty>
          )}
          {courses.map((course, index) => (
            <TableRow key={course.id}>
              <TableCell>
                <div className="font-medium">{course.name}</div>
                <div className="font-mono text-label text-ink-muted">{course.code}</div>
                {course.description && (
                  <div className="mt-1 text-body-sm text-ink-muted">{course.description}</div>
                )}
              </TableCell>
              <TableCell>{course.displayOrder}</TableCell>
              <TableCell>{course.subjectCount}</TableCell>
              <TableCell>
                <Badge variant={course.visibility === "active" ? "secondary" : "outline"}>
                  {course.visibility === "active" ? "Hoạt động" : "Lưu trữ"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <AdminTableActions>
                  <AdminIconAction
                    icon={ArrowUp}
                    label="Lên"
                    disabled={index === 0 || reorderMutation.isPending}
                    onClick={() => moveCourse(index, -1)}
                  />
                  <AdminIconAction
                    icon={ArrowDown}
                    label="Xuống"
                    disabled={index === courses.length - 1 || reorderMutation.isPending}
                    onClick={() => moveCourse(index, 1)}
                  />
                  <AdminIconAction
                    icon={course.visibility === "active" ? Archive : Check}
                    label={course.visibility === "active" ? "Lưu trữ" : "Kích hoạt"}
                    onClick={() =>
                      visibilityMutation.mutate({
                        id: course.id,
                        visibility: course.visibility === "active" ? "archived" : "active",
                      })
                    }
                  />
                  <AdminIconAction icon={Pencil} label="Sửa" href={`/courses/${course.id}`} />
                </AdminTableActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </AdminDataTable>
    </AdminPageShell>
  );
}
