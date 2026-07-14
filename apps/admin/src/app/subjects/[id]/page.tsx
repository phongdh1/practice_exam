"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import {
  parseSubjectTopicTags,
  SubjectEditorForm,
  type SubjectEditorFormValues,
} from "@/components/subject-editor-form";
import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EMPTY_FORM: SubjectEditorFormValues = {
  courseId: "",
  code: "",
  name: "",
  description: "",
  monthlyAmountVnd: 50_000,
  freeTierLimit: 20,
  studyTierLimit: 5,
  displayOrder: 0,
  visibility: "archived",
  topicTags: "",
  minPublishedQuestionsForGoLive: 200,
  minApprovedTemplatesForGoLive: 1,
};

export default function EditSubjectPage() {
  return (
    <AdminRoleGate allowedRoles={["super_admin"]}>
      <EditSubjectContent />
    </AdminRoleGate>
  );
}

function EditSubjectContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const [form, setForm] = useState<SubjectEditorFormValues>(EMPTY_FORM);
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  const { data: subjectsData, isLoading } = useQuery({
    queryKey: queryKeys.subjects.admin,
    queryFn: () => adminApi.adminListSubjects(),
  });
  const { data: coursesData } = useQuery({
    queryKey: queryKeys.courses.admin,
    queryFn: () => adminApi.adminListCourses(),
  });

  const subject = subjectsData?.data.find((item) => item.id === params.id);
  const courses = coursesData?.data ?? [];
  const selectableCourses = courses.filter(
    (course) => course.visibility === "active" || course.id === subject?.courseId,
  );

  useEffect(() => {
    if (!subject) return;
    if (hydratedId === subject.id) return;
    setForm({
      courseId: subject.courseId,
      code: subject.code,
      name: subject.name,
      description: subject.description ?? "",
      monthlyAmountVnd: subject.monthlyAmountVnd ?? 50_000,
      freeTierLimit: subject.freeTierLimit ?? 20,
      studyTierLimit: subject.studyTierLimit ?? 5,
      displayOrder: subject.displayOrder,
      visibility: subject.visibility,
      topicTags: subject.topicTags.join(", "),
      minPublishedQuestionsForGoLive: subject.goLive.requirements.minPublishedQuestions,
      minApprovedTemplatesForGoLive: subject.goLive.requirements.minApprovedTemplates,
    });
    setHydratedId(subject.id);
  }, [subject, hydratedId]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        courseId: form.courseId,
        name: form.name.trim(),
        description: form.description || null,
        monthlyAmountVnd: form.monthlyAmountVnd,
        freeTierLimit: form.freeTierLimit,
        studyTierLimit: form.studyTierLimit,
        displayOrder: form.displayOrder,
        topicTags: parseSubjectTopicTags(form.topicTags),
        minPublishedQuestionsForGoLive: form.minPublishedQuestionsForGoLive,
        minApprovedTemplatesForGoLive: form.minApprovedTemplatesForGoLive,
      };
      const visibilityChanging = subject && form.visibility !== subject.visibility;

      if (visibilityChanging && form.visibility === "active") {
        await adminApi.adminUpdateSubject(params.id, payload);
        return adminApi.adminActivateSubject(params.id);
      }
      if (visibilityChanging && form.visibility === "archived") {
        await adminApi.adminUpdateSubject(params.id, payload);
        return adminApi.adminArchiveSubject(params.id);
      }

      return adminApi.adminUpdateSubject(params.id, {
        ...payload,
        visibility: form.visibility,
      });
    },
    onSuccess: () => {
      setActionError(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.subjects.admin });
      router.push("/subjects");
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.adminDeleteSubject(params.id),
    onSuccess: () => {
      setActionError(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.subjects.admin });
      void queryClient.invalidateQueries({ queryKey: queryKeys.courses.admin });
      router.push("/subjects");
    },
    onError: (error: Error) => setActionError(error.message),
  });

  const handleDelete = () => {
    if (subject?.visibility !== "archived") return;
    if (updateMutation.isPending || deleteMutation.isPending) return;
    if (
      !window.confirm(
        "Xóa vĩnh viễn môn học đã lưu trữ này? Toàn bộ câu hỏi và dữ liệu liên quan sẽ bị xóa.",
      )
    ) {
      return;
    }
    deleteMutation.mutate();
  };

  return (
    <AdminPageShell>
      {isLoading && <p className="text-ink-muted">Đang tải...</p>}
      {!isLoading && !subject && <p className="text-error">Không tìm thấy môn học.</p>}
      {subject && hydratedId === subject.id && (
        <SubjectEditorForm
          mode="edit"
          form={form}
          courses={selectableCourses}
          hasSelectableCourses={selectableCourses.length > 0}
          saving={updateMutation.isPending}
          submitLabel="Lưu thay đổi"
          error={actionError}
          updatedAt={subject.updatedAt}
          goLive={subject.goLive}
          persistedVisibility={subject.visibility}
          onChange={setForm}
          onSubmit={() => {
            if (updateMutation.isPending || deleteMutation.isPending) return;
            updateMutation.mutate();
          }}
          onDelete={handleDelete}
          deleting={deleteMutation.isPending}
        />
      )}
    </AdminPageShell>
  );
}
