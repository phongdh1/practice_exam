"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import {
  SubjectEditorForm,
  type SubjectEditorFormValues,
} from "@/components/subject-editor-form";
import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

const INITIAL_FORM: SubjectEditorFormValues = {
  courseId: "",
  code: "",
  name: "",
  description: "",
  monthlyAmountVnd: 50_000,
  freeTierLimit: 20,
  studyTierLimit: 5,
  displayOrder: 0,
  visibility: "archived",
  topicTags: [],
  coverImageUrl: null,
  isHot: false,
  minPublishedQuestionsForGoLive: 200,
  minApprovedTemplatesForGoLive: 1,
};

export default function NewSubjectPage() {
  return (
    <AdminRoleGate allowedRoles={["super_admin"]}>
      <NewSubjectContent />
    </AdminRoleGate>
  );
}

function NewSubjectContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SubjectEditorFormValues>(INITIAL_FORM);
  const [actionError, setActionError] = useState<string | null>(null);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const { data: coursesData } = useQuery({
    queryKey: queryKeys.courses.admin,
    queryFn: () => adminApi.adminListCourses(),
  });
  const courses = coursesData?.data ?? [];
  const selectableCourses = courses.filter((course) => course.visibility === "active");

  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.adminCreateSubject({
        courseId: form.courseId,
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description || null,
        monthlyAmountVnd: form.monthlyAmountVnd,
        freeTierLimit: form.freeTierLimit,
        studyTierLimit: form.studyTierLimit,
        displayOrder: form.displayOrder,
        topicTags: form.topicTags,
        coverImageUrl: form.coverImageUrl,
        isHot: form.isHot,
        minPublishedQuestionsForGoLive: form.minPublishedQuestionsForGoLive,
        minApprovedTemplatesForGoLive: form.minApprovedTemplatesForGoLive,
      }),
    onSuccess: () => {
      setActionError(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.subjects.admin });
      router.push("/subjects");
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

  return (
    <AdminPageShell>
      <SubjectEditorForm
        mode="create"
        form={form}
        courses={selectableCourses}
        hasSelectableCourses={selectableCourses.length > 0}
        saving={createMutation.isPending}
        submitLabel="Lưu thay đổi"
        error={actionError}
        coverUploadError={coverUploadError}
        uploadingCover={uploadingCover}
        onChange={setForm}
        onUploadCover={handleUploadCover}
        onSubmit={() => {
          if (createMutation.isPending || uploadingCover) return;
          if (!form.code.trim()) {
            setActionError("Mã môn học không được để trống.");
            return;
          }
          createMutation.mutate();
        }}
      />
    </AdminPageShell>
  );
}
