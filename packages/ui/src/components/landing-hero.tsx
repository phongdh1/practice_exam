import {
  DEFAULT_LANDING_CONTENT,
  HERO_CHART_PRESET_HEIGHTS,
  mergeLandingContent,
  type LandingContentView,
} from "@practice-exam/types";
import { cn } from "../lib/utils";
import { InternalLink } from "./internal-link";
import { SafeMarkdown } from "./safe-markdown";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { MaterialIcon } from "./material-icon";

export interface LandingHeroProps {
  content?: LandingContentView | null;
  signInHref?: string;
  registerHref?: string;
  catalogHref?: string;
  className?: string;
}

export function LandingHero({
  content,
  signInHref = "/sign-in",
  registerHref = "/register",
  catalogHref = "/",
  className,
}: LandingHeroProps) {
  const resolved = mergeLandingContent(content ?? undefined);
  const { heroBackground, heroSidecard } = resolved;
  const chartHeights =
    heroSidecard.stats?.chartPreset != null
      ? HERO_CHART_PRESET_HEIGHTS[heroSidecard.stats.chartPreset]
      : HERO_CHART_PRESET_HEIGHTS.balanced;

  const backgroundStyle =
    heroBackground?.asset.url != null
      ? {
          backgroundImage: `url(${heroBackground.asset.url})`,
          backgroundSize: "cover" as const,
          backgroundPosition:
            heroBackground.focalPoint != null
              ? `${heroBackground.focalPoint.x * 100}% ${heroBackground.focalPoint.y * 100}%`
              : "center",
        }
      : undefined;

  const overlayOpacity = heroBackground?.overlayOpacity ?? 0.55;

  return (
    <section
      className={cn(
        "relative overflow-hidden py-24 md:py-32",
        !heroBackground?.asset.url && "bg-primary",
        className,
      )}
      style={backgroundStyle}
    >
      {heroBackground?.asset.url && (
        <div
          className="absolute inset-0 bg-primary"
          style={{ opacity: overlayOpacity }}
          aria-hidden
        />
      )}
      <div className="relative z-10 mx-auto grid max-w-content grid-cols-1 items-center gap-12 px-gutter-mobile md:grid-cols-2 md:px-gutter-desktop">
        <div className="space-y-8">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-2 rounded-full border-on-primary-container/20 bg-primary-container/30 px-3 py-1 text-label text-on-primary-container hover:bg-primary-container/30"
          >
            <MaterialIcon name="verified" size={16} filled className="text-on-primary-container" />
            {resolved.badge}
          </Badge>
          <h1 className="text-4xl font-bold leading-tight text-on-primary md:text-6xl">
            {resolved.headline}
          </h1>
          <SafeMarkdown
            markdown={resolved.subheadlineMarkdown}
            className="max-w-lg text-lg text-on-primary-container [&_p]:m-0"
          />
          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-lg bg-on-primary px-8 py-4 text-heading font-heading text-primary shadow-lg hover:bg-surface-container-high active:scale-95"
            >
              <a href={catalogHref}>{resolved.ctaPrimaryLabel}</a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-lg border-2 border-on-primary bg-transparent px-8 py-4 text-heading font-heading text-on-primary hover:bg-on-primary/10 active:scale-95"
            >
              <InternalLink href={registerHref}>{resolved.ctaSecondaryLabel}</InternalLink>
            </Button>
          </div>
          <p className="text-body-sm text-on-primary-container">
            {resolved.signInPrompt}{" "}
            <InternalLink href={signInHref} className="font-bold text-on-primary underline">
              Đăng nhập
            </InternalLink>
          </p>
        </div>
        <HeroSidecard sidecard={heroSidecard} chartHeights={chartHeights} />
      </div>
    </section>
  );
}

function HeroSidecard({
  sidecard,
  chartHeights,
}: {
  sidecard: LandingContentView["heroSidecard"];
  chartHeights: number[];
}) {
  const showStats = sidecard.mode === "stats" || sidecard.mode === "hybrid";
  const showImage = sidecard.mode === "image" || sidecard.mode === "hybrid";

  if (!showStats && !showImage) {
    return null;
  }

  return (
    <div className="relative hidden md:block">
      <Card className="glass-morphism relative overflow-hidden rounded-2xl border-0 p-8 shadow-2xl">
        {showImage && sidecard.image?.url && (
          <img
            src={sidecard.image.url}
            alt={sidecard.image.alt}
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        )}
        <CardContent className="relative z-10 space-y-6 p-0">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary-container/20 blur-3xl" />
          {showStats && sidecard.stats && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold text-primary">{sidecard.cardTitle}</span>
                <MaterialIcon name="analytics" className="text-primary" />
              </div>
              <div className="flex h-32 items-end gap-3 px-2">
                {chartHeights.map((h, i) => (
                  <div
                    key={i}
                    className="w-full rounded-t-sm bg-primary"
                    style={{ height: `${h}%`, opacity: 0.2 + i * 0.2 }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {sidecard.stats.metrics.map((metric) => (
                  <Card
                    key={metric.label}
                    className="rounded-xl border-outline-variant bg-surface-subtle shadow-none"
                  >
                    <CardContent className="p-4">
                      <div className="mb-1 text-xs uppercase tracking-wider text-ink-muted">
                        {metric.label}
                      </div>
                      <div className="text-lg font-bold text-primary">{metric.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {sidecard.illustrationFootnote?.trim() && (
                <div className="inline-flex items-center gap-2 rounded-full bg-success-muted px-3 py-1.5 text-caption font-medium text-success">
                  <MaterialIcon name="check_circle" size={16} filled className="text-success" />
                  {sidecard.illustrationFootnote.trim()}
                </div>
              )}
            </>
          )}
          {showImage && !showStats && sidecard.image?.url && (
            <img
              src={sidecard.image.url}
              alt={sidecard.image.alt}
              className="mx-auto max-h-64 rounded-xl object-contain"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export { DEFAULT_LANDING_CONTENT, mergeLandingContent };
