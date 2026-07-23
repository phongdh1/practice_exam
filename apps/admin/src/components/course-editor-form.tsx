"use client";

import { MaterialIcon } from "@practice-exam/ui";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CoverImagePreview } from "@/components/cover-image-preview";
import { parseCoverImageUrlInput } from "@/lib/cover-image-url";

export type CourseEditorVisibility = "active" | "archived";

export type CourseEditorFormValues = {
  code: string;
  name: string;
  description: string;
  displayOrder: number;
  coverImageUrl: string | null;
  visibility: CourseEditorVisibility;
};

type CourseEditorFormProps = {
  mode: "create" | "edit";
  form: CourseEditorFormValues;
  saving: boolean;
  submitLabel: string;
  error?: string | null;
  uploadingCover?: boolean;
  coverUploadError?: string | null;
  subjectCount?: number;
  deleting?: boolean;
  onChange: (
    form: CourseEditorFormValues | ((prev: CourseEditorFormValues) => CourseEditorFormValues),
  ) => void;
  onSubmit: () => void;
  onUploadCover?: (file: File) => Promise<void>;
  onDelete?: () => void;
};

const COVER_ACCEPT = "image/jpeg,image/png,image/webp";
const COVER_MAX_BYTES = 5 * 1024 * 1024;

function parseFiniteNumber(raw: string): number | null {
  if (raw.trim() === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

/** First letter of each whitespace token → strip diacritics → uppercase. */
export function suggestCourseCodeFromName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const letter = [...token].find((char) => /\p{L}/u.test(char));
      if (!letter) return "";
      return letter
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toUpperCase();
    })
    .join("")
    .slice(0, 64);
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

