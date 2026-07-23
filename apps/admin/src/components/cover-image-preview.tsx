"use client";

import { MaterialIcon } from "@practice-exam/ui";
import { useState } from "react";

type CoverImagePreviewProps = {
  src: string;
  alt: string;
  className?: string;
  /** Extra classes for the broken-state container (defaults match absolute fill). */
  errorClassName?: string;
};

/**
 * Renders a cover preview that tolerates hotlink-protected CDNs
 * (`referrerPolicy=no-referrer`) and shows a clear empty/error state on failure.
 */
export function CoverImagePreview({
  src,
  alt,
  className,
  errorClassName,
}: CoverImagePreviewProps) {
  const [failed, setFailed] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState(src);

  if (src !== loadedSrc) {
    setLoadedSrc(src);
    setFailed(false);
  }

  if (failed) {
    const message =
      "Không tải được ảnh từ link này. Dùng link trực tiếp tới file ảnh (một số trang chặn nhúng).";
    return (
      <div
        className={
          errorClassName ??
          "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-container-low px-4 text-center"
        }
        role="alert"
        aria-label={`${alt}: ${message}`}
      >
        <MaterialIcon name="broken_image" size={32} className="text-ink-muted" />
        <p className="text-xs text-ink-muted">{message}</p>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external admin cover URLs; next/image domains unknown
    <img
      key={src}
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
