"use client";

import { MaterialIcon } from "@practice-exam/ui";
import type { SubjectGoLiveStatus } from "@practice-exam/types";
import Link from "next/link";

export type SubjectEditorVisibility = "active" | "archived";

export type SubjectEditorFormValues = {
  courseId: string;
  code: string;
  name: string;
  description: string;
  monthlyAmountVnd: number;
  freeTierLimit: number;
  studyTierLimit: number;
  displayOrder: number;
  visibility: SubjectEditorVisibility;
  topicTags: string;
  minPublishedQuestionsForGoLive: number;
  minApprovedTemplatesForGoLive: number;
};

export type SubjectEditorCourseOption = {
  id: string;
  code: string;
  name: string;
  visibility: string;
};

type SubjectEditorFormProps = {
  mode: "create" | "edit";
  form: SubjectEditorFormValues;
  courses: SubjectEditorCourseOption[];
  hasSelectableCourses: boolean;
  saving: boolean;
  submitLabel: string;
  error?: string | null;
  updatedAt?: string | null;
  goLive?: SubjectGoLiveStatus | null;
  /** Persisted server visibility — used for delete enablement (not unsaved toggle). */
  persistedVisibility?: SubjectEditorVisibility | null;
  onChange: (form: SubjectEditorFormValues) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  deleting?: boolean;
};

const MIN_MONTHLY_AMOUNT_VND = 10_000;

