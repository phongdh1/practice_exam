"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import {
  CourseEditorForm,
  type CourseEditorFormValues,
} from "@/components/course-editor-form";
import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EMPTY_FORM: CourseEditorFormValues = {
  code: "",
  name: "",
  description: "",
  displayOrder: 0,
  coverImageUrl: null,
  visibility: "archived",
};

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
  const [form, setForm] = useState<CourseEditorFormValues>(EMPTY_FORM);
  const [actionError, setActionError] = useState<string | null>(null);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.courses.admin,
    queryFn: () => adminApi.adminListCourses(),
  });

  const course = data?.data.find((item) => item.id === params.id);

  useEffect(() => {
    if (!course) return;
    if (hydratedId === course.id) return;
    setForm({
      code: course.code,
      name: course.name,
      description: course.description ?? "",
      displayOrder: course.displayOrder,
      coverImageUrl: course.coverImageUrl,
      visibility: course.visibility,
    });
    setHydratedId(course.id);
  }, [course, hydratedId]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.courses.admin });
    void queryClient.invalidateQueries({ queryKey: queryKeys.subjects.admin });
  };

  const updateMutation = useMutation({
    mutationFn: () =>
      adminApi.adminUpdateCourse(params.id, {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        displayOrder: form.displayOrder,
        visibility: form.visibility,
        coverImageUrl: form.coverImageUrl,
      }),
    onSuccess: () => {
      setActionError(null);
      invalidate();
      router.push("/courses");
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.adminDeleteCourse(params.id),
    onSuccess: () => {
      setActionError(null);
      invalidate();
      router.push("/courses");
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const handleUploadCover = async (file: File) => {
    setCoverUploadError(null);
    setUploadingCover(true);
    try {
      const res = await adminApi.adminUploadLandingAsset(file);
      const url = res.data?.url;
      if (!url) throw new Error("Upload không trả về URL.");
      setForm((prev) => ({ ...prev, coverImageUrl: url }));
    } catch (error) {
      setCoverUploadError(error instanceof Error ? error.message : "Tải ảnh thất bại.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDelete = () => {
    if (!course || course.subjectCount > 0) return;
    if (!window.confirm("Xóa vĩnh viễn khóa học này? Chỉ khóa học không có môn học mới xóa được.")) {
      return;
    }
    deleteMutation.mutate();
  };

  return (
    <AdminPageShell>
      {isLoading && <p className="text-ink-muted">Đang tải...</p>}
      {!isLoading && !course && <p className="text-error">Không tìm thấy khóa học.</p>}
      {course && (
        <CourseEditorForm
          mode="edit"
          form={form}
          saving={updateMutation.isPending}
          submitLabel="Lưu khóa học"
          error={actionError}
          coverUploadError={coverUploadError}
          uploadingCover={uploadingCover}
          subjectCount={course.subjectCount}
          deleting={deleteMutation.isPending}
          onChange={setForm}
          onUploadCover={handleUploadCover}
          onDelete={handleDelete}
          onSubmit={() => {
            if (updateMutation.isPending || uploadingCover || deleteMutation.isPending) return;
            if (!form.code.trim()) {
              setActionError("Mã khóa học không được để trống.");
              return;
            }
            if (!form.name.trim()) {
              setActionError("Tên khóa học không được để trống.");
              return;
            }
            updateMutation.mutate();
          }}
        />
      )}
    </AdminPageShell>
  );
}
