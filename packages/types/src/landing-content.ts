export type HeroSidecardMode = "stats" | "image" | "hybrid";
export type HeroChartPreset = "balanced" | "growth" | "peak";

export interface LandingMetric {
  label: string;
  value: string;
}

export interface LandingAssetRef {
  assetId: string;
  url: string;
  alt: string;
}

export interface HeroBackgroundConfig {
  asset: LandingAssetRef;
  overlayOpacity: number;
  focalPoint?: { x: number; y: number };
  mobileAsset?: LandingAssetRef;
}

export interface HeroSidecardStatsConfig {
  chartPreset: HeroChartPreset;
  metrics: [LandingMetric, LandingMetric];
}

export interface HeroSidecardConfig {
  mode: HeroSidecardMode;
  cardTitle: string;
  illustrationFootnote: string;
  stats?: HeroSidecardStatsConfig;
  image?: LandingAssetRef;
}

export interface LandingContentView {
  version: string;
  badge: string;
  headline: string;
  subheadlineMarkdown: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  signInPrompt?: string;
  heroBackground: HeroBackgroundConfig | null;
  heroSidecard: HeroSidecardConfig;
  updatedAt: string | null;
}

export const HERO_CHART_PRESET_HEIGHTS: Record<HeroChartPreset, number[]> = {
  balanced: [40, 60, 85, 100, 70],
  growth: [25, 45, 65, 85, 100],
  peak: [55, 70, 90, 100, 85],
};

export const DEFAULT_LANDING_ILLUSTRATION_FOOTNOTE =
  "Minh họa, không phải kết quả thực tế";

export const DEFAULT_LANDING_CONTENT: LandingContentView = {
  version: "default",
  badge: "Cập nhật kỳ thi 2024",
  headline: "Ôn thi CNVCK chuyên nghiệp, tin cậy.",
  subheadlineMarkdown:
    "Hệ thống luyện thi chứng chỉ hành nghề chứng khoán hàng đầu Việt Nam. Chuẩn hóa kiến thức, tối ưu lộ trình và sẵn sàng chinh phục mục tiêu sự nghiệp.",
  ctaPrimaryLabel: "Bắt đầu luyện tập ngay",
  ctaSecondaryLabel: "Đăng ký tài khoản",
  signInPrompt: "Đã có tài khoản?",
  heroBackground: null,
  heroSidecard: {
    mode: "stats",
    cardTitle: "Thống kê cá nhân",
    illustrationFootnote: DEFAULT_LANDING_ILLUSTRATION_FOOTNOTE,
    stats: {
      chartPreset: "balanced",
      metrics: [
        { label: "Mục tiêu", value: "75% Score" },
        { label: "Cấp độ", value: "Vững vàng" },
      ],
    },
  },
  updatedAt: null,
};

export function mergeLandingContent(
  partial?: Partial<LandingContentView> | null,
): LandingContentView {
  if (!partial) {
    return { ...DEFAULT_LANDING_CONTENT };
  }
  return {
    ...DEFAULT_LANDING_CONTENT,
    ...partial,
    heroSidecard: {
      ...DEFAULT_LANDING_CONTENT.heroSidecard,
      ...partial.heroSidecard,
      stats: partial.heroSidecard?.stats
        ? {
            ...DEFAULT_LANDING_CONTENT.heroSidecard.stats!,
            ...partial.heroSidecard.stats,
            metrics: partial.heroSidecard.stats.metrics ?? DEFAULT_LANDING_CONTENT.heroSidecard.stats!.metrics,
          }
        : DEFAULT_LANDING_CONTENT.heroSidecard.stats,
    },
    heroBackground: partial.heroBackground ?? DEFAULT_LANDING_CONTENT.heroBackground,
  };
}