function parseFiniteNumber(raw: string): number | null {
  if (raw.trim() === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function canActivate(
  goLive: SubjectGoLiveStatus | null | undefined,
  form: SubjectEditorFormValues,
): boolean {
  if (!goLive) return false;
  const questionsOk =
    form.minPublishedQuestionsForGoLive === 0 ||
    goLive.publishedQuestionCount >= form.minPublishedQuestionsForGoLive;
  const templatesOk =
    form.minApprovedTemplatesForGoLive === 0 ||
    goLive.approvedTemplateCount >= form.minApprovedTemplatesForGoLive;
  return questionsOk && templatesOk;
}

function formatUpdatedAt(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("vi-VN");
}

function ToggleSwitch({
  checked,
  disabled,
  onChange,
  id,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
  id: string;
  label: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={[
        "relative inline-flex h-6 w-12 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-outline-variant",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "absolute h-5 w-5 rounded-full border-2 border-white bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}

export function SubjectEditorForm({
  mode,
  form,
  courses,
  hasSelectableCourses,
  saving,
  submitLabel,
  error,
  updatedAt,
  goLive,
  persistedVisibility = null,
  onChange,
  onSubmit,
  onDelete,
  deleting = false,
}: SubjectEditorFormProps) {
  const selectedCourse = courses.find((course) => course.id === form.courseId);
  const courseActive = selectedCourse?.visibility === "active";
  const activateAllowed =
    mode === "create" ? false : canActivate(goLive, form) && courseActive;
  const publicChecked = form.visibility === "active";
  const publicDisabled =
    mode === "create" ||
    (form.visibility !== "active" && !activateAllowed);
  const deleteEnabled =
    mode === "edit" &&
    persistedVisibility === "archived" &&
    Boolean(onDelete) &&
    !saving &&
    !deleting;

  return (
    <form
      className="mx-auto flex max-w-6xl flex-col gap-8 pb-12"
      onSubmit={(event) => {
        event.preventDefault();
        if (saving || deleting) return;
        onSubmit();
      }}
    >
      <div className="flex flex-col items-stretch justify-between gap-4 border-b border-outline-variant pb-6 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-heading text-primary">Thông tin môn học</h3>
          <p className="text-sm text-on-surface-variant">
            {mode === "create"
              ? "Vui lòng điền đầy đủ các thông tin bắt buộc để thiết lập môn học mới."
              : "Cập nhật thông tin, gói học và trạng thái hiển thị của môn học."}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/subjects"
            className="rounded-lg border border-primary px-6 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary-fixed"
          >
            Hủy bỏ
          </Link>
          <button
            type="submit"
            disabled={saving || deleting || !hasSelectableCourses}
            className="flex items-center gap-2 rounded-lg bg-primary px-8 py-2 text-sm font-bold text-on-primary shadow-sm transition-all duration-150 hover:shadow-md active:scale-95 disabled:opacity-50"
          >
            <MaterialIcon name="save" size={16} />
            {saving ? "Đang lưu..." : submitLabel}
          </button>
        </div>
      </div>

      {!hasSelectableCourses && (
        <p className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-body-sm text-ink-muted">
          Cần ít nhất một Course đang hoạt động để lưu môn học.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-error/30 bg-error-container px-4 py-2 text-body-sm text-on-error-container"
        >
          {error}
        </p>
      )}

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 flex flex-col gap-8 lg:col-span-8">
          <div className="flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-primary">
                  Tên môn học <span className="text-error">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(event) => onChange({ ...form, name: event.target.value })}
                  placeholder="VD: Pháp luật đất đai"
                  className="w-full rounded-lg border border-outline-variant px-4 py-3 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-primary">
                  Mã môn học <span className="text-error">*</span>
                </label>
                <input
                  required={mode === "create"}
                  value={form.code}
                  readOnly={mode === "edit"}
                  onChange={(event) =>
                    onChange({ ...form, code: event.target.value.toUpperCase() })
                  }
                  placeholder="VD: PLDD-01"
                  className="w-full rounded-lg border border-outline-variant px-4 py-3 uppercase outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary read-only:bg-surface-container-low read-only:text-ink-muted"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label text-label text-primary">Mô tả chi tiết</label>
              <textarea
                value={form.description}
                onChange={(event) => onChange({ ...form, description: event.target.value })}
                placeholder="Nhập mô tả về mục tiêu và nội dung chính của môn học..."
                rows={4}
                className="w-full resize-none rounded-lg border border-outline-variant px-4 py-3 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <h4 className="mb-6 flex items-center gap-2 font-heading text-heading text-primary">
              <MaterialIcon name="payments" size={20} className="text-primary" />
              Cấu hình Gói học &amp; Giới hạn
            </h4>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div className="flex flex-col gap-4">
                <label className="font-label text-label text-primary">Học phí hàng tháng (VND)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={MIN_MONTHLY_AMOUNT_VND}
                    step={1}
                    required
                    value={form.monthlyAmountVnd}
                    onChange={(event) => {
                      const parsed = parseFiniteNumber(event.target.value);
                      if (parsed === null) return;
                      onChange({ ...form, monthlyAmountVnd: parsed });
                    }}
                    className="w-full rounded-lg border border-outline-variant py-3 pl-4 pr-16 font-bold outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-on-surface-variant">
                    VND
                  </span>
                </div>
                <p className="text-xs text-ink-muted">
                  Giá niêm yết sẽ được hiển thị cho người dùng cuối trên Landing Page.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <label className="font-label text-label text-primary">
                  Giới hạn câu hỏi Miễn phí
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={form.freeTierLimit}
                    onChange={(event) => {
                      const parsed = parseFiniteNumber(event.target.value);
                      if (parsed === null) return;
                      onChange({ ...form, freeTierLimit: parsed });
                    }}
                    className="flex-1 rounded-lg border border-outline-variant px-4 py-3 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-on-surface-variant">Câu</span>
                </div>
                <p className="text-xs text-ink-muted">
                  Số lượng câu hỏi tối đa người dùng chưa đăng ký được phép ôn tập.
                </p>
              </div>
            </div>
            <div className="mt-8 flex gap-4 rounded-lg border border-disclaimer-border bg-disclaimer-bg p-4">
              <MaterialIcon name="info" size={20} className="shrink-0 text-warning" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-tertiary">Lưu ý về Gói Miễn Phí</p>
                <p className="text-xs leading-relaxed text-on-tertiary-fixed-variant">
                  Người dùng đạt đến giới hạn này sẽ nhận được thông báo yêu cầu nâng cấp gói hội
                  viên để tiếp tục học tập. Giới hạn tối thiểu hiện tại là 1 câu (theo API).
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <h4 className="mb-4 font-heading text-heading text-primary">Cấu hình nâng cao</h4>
            {mode === "edit" && goLive && (
              <div className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-body-sm text-ink-muted">
                Go-live: {goLive.publishedQuestionCount}/{form.minPublishedQuestionsForGoLive} câu
                hỏi, {goLive.approvedTemplateCount}/{form.minApprovedTemplatesForGoLive} template.
                {!goLive.canActivate && form.visibility === "archived" && !activateAllowed && (
                  <span className="mt-1 block text-on-error-container">
                    Chưa đủ điều kiện kích hoạt — cần đạt đủ ngưỡng trên trước khi chuyển sang Hoạt
                    động.
                  </span>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="font-label text-label text-primary">
                  Course <span className="text-error">*</span>
                </label>
                <select
                  required
                  value={form.courseId}
                  onChange={(event) => onChange({ ...form, courseId: event.target.value })}
                  className="w-full rounded-lg border border-outline-variant px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Chọn Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                      {course.visibility === "archived" ? " - lưu trữ" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-primary">Study Tier limit</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={form.studyTierLimit}
                  onChange={(event) => {
                    const parsed = parseFiniteNumber(event.target.value);
                    if (parsed === null) return;
                    onChange({ ...form, studyTierLimit: parsed });
                  }}
                  className="w-full rounded-lg border border-outline-variant px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <p className="text-caption text-ink-muted">
                  Số lần xem đáp án + giải thích miễn phí mỗi tháng (Study Mode)
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-primary">Thứ tự hiển thị</label>
                <input
                  type="number"
                  step={1}
                  value={form.displayOrder}
                  onChange={(event) => {
                    const parsed = parseFiniteNumber(event.target.value);
                    if (parsed === null) return;
                    onChange({ ...form, displayOrder: parsed });
                  }}
                  className="w-full rounded-lg border border-outline-variant px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-primary">
                  Tối thiểu câu Published (go-live)
                </label>
                <input
                  type="number"
                  min={0}
                  max={10_000}
                  value={form.minPublishedQuestionsForGoLive}
                  onChange={(event) => {
                    const parsed = parseFiniteNumber(event.target.value);
                    if (parsed === null) return;
                    onChange({ ...form, minPublishedQuestionsForGoLive: parsed });
                  }}
                  className="w-full rounded-lg border border-outline-variant px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-label text-primary">
                  Tối thiểu Mock Exam Template đã duyệt
                </label>
                <input
                  type="number"
                  min={0}
                  max={10_000}
                  value={form.minApprovedTemplatesForGoLive}
                  onChange={(event) => {
                    const parsed = parseFiniteNumber(event.target.value);
                    if (parsed === null) return;
                    onChange({ ...form, minApprovedTemplatesForGoLive: parsed });
                  }}
                  className="w-full rounded-lg border border-outline-variant px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label className="font-label text-label text-primary">Topic tags</label>
                <input
                  value={form.topicTags}
                  onChange={(event) => onChange({ ...form, topicTags: event.target.value })}
                  placeholder="Phân tách bằng dấu phẩy"
                  className="w-full rounded-lg border border-outline-variant px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 flex flex-col gap-8 lg:col-span-4">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <h4 className="mb-4 font-heading text-heading text-primary">Ảnh bìa môn học</h4>
            <div
              role="img"
              aria-label="Ảnh bìa môn học — tải lên chưa khả dụng"
              className="relative flex aspect-video cursor-not-allowed flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-outline-variant bg-surface-container-low opacity-80"
            >
              <div className="z-10 flex flex-col items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest/90 p-4 shadow-sm">
                <MaterialIcon name="cloud_upload" size={24} className="text-primary" />
                <span className="text-xs font-bold text-primary">Thay đổi ảnh</span>
                <span className="text-[10px] text-ink-muted">Chưa khả dụng</span>
              </div>
            </div>
            <p className="mt-3 text-center text-[10px] italic text-ink-muted">
              Tỷ lệ khuyến nghị 16:9. Định dạng .JPG hoặc .PNG (Tối đa 2MB)
            </p>
          </div>

          <div className="flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <h4 className="font-heading text-heading text-primary">Trạng thái hiển thị</h4>
            <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-on-surface">Công khai</span>
                <span className="text-xs text-ink-muted">Cho phép học viên nhìn thấy</span>
              </div>
              <ToggleSwitch
                id="subject-public-toggle"
                label="Công khai"
                checked={publicChecked}
                disabled={publicDisabled}
                onChange={(next) =>
                  onChange({ ...form, visibility: next ? "active" : "archived" })
                }
              />
            </div>
            {mode === "edit" && publicDisabled && form.visibility === "archived" && (
              <p className="text-caption text-on-error-container">
                {!courseActive && form.courseId
                  ? "Course đang lưu trữ — không thể công khai môn học."
                  : "Chưa đủ điều kiện go-live để công khai môn học."}
              </p>
            )}
            {mode === "create" && (
              <p className="text-caption text-ink-muted">
                Môn học mới tạo ở trạng thái lưu trữ; kích hoạt sau khi đủ go-live trên màn sửa.
              </p>
            )}
            <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-on-surface">Gắn nhãn &quot;Hot&quot;</span>
                <span className="text-xs text-ink-muted">Ưu tiên xuất hiện đầu bảng — chưa khả dụng</span>
              </div>
              <ToggleSwitch id="subject-hot-toggle" label='Gắn nhãn "Hot"' checked={false} disabled />
            </div>
            <div className="flex flex-col gap-4 border-t border-outline-variant pt-4">
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <MaterialIcon name="event" size={16} />
                Cập nhật lần cuối: {formatUpdatedAt(updatedAt)}
              </div>
              {mode === "edit" && onDelete && (
                <button
                  type="button"
                  disabled={!deleteEnabled || deleting}
                  onClick={onDelete}
                  className="flex items-center justify-center gap-2 rounded-lg border border-error/40 py-3 text-xs font-bold uppercase tracking-wide text-error transition-colors hover:bg-error-container disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <MaterialIcon name="delete" size={16} />
                  {deleting ? "Đang xóa..." : "Xóa môn học này"}
                </button>
              )}
              {mode === "edit" && persistedVisibility !== "archived" && (
                <p className="text-caption text-ink-muted">
                  Chỉ xóa được môn học đang lưu trữ (đã lưu). Lưu trữ rồi nhấn Lưu trước khi xóa.
                </p>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-primary p-6 text-on-primary shadow-lg opacity-90">
            <div className="pointer-events-none absolute -bottom-4 -right-4 opacity-10">
              <MaterialIcon name="trending_up" size={120} />
            </div>
            <h5 className="mb-4 text-xs font-bold uppercase tracking-widest text-on-primary/60">
              Hiệu suất môn học
            </h5>
            <div className="flex flex-col gap-1">
              <p className="text-3xl font-bold">—</p>
              <p className="text-xs text-on-primary/80">Học viên đang đăng ký</p>
            </div>
            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-0 rounded-full bg-accent" />
            </div>
            <p className="mt-2 text-[10px] text-on-primary/60">Chưa có dữ liệu hiệu suất</p>
          </div>
        </div>
      </div>
    </form>
  );
}

export function parseSubjectTopicTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}