export function CourseEditorForm({
  mode,
  form,
  saving,
  submitLabel,
  error,
  uploadingCover = false,
  coverUploadError = null,
  subjectCount = 0,
  deleting = false,
  onChange,
  onSubmit,
  onUploadCover,
  onDelete,
}: CourseEditorFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localCoverError, setLocalCoverError] = useState<string | null>(null);
  const [coverUrlDraft, setCoverUrlDraft] = useState(form.coverImageUrl ?? "");
  const [coverUrlError, setCoverUrlError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);

  useEffect(() => {
    setCoverUrlDraft(form.coverImageUrl ?? "");
    setCoverUrlError(null);
  }, [form.coverImageUrl]);

  const applyCoverUrlDraft = (raw: string) => {
    setCoverUrlDraft(raw);
    const parsed = parseCoverImageUrlInput(raw);
    if (!parsed.ok) {
      setCoverUrlError(parsed.error);
      return;
    }
    setCoverUrlError(null);
    onChange((prev) => ({ ...prev, coverImageUrl: parsed.value }));
  };

  const commitCoverUrlDraft = () => {
    const parsed = parseCoverImageUrlInput(coverUrlDraft);
    if (!parsed.ok) {
      setCoverUrlDraft(form.coverImageUrl ?? "");
      setCoverUrlError(null);
      return;
    }
    setCoverUrlError(null);
    setCoverUrlDraft(parsed.value ?? "");
    if (parsed.value !== form.coverImageUrl) {
      onChange((prev) => ({ ...prev, coverImageUrl: parsed.value }));
    }
  };

  const deleteEnabled =
    mode === "edit" && subjectCount === 0 && Boolean(onDelete) && !saving && !deleting;

  const applyNameChange = (name: string) => {
    if (mode === "create" && !codeManuallyEdited) {
      onChange((prev) => ({
        ...prev,
        name,
        code: suggestCourseCodeFromName(name),
      }));
      return;
    }
    onChange((prev) => ({ ...prev, name }));
  };

  const applyCodeChange = (raw: string) => {
    const code = raw.toUpperCase().slice(0, 64);
    if (code.trim() === "") {
      setCodeManuallyEdited(false);
      onChange((prev) => ({
        ...prev,
        code: mode === "create" ? suggestCourseCodeFromName(prev.name) : "",
      }));
      return;
    }
    setCodeManuallyEdited(true);
    onChange((prev) => ({ ...prev, code }));
  };

  const handleCoverPick = async (file: File | undefined) => {
    setLocalCoverError(null);
    if (!file || !onUploadCover || uploadingCover || saving) return;
    if (!COVER_ACCEPT.split(",").includes(file.type)) {
      setLocalCoverError("Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.");
      return;
    }
    if (file.size > COVER_MAX_BYTES) {
      setLocalCoverError("Ảnh tối đa 5MB.");
      return;
    }
    await onUploadCover(file);
  };

  const previewTitle = form.name.trim() || "Tên khóa học";
  const previewCode = form.code.trim() || "MÃ-KHÓA-HỌC";

  return (
    <form
      className="mx-auto flex max-w-6xl flex-col gap-8 pb-12"
      onSubmit={(event) => {
        event.preventDefault();
        if (saving || deleting || uploadingCover || coverUrlError) return;
        const parsed = parseCoverImageUrlInput(coverUrlDraft);
        if (!parsed.ok) {
          setCoverUrlError(parsed.error);
          return;
        }
        onSubmit();
      }}
    >
      <div className="flex flex-col items-stretch justify-end gap-4 border-b border-outline-variant pb-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4 sm:ml-auto">
          <Link
            href="/courses"
            className="rounded-lg border border-outline-variant bg-surface-container-low px-6 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={saving || deleting || uploadingCover}
            className="flex items-center gap-2 rounded-lg bg-primary px-8 py-2 text-sm font-bold text-on-primary shadow-sm transition-all duration-150 hover:shadow-md active:scale-95 disabled:opacity-50"
          >
            <MaterialIcon name="save" size={16} />
            {saving ? "Đang lưu..." : submitLabel}
          </button>
        </div>
      </div>

      {(error || coverUploadError || localCoverError) && (
        <p
          role="alert"
          className="rounded-lg border border-error/30 bg-error-container px-4 py-2 text-body-sm text-on-error-container"
        >
          {error || coverUploadError || localCoverError}
        </p>
      )}

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 flex flex-col gap-8 lg:col-span-8">
          <div className="flex flex-col gap-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <h3 className="font-heading text-heading text-primary">Thông tin cơ bản</h3>

            <div className="flex flex-col gap-2">
              <label className="font-label text-label text-primary">
                Tên khóa học <span className="text-error">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={(event) => applyNameChange(event.target.value)}
                placeholder="Nhập tên khóa học đầy đủ"
                className="w-full rounded-lg border border-outline-variant px-4 py-3 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label text-label text-primary">
                Mã khóa học <span className="text-error">*</span>
              </label>
              <input
                required
                value={form.code}
                onChange={(event) => applyCodeChange(event.target.value)}
                placeholder="VD: CVM"
                className="w-full rounded-lg border border-outline-variant px-4 py-3 uppercase outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {mode === "create" && (
                <p className="text-caption text-ink-muted">
                  Tự sinh từ chữ cái đầu mỗi từ trong tên khóa học (bỏ dấu, chữ hoa). Bạn có thể sửa.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label text-label text-primary">Mô tả khóa học</label>
              <textarea
                value={form.description}
                onChange={(event) => onChange({ ...form, description: event.target.value })}
                placeholder="Mô tả chi tiết về nội dung và mục tiêu của khóa học..."
                rows={5}
                className="w-full resize-none rounded-lg border border-outline-variant px-4 py-3 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-2 sm:max-w-xs">
              <label className="font-label text-label text-primary">Thứ tự hiển thị</label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  step={1}
                  value={form.displayOrder}
                  onChange={(event) => {
                    const parsed = parseFiniteNumber(event.target.value);
                    if (parsed === null) return;
                    onChange({ ...form, displayOrder: parsed });
                  }}
                  className="w-24 rounded-lg border border-outline-variant px-4 py-3 outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <span className="text-xs text-on-surface-variant">
                  (Số càng nhỏ ưu tiên càng cao)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <h3 className="font-heading text-heading text-primary">Ảnh bìa &amp; Banner</h3>
            <p className="text-sm font-medium text-on-surface">Upload Ảnh Bìa Khóa học</p>

            <input
              ref={fileInputRef}
              type="file"
              accept={COVER_ACCEPT}
              className="hidden"
              onChange={(event) => {
                void handleCoverPick(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            <button
              type="button"
              disabled={!onUploadCover || uploadingCover || saving}
              aria-label="Tải ảnh bìa khóa học"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                void handleCoverPick(event.dataTransfer.files?.[0]);
              }}
              className={[
                "relative flex min-h-[180px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant bg-surface-container-low",
                !onUploadCover || uploadingCover || saving
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:border-primary/60",
              ].join(" ")}
            >
              {form.coverImageUrl ? (
                <CoverImagePreview
                  src={form.coverImageUrl}
                  alt="Ảnh bìa khóa học"
                  className="absolute inset-0 z-0 h-full w-full object-cover"
                />
              ) : null}
              <div
                className={[
                  "z-10 flex flex-col items-center gap-2",
                  form.coverImageUrl
                    ? "rounded-lg border border-outline-variant bg-surface-container-lowest/75 p-3 shadow-sm backdrop-blur-[2px]"
                    : "",
                ].join(" ")}
              >
                <MaterialIcon name="cloud_upload" size={36} className="text-primary" />
                <span className="text-sm font-medium text-on-surface">
                  {uploadingCover
                    ? "Đang tải..."
                    : form.coverImageUrl
                      ? "Thay đổi ảnh"
                      : "Kéo thả file vào đây hoặc chọn từ máy tính"}
                </span>
              </div>
            </button>

            {form.coverImageUrl && (
              <button
                type="button"
                disabled={uploadingCover}
                className="text-xs font-medium text-error hover:underline disabled:opacity-40"
                onClick={() => {
                  if (uploadingCover) return;
                  setCoverUrlDraft("");
                  setCoverUrlError(null);
                  onChange((prev) => ({ ...prev, coverImageUrl: null }));
                }}
              >
                Xóa ảnh bìa
              </button>
            )}

            <div className="space-y-1.5">
              <label htmlFor="course-cover-url" className="text-xs font-medium text-on-surface">
                Hoặc dán link ảnh
              </label>
              <input
                id="course-cover-url"
                type="text"
                inputMode="url"
                autoComplete="off"
                placeholder="https://..."
                value={coverUrlDraft}
                disabled={uploadingCover || saving}
                onChange={(event) => applyCoverUrlDraft(event.target.value)}
                onBlur={commitCoverUrlDraft}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary disabled:opacity-60"
              />
              {coverUrlError ? (
                <p className="text-xs text-error" role="alert">
                  {coverUrlError}
                </p>
              ) : (
                <p className="text-xs text-on-surface-variant">
                  Dùng URL http:// hoặc https://. Ảnh sẽ xem trước ngay khi link hợp lệ.
                </p>
              )}
              {form.coverImageUrl ? (
                <div className="relative mt-2 aspect-video overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low">
                  <CoverImagePreview
                    src={form.coverImageUrl}
                    alt="Xem trước ảnh bìa khóa học"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            <p className="text-xs text-on-surface-variant">
              Định dạng JPG, PNG hoặc WebP. Dung lượng tối đa 5MB.
            </p>
          </div>
        </div>

        <div className="col-span-12 flex flex-col gap-8 lg:col-span-4">
          <div className="rounded-xl border border-warning/40 bg-warning/10 p-5">
            <div className="mb-3 flex items-center gap-2">
              <MaterialIcon name="info" size={20} className="text-warning" filled />
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                Lưu ý quan trọng
              </h4>
            </div>
            <ul className="list-disc space-y-2 pl-5 text-xs leading-relaxed text-on-surface-variant">
              <li>
                Mã khóa học phải <strong className="text-on-surface">duy nhất</strong> trong hệ
                thống, không chứa ký tự đặc biệt hoặc khoảng trắng.
              </li>
              {mode === "create" ? (
                <li>
                  Mã được gợi ý tự động từ chữ cái đầu mỗi từ trong tên (ví dụ:{" "}
                  <code className="text-on-surface">Chuyên viên Môi giới</code> →{" "}
                  <code className="text-on-surface">CVMG</code>).
                </li>
              ) : (
                <li>
                  Có thể chỉnh mã khóa học; thay đổi phải giữ tính duy nhất trong hệ thống.
                </li>
              )}
              <li>
                Tên khóa học nên ngắn gọn và chứa từ khóa chuyên môn liên quan đến chứng chỉ.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
            <h4 className="mb-4 font-heading text-sm font-bold text-on-surface">
              Xem trước thẻ khóa học
            </h4>
            <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low shadow-sm">
              <div className="relative aspect-[16/9] bg-primary/10">
                {form.coverImageUrl ? (
                  <CoverImagePreview
                    src={form.coverImageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-surface-container-high">
                    <MaterialIcon name="school" size={40} className="text-primary/40" />
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <p className="truncate text-sm font-bold text-primary">{previewTitle}</p>
                <p className="font-mono text-[11px] text-on-surface-variant">{previewCode}</p>
                {form.description.trim() ? (
                  <p className="line-clamp-2 text-xs text-on-surface-variant">
                    {form.description.trim()}
                  </p>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    <div className="h-2 w-full rounded bg-outline-variant/60" />
                    <div className="h-2 w-2/3 rounded bg-outline-variant/40" />
                  </div>
                )}
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-on-surface-variant">
              Đây là cách khóa học hiển thị với người dùng cuối.
            </p>
          </div>

          {mode === "edit" && (
            <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
              <h4 className="font-heading text-sm font-bold text-on-surface">Trạng thái hiển thị</h4>
              <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-on-surface">Công khai</span>
                  <span className="text-xs text-ink-muted">Cho phép hiển thị trên danh mục</span>
                </div>
                <ToggleSwitch
                  id="course-public-toggle"
                  label="Công khai"
                  checked={form.visibility === "active"}
                  onChange={(next) =>
                    onChange({ ...form, visibility: next ? "active" : "archived" })
                  }
                />
              </div>
              {onDelete && (
                <>
                  <button
                    type="button"
                    disabled={!deleteEnabled || deleting}
                    onClick={onDelete}
                    className="flex items-center justify-center gap-2 rounded-lg border border-error/40 py-3 text-xs font-bold uppercase tracking-wide text-error transition-colors hover:bg-error-container disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <MaterialIcon name="delete" size={16} />
                    {deleting ? "Đang xóa..." : "Xóa khóa học này"}
                  </button>
                  {subjectCount > 0 && (
                    <p className="text-caption text-ink-muted">
                      Không thể xóa khóa học còn {subjectCount} môn học.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {mode === "create" && (
            <p className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-caption text-ink-muted">
              Khóa học mới được tạo ở trạng thái lưu trữ. Kích hoạt sau trên màn sửa hoặc danh sách.
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
