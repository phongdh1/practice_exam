"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [form, setForm] = useState({
    courseId: "",
    name: "",
    description: "",
    monthlyAmountVnd: 50_000,
    freeTierLimit: 20,
    studyTierLimit: 5,
    displayOrder: 0,
    visibility: "archived" as "active" | "archived",
    topicTags: "",
    minPublishedQuestionsForGoLive: 200,
    minApprovedTemplatesForGoLive: 1,
  });

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
    setForm({
      courseId: subject.courseId,
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
  }, [subject]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        courseId: form.courseId,
        name: form.name,
        description: form.description || null,
        monthlyAmountVnd: form.monthlyAmountVnd,
        freeTierLimit: form.freeTierLimit,
        studyTierLimit: form.studyTierLimit,
        displayOrder: form.displayOrder,
        topicTags: parseTags(form.topicTags),
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

  return (
    <AdminPageShell title="Sửa môn học" subtitle="Course bắt buộc; go-live gate vẫn tính trên môn học.">
      {isLoading && <p className="text-ink-muted">Đang tải...</p>}
      {!isLoading && !subject && <p className="text-error">Không tìm thấy môn học.</p>}
      {actionError && (
        <p className="mb-4 rounded-lg border border-error/30 bg-error-container px-4 py-2 text-body-sm text-on-error-container">
          {actionError}
        </p>
      )}
      {subject && (
        <form
          className="max-w-xl space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
          onSubmit={(event) => {
            event.preventDefault();
            updateMutation.mutate();
          }}
        >
          <div className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-body-sm text-ink-muted">
            Go-live: {subject.goLive.publishedQuestionCount}/{form.minPublishedQuestionsForGoLive}{" "}
            câu hỏi, {subject.goLive.approvedTemplateCount}/
            {form.minApprovedTemplatesForGoLive} template.
            {!subject.goLive.canActivate &&
              subject.visibility === "archived" &&
              !(
                (form.minPublishedQuestionsForGoLive === 0 ||
                  subject.goLive.publishedQuestionCount >= form.minPublishedQuestionsForGoLive) &&
                (form.minApprovedTemplatesForGoLive === 0 ||
                  subject.goLive.approvedTemplateCount >= form.minApprovedTemplatesForGoLive)
              ) && (
              <span className="mt-1 block text-on-error-container">
                Chưa đủ điều kiện kích hoạt — cần đạt đủ ngưỡng trên trước khi chuyển sang Hoạt
                động.
              </span>
            )}
          </div>
          <select
            required
            value={form.courseId}
            onChange={(event) => setForm({ ...form, courseId: event.target.value })}
            className="w-full rounded-lg border border-outline-variant px-3 py-2"
          >
            <option value="">Chọn Course</option>
            {selectableCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.code}){course.visibility === "archived" ? " - lưu trữ" : ""}
              </option>
            ))}
          </select>
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
            min={1}
            value={form.monthlyAmountVnd}
            onChange={(event) => setForm({ ...form, monthlyAmountVnd: Number(event.target.value) })}
            className="w-full rounded-lg border border-outline-variant px-3 py-2"
          />
          <input
            type="number"
            min={1}
            value={form.freeTierLimit}
            onChange={(event) => setForm({ ...form, freeTierLimit: Number(event.target.value) })}
            placeholder="Free Tier limit"
            className="w-full rounded-lg border border-outline-variant px-3 py-2"
          />
          <label className="block text-body-sm text-ink-muted">
            Study Tier limit
            <span className="mt-1 block text-caption">
              Số lần xem đáp án + giải thích miễn phí mỗi tháng (Study Mode)
            </span>
          </label>
          <input
            type="number"
            min={1}
            value={form.studyTierLimit}
            onChange={(event) => setForm({ ...form, studyTierLimit: Number(event.target.value) })}
            className="w-full rounded-lg border border-outline-variant px-3 py-2"
          />
          <input
            type="number"
            min={0}
            max={10_000}
            value={form.minPublishedQuestionsForGoLive}
            onChange={(event) => {
              const raw = event.target.value;
              if (raw === "") return;
              const parsed = Number(raw);
              if (!Number.isFinite(parsed)) return;
              setForm({ ...form, minPublishedQuestionsForGoLive: parsed });
            }}
            placeholder="Tối thiểu câu Published"
            className="w-full rounded-lg border border-outline-variant px-3 py-2"
          />
          <input
            type="number"
            min={0}
            max={10_000}
            value={form.minApprovedTemplatesForGoLive}
            onChange={(event) => {
              const raw = event.target.value;
              if (raw === "") return;
              const parsed = Number(raw);
              if (!Number.isFinite(parsed)) return;
              setForm({ ...form, minApprovedTemplatesForGoLive: parsed });
            }}
            placeholder="Tối thiểu Mock Exam Template đã duyệt"
            className="w-full rounded-lg border border-outline-variant px-3 py-2"
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
            <option
              value="active"
              disabled={
                subject.visibility !== "active" &&
                !(
                  (form.minPublishedQuestionsForGoLive === 0 ||
                    subject.goLive.publishedQuestionCount >= form.minPublishedQuestionsForGoLive) &&
                  (form.minApprovedTemplatesForGoLive === 0 ||
                    subject.goLive.approvedTemplateCount >= form.minApprovedTemplatesForGoLive)
                )
              }
            >
              Hoạt động
            </option>
            <option value="archived">Lưu trữ</option>
          </select>
          <input
            value={form.topicTags}
            onChange={(event) => setForm({ ...form, topicTags: event.target.value })}
            className="w-full rounded-lg border border-outline-variant px-3 py-2"
          />
          <button
            type="submit"
            disabled={updateMutation.isPending || selectableCourses.length === 0}
            className="rounded-lg bg-primary px-4 py-2 text-label text-on-primary disabled:opacity-50"
          >
            {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      )}
      <Link href="/subjects" className="mt-4 inline-block text-primary underline">
        Quay lại danh sách
      </Link>
    </AdminPageShell>
  );
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
