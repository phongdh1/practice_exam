import { cn } from "../lib/utils";
import { InternalLink } from "./internal-link";
import { Button } from "./ui/button";

export interface LandingCtaBandProps {
  registerHref?: string;
  className?: string;
}

export function LandingCtaBand({
  registerHref = "/register",
  className,
}: LandingCtaBandProps) {
  return (
    <section
      className={cn(
        "bg-primary px-gutter-mobile py-16 text-center md:px-gutter-desktop md:py-20",
        className,
      )}
      data-component="landing-cta-band"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <h2 className="text-display-sm font-heading text-on-primary md:text-display-lg">
          Sẵn sàng để trở thành chuyên gia?
        </h2>
        <p className="text-body text-on-primary-container">
          Tham gia cùng hơn 10.000+ học viên đang luyện thi chứng chỉ hành nghề chứng khoán trên
          CNVCK Prep.
        </p>
        <Button
          asChild
          size="lg"
          className="rounded-lg bg-on-primary px-10 py-4 text-heading font-heading text-primary shadow-lg hover:bg-surface-container-high"
        >
          <InternalLink href={registerHref}>Tạo tài khoản miễn phí</InternalLink>
        </Button>
      </div>
    </section>
  );
}
