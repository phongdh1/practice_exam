import { parseCoverImageUrlInput, type CoverImageUrlParseResult } from "./cover-image-url";

export const COVER_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const COVER_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

/** Course and subject covers support remote URLs and inline images selected from a file. */
export function parseCoverImageInput(raw: string): CoverImageUrlParseResult {
  const value = raw.trim();
  if (!value.startsWith("data:")) return parseCoverImageUrlInput(value);
  const match = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match || match[1].length % 4 !== 0) {
    return { ok: false, error: "Ảnh không hợp lệ. Chọn ảnh JPEG, PNG hoặc WebP." };
  }
  const padding = match[1].endsWith("==") ? 2 : match[1].endsWith("=") ? 1 : 0;
  if (match[1].length / 4 * 3 - padding > COVER_IMAGE_MAX_BYTES) {
    return { ok: false, error: "Ảnh tối đa 10MB." };
  }
  return { ok: true, value };
}

export async function readCoverImage(file: File): Promise<string> {
  if (!COVER_IMAGE_ACCEPT.split(",").includes(file.type)) {
    throw new Error("Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.");
  }
  if (file.size === 0) throw new Error("File ảnh trống.");
  if (file.size > COVER_IMAGE_MAX_BYTES) throw new Error("Ảnh tối đa 10MB.");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Không đọc được file ảnh. Vui lòng chọn lại."));
    reader.onabort = () => reject(new Error("Đã hủy đọc file ảnh."));
    reader.onload = () => {
      const parsed = parseCoverImageInput(typeof reader.result === "string" ? reader.result : "data:");
      if (!parsed.ok || !parsed.value) {
        reject(new Error(parsed.ok ? "File ảnh trống." : parsed.error));
        return;
      }
      resolve(parsed.value);
    };
    reader.readAsDataURL(file);
  });
}
