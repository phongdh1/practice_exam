/** Client-side cover URL rules for admin course/subject editors. */

export type CoverImageUrlParseResult =
  | { ok: true; value: string | null }
  | { ok: false; error: string };

const INVALID_MESSAGE = "Link ảnh không hợp lệ. Dùng URL bắt đầu bằng http:// hoặc https://.";

/**
 * Empty/whitespace → null. Valid http(s) → trimmed href. Otherwise invalid.
 */
export function parseCoverImageUrlInput(raw: string): CoverImageUrlParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { ok: false, error: INVALID_MESSAGE };
    }
    // Keep the trimmed input (not href) so we don't rewrite casing/slashes while typing.
    return { ok: true, value: trimmed };
  } catch {
    return { ok: false, error: INVALID_MESSAGE };
  }
}
