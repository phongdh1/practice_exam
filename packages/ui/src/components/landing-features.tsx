import { cn } from "../lib/utils";
import { MaterialIcon } from "./material-icon";
import { Card, CardContent } from "./ui/card";

const FEATURES = [
  {
    icon: "description" as const,
    title: "Ngân hàng câu hỏi tinh lọc",
    description:
      "Hàng nghìn câu hỏi được biên soạn và cập nhật liên tục theo khung kiến thức CNVCK chuẩn.",
  },
  {
    icon: "checklist" as const,
    title: "Cấu trúc đề thi chuẩn",
    description:
      "Luyện tập và thi thử theo đúng cấu trúc, thời gian và độ khó của kỳ thi thực tế.",
  },
  {
    icon: "monitoring" as const,
    title: "Phân tích tiến độ",
    description:
      "Theo dõi điểm mạnh, điểm yếu và lộ trình ôn tập cá nhân hóa để đạt mục tiêu nhanh hơn.",
  },
] as const;

export interface LandingFeaturesProps {
  className?: string;
}

export function LandingFeatures({ className }: LandingFeaturesProps) {
  return (
    <section
      className={cn(
        "bg-surface-elevated px-gutter-mobile py-16 md:px-gutter-desktop md:py-20",
        className,
      )}
      data-component="landing-features"
    >
      <div className="mx-auto max-w-content text-center">
        <h2 className="text-display-sm font-heading text-on-surface md:text-display-lg">
          Tại sao chọn CNVCK Prep?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-body text-ink-muted">
          Nền tảng được thiết kế dành riêng cho thí sinh chứng chỉ hành nghề chứng khoán —
          rõ ràng, chuẩn mực và tập trung vào kết quả.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="rounded-xl border border-outline-variant/60 bg-surface-elevated text-left shadow-sm"
            >
              <CardContent className="space-y-3 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary">
                  <MaterialIcon name={feature.icon} size={24} />
                </div>
                <h3 className="text-heading font-heading text-on-surface">{feature.title}</h3>
                <p className="text-body-sm text-ink-muted">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
