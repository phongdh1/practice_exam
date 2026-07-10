"use client";

import type { QuestionStatusType } from "@practice-exam/types";
import { Badge, MaterialIcon } from "@practice-exam/ui";
import Link from "next/link";
import {
  applyQuestionTypeChange,
  type QuestionEditorFormState,
} from "@/lib/question-editor";

const STATUS_LABELS: Record<QuestionStatusType, string> = {
  draft: "Nháp",
  in_review: "Chờ duyệt",
  published: "Đã xuất bản",
  archived: "Lưu trữ",
};

const QUESTION_TYPE_LABELS = {
  single_choice: "Một lựa chọn",
  multiple_choice: "Nhiều lựa chọn",
  true_false: "Đúng/Sai",
} as const;

const DIFFICULTY_LABELS = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
} as const;

type CourseOption = { id: string; code: string; name: string; visibility: string };
type SubjectOption = { id: string; courseId: string; code: string; name: string };

export function QuestionEditorForm({
  mode,
  form,
  status,
  subjectName,
  duplicateWarning,
  readOnly = false,
  saving = false,
  submitting = false,
  error,
  courses,
  subjects,
  questionId,
  onChange,
  onSave,
  onSubmitForReview,
}: {
  mode: "create" | "edit";
  form: QuestionEditorFormState;
  questionId?: string;
  status?: QuestionStatusType;
  subjectName?: string;
  duplicateWarning?: { matchingQuestionId: string; stem: string } | null;
  readOnly?: boolean;
  saving?: boolean;
  submitting?: boolean;
  error?: string | null;
  courses: CourseOption[];
  subjects: SubjectOption[];
  onChange: (form: QuestionEditorFormState) => void;
  onSave: () => void;
  onSubmitForReview?: () => void;
}) {
  const filteredSubjects = subjects.filter((subject) => subject.courseId === form.courseId);
  const optionSlots =
    form.questionType === "true_false"
      ? form.options.filter((option) => option.key === "A" || option.key === "B")
      : form.options;

  const correctHint =
    form.questionType === "multiple_choice"
      ? "Chọn nhiều đáp án đúng"
      : "Chọn 1 đáp án đúng";

  const toggleCorrectKey = (key: string) => {
    if (readOnly) return;

    if (form.questionType === "multiple_choice") {
      const next = form.correctOptionKeys.includes(key)
        ? form.correctOptionKeys.filter((item) => item !== key)
        : [...form.correctOptionKeys, key];
      onChange({ ...form, correctOptionKeys: next });
      return;
    }

    onChange({ ...form, correctOptionKeys: [key] });
  };

  const updateOptionText = (key: string, text: string) => {
    if (readOnly || form.questionType === "true_false") return;
    onChange({
      ...form,
      options: form.options.map((option) => (option.key === key ? { ...option, text } : option)),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {status && (
            <Badge variant="secondary" className="mb-2">
              {STATUS_LABELS[status]}
            </Badge>
          )}
          {status === "published" && mode === "edit" && (
            <p className="text-body-sm text-ink-muted">
              Chỉnh sửa câu hỏi đã xuất bản sẽ tạo bản nháp mới cần duyệt lại.
            </p>
          )}
          {readOnly && status === "in_review" && (
            <p className="text-body-sm text-warning">
              Câu hỏi đang chờ duyệt — không thể chỉnh sửa. Xem tại{" "}
              <Link href="/review" className="text-primary underline">
                hàng đợi duyệt
              </Link>
              .
            </p>
          )}
          {readOnly && status === "archived" && (
            <p className="text-body-sm text-ink-muted">Câu hỏi đã lưu trữ — chỉ xem.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/questions"
            className="rounded-lg border border-outline px-4 py-2 text-label hover:bg-surface-container-low"
          >
            Hủy
          </Link>
          {mode === "edit" && questionId && (
            <Link
              href={`/questions/${questionId}/preview`}
              className="rounded-lg border border-outline px-4 py-2 text-label hover:bg-surface-container-low"
            >
              Xem trước
            </Link>
          )}
          {!readOnly && (
            <>
              <button
                type="button"
                disabled={saving || submitting}
                onClick={onSave}
                className="rounded-lg border-2 border-primary px-4 py-2 text-label font-bold text-primary hover:bg-primary/5 disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu bản nháp"}
              </button>
              {mode === "edit" && status === "draft" && onSubmitForReview && (
                <button
                  type="button"
                  disabled={saving || submitting}
                  onClick={onSubmitForReview}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label font-bold text-on-primary disabled:opacity-50"
                >
                  <MaterialIcon name="send" size={18} />
                  {submitting ? "Đang gửi..." : "Gửi duyệt"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {duplicateWarning && (
        <div className="rounded-xl border border-warning/40 bg-warning-muted p-4 text-body-sm text-on-surface">
          <p className="font-medium text-warning">Cảnh báo trùng nội dung</p>
          <p className="mt-1 text-ink-muted">
            Câu hỏi tương tự đã tồn tại.{" "}
            <Link
              href={`/questions/${duplicateWarning.matchingQuestionId}/edit`}
              className="text-primary underline"
            >
              Xem câu hỏi trùng
            </Link>
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-error/30 bg-error-muted p-4 text-body-sm text-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="flex flex-col gap-6 xl:col-span-8">
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MaterialIcon name="description" size={20} className="text-primary" />
              <h3 className="text-heading font-semibold text-primary">Nội dung câu hỏi</h3>
            </div>
            <textarea
              required
              disabled={readOnly}
              value={form.stem}
              onChange={(event) => onChange({ ...form, stem: event.target.value })}
              placeholder="Nhập câu hỏi tại đây..."
              className="min-h-40 w-full resize-y rounded-lg border border-outline-variant bg-surface-subtle p-4 text-body focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
            />
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MaterialIcon name="checklist" size={20} className="text-primary" />
                <h3 className="text-heading font-semibold text-primary">Các phương án trả lời</h3>
              </div>
              <span className="rounded bg-secondary-container px-2 py-1 text-caption text-on-secondary-container">
                {correctHint}
              </span>
            </div>

            <div className="space-y-4">
              {optionSlots.map((option) => {
                const isCorrect = form.correctOptionKeys.includes(option.key);
                return (
                  <div key={option.key} className="flex items-start gap-4">
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => toggleCorrectKey(option.key)}
                      className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-bold transition-colors disabled:cursor-not-allowed ${
                        isCorrect
                          ? "border-primary bg-primary-container text-on-primary-container"
                          : "border-outline-variant text-ink-muted hover:border-primary"
                      }`}
                      aria-pressed={isCorrect}
                      aria-label={`Đáp án ${option.key}`}
                    >
                      {option.key}
                    </button>
                    <input
                      type="text"
                      disabled={readOnly || form.questionType === "true_false"}
                      value={option.text}
                      onChange={(event) => updateOptionText(option.key, event.target.value)}
                      placeholder={`Phương án ${option.key}`}
                      className="w-full rounded-lg border border-outline-variant px-4 py-3 text-body focus:border-primary focus:outline-none disabled:bg-surface-container-low disabled:opacity-80"
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MaterialIcon name="lightbulb" size={20} className="text-success" />
              <h3 className="text-heading font-semibold text-primary">Giải thích đáp án</h3>
            </div>
            <textarea
              disabled={readOnly}
              value={form.explanation}
              onChange={(event) => onChange({ ...form, explanation: event.target.value })}
              placeholder="Giải thích tại sao đáp án trên là đúng..."
              className="min-h-28 w-full resize-y rounded-lg border border-outline-variant bg-surface-subtle p-4 text-body focus:border-success focus:outline-none focus:ring-2 focus:ring-success/20 disabled:opacity-70"
            />
          </section>
        </div>

        <aside className="flex flex-col gap-6 xl:col-span-4">
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <h3 className="mb-4 text-heading font-semibold text-primary">Phân loại</h3>
            <div className="space-y-4">
              {mode === "create" ? (
                <>
                  <Field label="Course">
                    <select
                      required
                      disabled={readOnly}
                      value={form.courseId}
                      onChange={(event) =>
                        onChange({ ...form, courseId: event.target.value, subjectId: "" })
                      }
                      className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body"
                    >
                      <option value="">Chọn Course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name} ({course.code})
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Môn học">
                    <select
                      required
                      disabled={readOnly || !form.courseId}
                      value={form.subjectId}
                      onChange={(event) => onChange({ ...form, subjectId: event.target.value })}
                      className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body"
                    >
                      <option value="">Chọn môn học</option>
                      {filteredSubjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </option>
                      ))}
                    </select>
                  </Field>
                </>
              ) : (
                <Field label="Môn học">
                  <p className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-body">
                    {subjectName ?? "—"}
                  </p>
                </Field>
              )}

              <Field label="Loại câu hỏi">
                <select
                  disabled={readOnly}
                  value={form.questionType}
                  onChange={(event) =>
                    onChange(
                      applyQuestionTypeChange(
                        form,
                        event.target.value as QuestionEditorFormState["questionType"],
                      ),
                    )
                  }
                  className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body"
                >
                  {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Độ khó">
                <select
                  disabled={readOnly}
                  value={form.difficulty}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      difficulty: event.target.value as QuestionEditorFormState["difficulty"],
                    })
                  }
                  className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body"
                >
                  {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Chủ đề (tags)">
                <input
                  disabled={readOnly}
                  value={form.tags}
                  onChange={(event) => onChange({ ...form, tags: event.target.value })}
                  placeholder="tag1, tag2, tag3"
                  className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body"
                />
              </Field>

              <Field label="Nguồn tham khảo">
                <input
                  disabled={readOnly}
                  value={form.sourceRef}
                  onChange={(event) => onChange({ ...form, sourceRef: event.target.value })}
                  placeholder="Luật, nghị định, sách giáo khoa..."
                  className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body"
                />
              </Field>

              <Field label="URL hình ảnh (mỗi dòng một URL)">
                <textarea
                  disabled={readOnly}
                  value={form.imageUrls}
                  onChange={(event) => onChange({ ...form, imageUrls: event.target.value })}
                  placeholder="https://..."
                  className="min-h-24 w-full resize-y rounded-lg border border-outline-variant px-3 py-2 text-body"
                />
              </Field>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-label text-on-surface-variant">{label}</label>
      {children}
    </div>
  );
}
