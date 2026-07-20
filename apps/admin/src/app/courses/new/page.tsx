"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import {
  CourseEditorForm,
  type CourseEditorFormValues,
} from "@/components/course-editor-form";
import { adminApi } from "@/lib/admin-api";
import { toastApiError, toastApiSuccess } from "@/lib/admin-toast";
import { queryKeys } from "@practice-exam/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

const INITIAL_FORM: CourseEditorFormValues = {
  code: "",
  name: "",
  description: "",
  displayOrder: 1,
  coverImageUrl: null,
  visibility: "archived",
};

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
  const [form, setForm] = useState<CourseEditorFormValues>(INITIAL_FORM);
  const [actionError, setActionError] = useState<string | null>(null);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.adminCreateCourse({
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        displayOrder: form.displayOrder,
        coverImageUrl: form.coverImageUrl,
      }),
    onSuccess: () => {
      setActionError(null);
      toastApiSuccess("Đã tạo khóa học");
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses.admin });
      router.push("/courses");
    },
    onError: (error: Error) => {
      setActionError(error.message);
      toastApiError(error, "Không tạo được khóa học");
    },
  });

  const handleUploadCover = async (file: File) => {
    setCoverUploadError(null);
    setUploadingCover(true);
    try {
      const res = await adminApi.adminUploadLandingAsset(file);
      const url = res.data?.url;
      if (!url) throw new Error("Upload không trả về URL.");
      setForm((prev) => ({ ...prev, coverImageUrl: url }));
      toastApiSuccess("Đã tải ảnh bìa");
    } catch (error) {
      setCoverUploadError(error instanceof Error ? error.message : "Tải ảnh thất bại.");
      toastApiError(error, "Tải ảnh bìa thất bại");
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <AdminPageShell>
      <CourseEditorForm
        mode="create"
        form={form}
        saving={createMutation.isPending}
        submitLabel="Lưu khóa học"
        error={actionError}
        coverUploadError={coverUploadError}
        uploadingCover={uploadingCover}
        onChange={setForm}
        onUploadCover={handleUploadCover}
        onSubmit={() => {
          if (createMutation.isPending || uploadingCover) return;
          if (!form.code.trim()) {
            setActionError("Mã khóa học không được để trống.");
            return;
          }
          if (!form.name.trim()) {
            setActionError("Tên khóa học không được để trống.");
            return;
          }
          createMutation.mutate();
        }}
      />
    </AdminPageShell>
  );
}
