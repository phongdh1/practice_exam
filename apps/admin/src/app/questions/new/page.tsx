"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import { QuestionEditorForm } from "@/components/question-editor-form";
import { adminApi } from "@/lib/admin-api";
import {
  buildQuestionPayload,
  createEmptyQuestionForm,
  validateQuestionForm,
} from "@/lib/question-editor";
import { queryKeys } from "@practice-exam/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewQuestionPage() {
  return (
    <AdminRoleGate allowedRoles={["editor", "super_admin"]}>
      <NewQuestionContent />
    </AdminRoleGate>
  );
}

function NewQuestionContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(createEmptyQuestionForm);
  const [error, setError] = useState<string | null>(null);

  const { data: coursesData } = useQuery({
    queryKey: queryKeys.courses.admin,
    queryFn: () => adminApi.adminListCourses(),
  });
  const { data: subjectsData } = useQuery({
    queryKey: queryKeys.subjects.admin,
    queryFn: () => adminApi.adminListSubjects(),
  });

  const courses = coursesData?.data ?? [];
  const subjects = subjectsData?.data ?? [];
  const selectableCourses = courses.filter((course) => course.visibility === "active");

  const createMutation = useMutation({
    mutationFn: () => {
      const validationError = validateQuestionForm(form);
      if (validationError) throw new Error(validationError);

      return adminApi.adminCreateQuestion({
        subjectId: form.subjectId,
        ...buildQuestionPayload(form),
      });
    },
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: ["questions"] });
      router.push(`/questions/${response.data.id}/edit`);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Không thể tạo câu hỏi.");
    },
  });

  const handleSave = () => {
    setError(null);
    const validationError = validateQuestionForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    createMutation.mutate();
  };

  return (
    <AdminPageShell>
      <div className="mb-6">
        <Link href="/questions" className="text-label text-primary hover:underline">
          ← Quay lại ngân hàng câu hỏi
        </Link>
      </div>

      <QuestionEditorForm
        mode="create"
        form={form}
        courses={selectableCourses}
        subjects={subjects}
        saving={createMutation.isPending}
        error={error}
        onChange={setForm}
        onSave={handleSave}
      />
    </AdminPageShell>
  );
}
