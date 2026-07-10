import { cn } from "../lib/utils";
import { InternalLink } from "./internal-link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { MaterialIcon } from "./material-icon";

export interface LandingHeroProps {
  signInHref?: string;
  registerHref?: string;
  catalogHref?: string;
  className?: string;
}

export function LandingHero({
  signInHref = "/sign-in",
  registerHref = "/register",
  catalogHref = "/",
  className,
}: LandingHeroProps) {
  return (
    <section className={cn("relative overflow-hidden bg-primary py-24 md:py-32", className)}>
      <div className="relative z-10 mx-auto grid max-w-content grid-cols-1 items-center gap-12 px-gutter-mobile md:grid-cols-2 md:px-gutter-desktop">
        <div className="space-y-8">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-2 rounded-full border-on-primary-container/20 bg-primary-container/30 px-3 py-1 text-label text-on-primary-container hover:bg-primary-container/30"
          >
            <MaterialIcon name="verified" size={16} filled className="text-on-primary-container" />
            Cập nhật kỳ thi 2024
          </Badge>
          <h1 className="text-4xl font-bold leading-tight text-on-primary md:text-6xl">
            Ôn thi CNVCK chuyên nghiệp, tin cậy.
          </h1>
          <p className="max-w-lg text-lg text-on-primary-container">
            Hệ thống luyện thi chứng chỉ hành nghề chứng khoán hàng đầu Việt Nam. Chuẩn hóa kiến
            thức, tối ưu lộ trình và sẵn sàng chinh phục mục tiêu sự nghiệp.
          </p>
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-lg bg-on-primary px-8 py-4 text-heading font-heading text-primary shadow-lg hover:bg-surface-container-high active:scale-95"
            >
              <a href={catalogHref}>Bắt đầu luyện tập ngay</a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-lg border-2 border-on-primary bg-transparent px-8 py-4 text-heading font-heading text-on-primary hover:bg-on-primary/10 active:scale-95"
            >
              <InternalLink href={registerHref}>Đăng ký tài khoản</InternalLink>
            </Button>
          </div>
          <p className="text-body-sm text-on-primary-container">
            Đã có tài khoản?{" "}
            <InternalLink href={signInHref} className="font-bold text-on-primary underline">
              Đăng nhập
            </InternalLink>
          </p>
        </div>
        <div className="relative hidden md:block">
          <Card className="glass-morphism relative overflow-hidden rounded-2xl border-0 p-8 shadow-2xl">
            <CardContent className="relative z-10 space-y-6 p-0">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary-container/20 blur-3xl" />
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold text-primary">Thống kê cá nhân</span>
                <MaterialIcon name="analytics" className="text-primary" />
              </div>
              <div className="flex h-32 items-end gap-3 px-2">
                {[40, 60, 85, 100, 70].map((h, i) => (
                  <div
                    key={i}
                    className="w-full rounded-t-sm bg-primary"
                    style={{ height: `${h}%`, opacity: 0.2 + i * 0.2 }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="rounded-xl border-outline-variant bg-surface-subtle shadow-none">
                  <CardContent className="p-4">
                    <div className="mb-1 text-xs uppercase tracking-wider text-ink-muted">Mục tiêu</div>
                    <div className="text-lg font-bold text-primary">75% Score</div>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border-outline-variant bg-surface-subtle shadow-none">
                  <CardContent className="p-4">
                    <div className="mb-1 text-xs uppercase tracking-wider text-ink-muted">Cấp độ</div>
                    <div className="text-lg font-bold text-primary">Vững vàng</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
