import { FALLBACK_PLATFORM_DISCLAIMER } from "../constants/disclaimer";
import { cn } from "../lib/utils";
import { MaterialIcon } from "./material-icon";

export interface CandidateFooterProps {
  className?: string;
  /** Guest marketing footer includes yellow disclaimer banner; compact matches auth baseline. */
  variant?: "marketing" | "compact";
  disclaimerText?: string;
  settingsHref?: string;
  privacyHref?: string;
  supportHref?: string;
}

export function CandidateFooter({
  className,
  variant = "marketing",
  disclaimerText = FALLBACK_PLATFORM_DISCLAIMER.text,
  settingsHref = "#",
  privacyHref = "#",
  supportHref = "#",
}: CandidateFooterProps) {
  const notice = disclaimerText.trim() || FALLBACK_PLATFORM_DISCLAIMER.text;

  if (variant === "compact") {
    return (
      <footer
        className={cn(
          "mt-section-gap flex w-full flex-col gap-6 border-t-2 border-disclaimer-border bg-surface-container-low px-gutter-mobile py-12 md:px-gutter-desktop",
          className,
        )}
        data-component="candidate-footer"
      >
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-2 text-heading font-heading text-primary">CNVCK Prep</div>
            <p className="max-w-sm text-caption text-ink-muted">
              © 2024 CNVCK Certification Prep. Không trực thuộc UBCKNN.
            </p>
          </div>
          <div className="flex flex-wrap gap-8">
            <a className="text-caption text-ink-muted hover:text-primary hover:underline" href={settingsHref}>
              Cài đặt
            </a>
            <a className="text-caption text-ink-muted hover:text-primary hover:underline" href={privacyHref}>
              Chính sách bảo mật
            </a>
            <a className="text-caption text-ink-muted hover:text-primary hover:underline" href={supportHref}>
              Liên hệ hỗ trợ
            </a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn("mt-0 w-full", className)} data-component="candidate-footer">
      <div className="border-y border-disclaimer-border bg-disclaimer-bg px-gutter-mobile py-3 md:px-gutter-desktop">
        <div className="mx-auto flex max-w-content gap-3 text-body-sm text-ink-muted">
          <MaterialIcon name="info" size={20} className="mt-0.5 shrink-0 text-warning" />
          <p>
            <span className="font-medium text-on-surface">Thông báo quan trọng: </span>
            {notice}
          </p>
        </div>
      </div>

      <div className="bg-surface-subtle px-gutter-mobile py-12 md:px-gutter-desktop">
        <div className="mx-auto flex max-w-content flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm space-y-3">
            <div className="text-heading font-heading text-primary">CNVCK Certification Prep</div>
            <p className="text-body-sm text-ink-muted">
              Nền tảng luyện thi chứng chỉ hành nghề chứng khoán — chuyên nghiệp, tin cậy, tập
              trung vào kết quả.
            </p>
          </div>
          <nav className="flex flex-col gap-3" aria-label="Liên kết chân trang">
            <a className="text-body-sm text-ink-muted hover:text-primary hover:underline" href={settingsHref}>
              Cài đặt
            </a>
            <a className="text-body-sm text-ink-muted hover:text-primary hover:underline" href={privacyHref}>
              Chính sách bảo mật
            </a>
            <a className="text-body-sm text-ink-muted hover:text-primary hover:underline" href={supportHref}>
              Liên hệ hỗ trợ
            </a>
          </nav>
        </div>
      </div>

      <div className="border-t border-outline-variant/40 bg-surface-subtle px-gutter-mobile py-4 md:px-gutter-desktop">
        <div className="mx-auto max-w-content">
          <p className="text-caption text-ink-muted">
            © 2024 CNVCK Certification Prep. Không trực thuộc UBCKNN.
          </p>
        </div>
      </div>
    </footer>
  );
}
