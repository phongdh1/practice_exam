"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import { QuestionEditorForm } from "@/components/question-editor-form";
import { adminApi } from "@/lib/admin-api";
import {
  buildQuestionPayload,
  questionDetailToForm,
  validateQuestionForm,
} from "@/lib/question-editor";
import { queryKeys } from "@practice-exam/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AdminRoleGate allowedRoles={["editor", "super_admin"]}>
      <EditQuestionContent questionId={id} />
    </AdminRoleGate>
  );
}

function EditQuestionContent({ questionId }: { questionId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ReturnType<typeof questionDetailToForm> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: questionData, isLoading, error: loadError } = useQuery({
    queryKey: queryKeys.questions.detail(questionId),
    queryFn: () => adminApi.adminGetQuestion(questionId),
  });

  const { data: coursesData } = useQuery({
    queryKey: queryKeys.courses.admin,
    queryFn: () => adminApi.adminListCourses(),
  });
  const { data: subjectsData } = useQuery({
    queryKey: queryKeys.subjects.admin,
    queryFn: () => adminApi.adminListSubjects(),
  });

  const question = questionData?.data;
  const subjects = subjectsData?.data ?? [];
  const courses = coursesData?.data ?? [];
  const subject = subjects.find((item) => item.id === question?.subjectId);

  useEffect(() => {
    if (!question || !subject) return;
    setForm(questionDetailToForm(question, subject.courseId));
  }, [question, subject]);

  const readOnly = question?.status === "in_review" || question?.status === "archived";

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!form) throw new Error("Form chưa sẵn sàng.");
      const validationError = validateQuestionForm(form);
      if (validationError) throw new Error(validationError);

      return adminApi.adminUpdateQuestion(questionId, buildQuestionPayload(form));
    },
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: ["questions"] });
      const saved = response.data;
      if (saved.id !== questionId) {
        router.replace(`/questions/${saved.id}/edit`);
        return;
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.questions.detail(questionId) });
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Không thể lưu câu hỏi.");
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => adminApi.adminSubmitQuestionForReview(questionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["questions"] });
      router.push("/review");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Không thể gửi duyệt.");
    },
  });

  const handleSave = () => {
    setError(null);
    if (!form) return;
    const validationError = validateQuestionForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    saveMutation.mutate();
  };

  return (
    <AdminPageShell
      title="Sửa câu hỏi"
      subtitle="A-31 — Biên tập nội dung câu hỏi."
    >
      <div className="mb-6">
        <Link href="/questions" className="text-label text-primary hover:underline">
          ← Quay lại ngân hàng câu hỏi
        </Link>
      </div>

      {isLoading && <p className="text-ink-muted">Đang tải câu hỏi...</p>}
      {loadError && <p className="text-error">Không thể tải câu hỏi.</p>}

      {form && question && (
        <QuestionEditorForm
          mode="edit"
          questionId={questionId}
          form={form}
          status={question.status}
          subjectName={question.subjectName ?? subject?.name}
          duplicateWarning={question.duplicateWarning}
          readOnly={readOnly}
          courses={courses}
          subjects={subjects}
          saving={saveMutation.isPending}
          submitting={submitMutation.isPending}
          error={error}
          onChange={setForm}
          onSave={handleSave}
          onSubmitForReview={() => {
            setError(null);
            submitMutation.mutate();
          }}
        />
      )}
    </AdminPageShell>
  );
}
