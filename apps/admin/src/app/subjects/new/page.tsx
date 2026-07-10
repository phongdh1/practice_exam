"use client";

import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminRoleGate } from "@/components/admin-role-gate";
import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [form, setForm] = useState({
    courseId: "",
    code: "",
    name: "",
    description: "",
    monthlyAmountVnd: 50_000,
    freeTierLimit: 20,
    studyTierLimit: 5,
    displayOrder: 0,
    topicTags: "",
    minPublishedQuestionsForGoLive: 200,
    minApprovedTemplatesForGoLive: 1,
  });

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
        code: form.code,
        name: form.name,
        description: form.description || null,
        monthlyAmountVnd: form.monthlyAmountVnd,
        freeTierLimit: form.freeTierLimit,
        studyTierLimit: form.studyTierLimit,
        displayOrder: form.displayOrder,
        topicTags: parseTags(form.topicTags),
        minPublishedQuestionsForGoLive: form.minPublishedQuestionsForGoLive,
        minApprovedTemplatesForGoLive: form.minApprovedTemplatesForGoLive,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.subjects.admin });
      router.push("/subjects");
    },
  });

  return (
    <AdminPageShell title="Tạo môn học" subtitle="Course là bắt buộc; pricing vẫn ở cấp môn học.">
      <SubjectForm
        form={form}
        courses={selectableCourses}
        hasActiveCourses={selectableCourses.length > 0}
        saving={createMutation.isPending}
        submitLabel="Tạo môn học"
        onChange={setForm}
        onSubmit={() => createMutation.mutate()}
      />
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

function SubjectForm({
  form,
  courses,
  hasActiveCourses,
  saving,
  submitLabel,
  onChange,
  onSubmit,
}: {
  form: {
    courseId: string;
    code: string;
    name: string;
    description: string;
    monthlyAmountVnd: number;
    freeTierLimit: number;
    studyTierLimit: number;
    displayOrder: number;
    topicTags: string;
    minPublishedQuestionsForGoLive: number;
    minApprovedTemplatesForGoLive: number;
  };
  courses: Array<{ id: string; code: string; name: string; visibility: string }>;
  hasActiveCourses: boolean;
  saving: boolean;
  submitLabel: string;
  onChange: (form: {
    courseId: string;
    code: string;
    name: string;
    description: string;
    monthlyAmountVnd: number;
    freeTierLimit: number;
    studyTierLimit: number;
    displayOrder: number;
    topicTags: string;
    minPublishedQuestionsForGoLive: number;
    minApprovedTemplatesForGoLive: number;
  }) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="max-w-xl space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <select
        required
        value={form.courseId}
        onChange={(event) => onChange({ ...form, courseId: event.target.value })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2"
      >
        <option value="">Chọn Course</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.name} ({course.code})
          </option>
        ))}
      </select>
      <input
        required
        placeholder="Mã môn học"
        value={form.code}
        onChange={(event) => onChange({ ...form, code: event.target.value })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2"
      />
      <input
        required
        placeholder="Tên môn học"
        value={form.name}
        onChange={(event) => onChange({ ...form, name: event.target.value })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2"
      />
      <textarea
        placeholder="Mô tả"
        value={form.description}
        onChange={(event) => onChange({ ...form, description: event.target.value })}
        className="min-h-24 w-full rounded-lg border border-outline-variant px-3 py-2"
      />
      <input
        type="number"
        min={1}
        value={form.monthlyAmountVnd}
        onChange={(event) => onChange({ ...form, monthlyAmountVnd: Number(event.target.value) })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2"
      />
      <input
        type="number"
        min={1}
        value={form.freeTierLimit}
        onChange={(event) => onChange({ ...form, freeTierLimit: Number(event.target.value) })}
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
        onChange={(event) => onChange({ ...form, studyTierLimit: Number(event.target.value) })}
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
          onChange({ ...form, minPublishedQuestionsForGoLive: parsed });
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
          onChange({ ...form, minApprovedTemplatesForGoLive: parsed });
        }}
        placeholder="Tối thiểu Mock Exam Template đã duyệt"
        className="w-full rounded-lg border border-outline-variant px-3 py-2"
      />
      <input
        type="number"
        value={form.displayOrder}
        onChange={(event) => onChange({ ...form, displayOrder: Number(event.target.value) })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2"
      />
      <input
        placeholder="Topic tags, phân tách bằng dấu phẩy"
        value={form.topicTags}
        onChange={(event) => onChange({ ...form, topicTags: event.target.value })}
        className="w-full rounded-lg border border-outline-variant px-3 py-2"
      />
      <button
        type="submit"
        disabled={saving || !hasActiveCourses}
        className="rounded-lg bg-primary px-4 py-2 text-label text-on-primary disabled:opacity-50"
      >
        {saving ? "Đang lưu..." : submitLabel}
      </button>
    </form>
  );
}
