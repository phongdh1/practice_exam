import { cn } from "../lib/utils";

export interface CandidateFooterProps {
  className?: string;
  settingsHref?: string;
  privacyHref?: string;
  supportHref?: string;
}

export function CandidateFooter({
  className,
  settingsHref = "#",
  privacyHref = "#",
  supportHref = "#",
}: CandidateFooterProps) {
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
