"use client";

import { adminApi } from "@/lib/admin-api";
import { queryKeys } from "@practice-exam/api-client";
import {
  DEFAULT_LANDING_CONTENT,
  DEFAULT_LANDING_ILLUSTRATION_FOOTNOTE,
  type HeroChartPreset,
  type HeroSidecardMode,
  type LandingContentView,
  mergeLandingContent,
} from "@practice-exam/types";
import { LandingHero, SafeMarkdown } from "@practice-exam/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

type LandingFormState = Omit<LandingContentView, "version" | "updatedAt">;

function toFormState(data: LandingContentView): LandingFormState {
  const merged = mergeLandingContent(data);
  return {
    badge: merged.badge,
    headline: merged.headline,
    subheadlineMarkdown: merged.subheadlineMarkdown,
    ctaPrimaryLabel: merged.ctaPrimaryLabel,
    ctaSecondaryLabel: merged.ctaSecondaryLabel,
    signInPrompt: merged.signInPrompt,
    heroBackground: merged.heroBackground,
    heroSidecard: merged.heroSidecard,
  };
}

function contrastWarning(overlayOpacity: number | undefined): string | null {
  if (overlayOpacity == null) return null;
  if (overlayOpacity < 0.45) {
    return "Độ phủ nền thấp — chữ trắng có thể khó đọc trên ảnh sáng.";
  }
  return null;
}

export function LandingContentSettingsSection() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [form, setForm] = useState<LandingFormState>(toFormState(DEFAULT_LANDING_CONTENT));

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.adminLandingContent.all,
    queryFn: () => adminApi.adminGetLandingContent(),
  });

  useEffect(() => {
    if (data?.data) {
      setForm(toFormState(data.data));
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => adminApi.adminUpdateLandingContent(form),
    onSuccess: () => {
      setMessage("Đã lưu nội dung trang chủ.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminLandingContent.all });
    },
    onError: (err: Error) => setMessage(err.message),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, target }: { file: File; target: "background" | "sidecard" }) =>
      adminApi.adminUploadLandingAsset(file).then((res) => ({ ...res.data, target })),
    onError: (err: Error) => setMessage(err.message),
  });

  const previewContent = useMemo(
    (): LandingContentView => ({
      ...mergeLandingContent(form),
      version: "preview",
      updatedAt: null,
    }),
    [form],
  );

  const overlayWarn = contrastWarning(form.heroBackground?.overlayOpacity);

  async function handleUpload(file: File, target: "background" | "sidecard") {
    const result = await uploadMutation.mutateAsync({ file, target });
    if (target === "background") {
      setForm((prev) => ({
        ...prev,
        heroBackground: {
          asset: {
            assetId: result.assetId,
            url: result.url,
            alt: prev.heroBackground?.asset.alt ?? "",
          },
          overlayOpacity: prev.heroBackground?.overlayOpacity ?? 0.55,
          focalPoint: prev.heroBackground?.focalPoint,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        heroSidecard: {
          ...prev.heroSidecard,
          image: {
            assetId: result.assetId,
            url: result.url,
            alt: prev.heroSidecard.image?.alt ?? "",
          },
        },
      }));
    }
  }

  return (
    <section className="rounded-xl border border-outline-variant p-6">
      <h2 className="mb-4 text-heading font-heading text-primary">Nội dung trang chủ</h2>

      {message && (
        <p className="mb-4 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-body-sm">
          {message}
        </p>
      )}

      {isLoading && <p className="text-ink-muted">Đang tải...</p>}

      {!isLoading && (
        <div className="flex flex-col gap-6">
          <label className="flex flex-col gap-1 text-body-sm">
            Badge
            <input
              value={form.badge}
              onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
              className="rounded-lg border border-outline-variant px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-body-sm">
            Headline
            <input
              value={form.headline}
              onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))}
              className="rounded-lg border border-outline-variant px-3 py-2"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-body-sm">
              Mô tả (Markdown)
              <textarea
                rows={5}
                value={form.subheadlineMarkdown}
                onChange={(e) => setForm((p) => ({ ...p, subheadlineMarkdown: e.target.value }))}
                className="rounded-lg border border-outline-variant px-3 py-2 font-mono text-sm"
              />
            </label>
            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3">
              <p className="mb-2 text-label text-ink-muted">Xem trước Markdown</p>
              <SafeMarkdown markdown={form.subheadlineMarkdown} className="text-body-sm text-ink" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-body-sm">
              CTA chính
              <input
                value={form.ctaPrimaryLabel}
                onChange={(e) => setForm((p) => ({ ...p, ctaPrimaryLabel: e.target.value }))}
                className="rounded-lg border border-outline-variant px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-body-sm">
              CTA phụ
              <input
                value={form.ctaSecondaryLabel}
                onChange={(e) => setForm((p) => ({ ...p, ctaSecondaryLabel: e.target.value }))}
                className="rounded-lg border border-outline-variant px-3 py-2"
              />
            </label>
          </div>

          <div className="rounded-lg border border-outline-variant p-4">
            <h3 className="mb-3 text-label font-bold text-primary">Banner nền hero</h3>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file, "background");
              }}
              className="mb-3 text-body-sm"
            />
            {form.heroBackground?.asset.url && (
              <img
                src={form.heroBackground.asset.url}
                alt={form.heroBackground.asset.alt || "preview"}
                className="mb-3 max-h-32 rounded-lg object-cover"
              />
            )}
            <label className="mb-3 flex flex-col gap-1 text-body-sm">
              Alt text
              <input
                value={form.heroBackground?.asset.alt ?? ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    heroBackground: p.heroBackground
                      ? {
                          ...p.heroBackground,
                          asset: { ...p.heroBackground.asset, alt: e.target.value },
                        }
                      : null,
                  }))
                }
                className="rounded-lg border border-outline-variant px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-body-sm">
              Độ phủ nền ({form.heroBackground?.overlayOpacity?.toFixed(2) ?? "0.55"})
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={form.heroBackground?.overlayOpacity ?? 0.55}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    heroBackground: p.heroBackground
                      ? { ...p.heroBackground, overlayOpacity: Number(e.target.value) }
                      : null,
                  }))
                }
              />
            </label>
            {overlayWarn && <p className="mt-2 text-body-sm text-warning">{overlayWarn}</p>}
          </div>

          <div className="rounded-lg border border-outline-variant p-4">
            <h3 className="mb-3 text-label font-bold text-primary">Sidecard (cột phải)</h3>
            <label className="mb-3 flex flex-col gap-1 text-body-sm">
              Chế độ
              <select
                value={form.heroSidecard.mode}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    heroSidecard: { ...p.heroSidecard, mode: e.target.value as HeroSidecardMode },
                  }))
                }
                className="rounded-lg border border-outline-variant px-3 py-2"
              >
                <option value="stats">Thống kê</option>
                <option value="image">Ảnh</option>
                <option value="hybrid">Kết hợp</option>
              </select>
            </label>
            <label className="mb-3 flex flex-col gap-1 text-body-sm">
              Tiêu đề card
              <input
                value={form.heroSidecard.cardTitle}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    heroSidecard: { ...p.heroSidecard, cardTitle: e.target.value },
                  }))
                }
                className="rounded-lg border border-outline-variant px-3 py-2"
              />
            </label>
            {(form.heroSidecard.mode === "stats" || form.heroSidecard.mode === "hybrid") && (
              <>
                <label className="mb-3 flex flex-col gap-1 text-body-sm">
                  Biểu đồ
                  <select
                    value={form.heroSidecard.stats?.chartPreset ?? "balanced"}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        heroSidecard: {
                          ...p.heroSidecard,
                          stats: {
                            chartPreset: e.target.value as HeroChartPreset,
                            metrics: p.heroSidecard.stats?.metrics ?? DEFAULT_LANDING_CONTENT.heroSidecard.stats!.metrics,
                          },
                        },
                      }))
                    }
                    className="rounded-lg border border-outline-variant px-3 py-2"
                  >
                    <option value="balanced">Cân bằng</option>
                    <option value="growth">Tăng trưởng</option>
                    <option value="peak">Đỉnh</option>
                  </select>
                </label>
                {[0, 1].map((idx) => (
                  <div key={idx} className="mb-3 grid gap-2 sm:grid-cols-2">
                    <input
                      placeholder="Nhãn"
                      value={form.heroSidecard.stats?.metrics[idx]?.label ?? ""}
                      onChange={(e) =>
                        setForm((p) => {
                          const metrics = [...(p.heroSidecard.stats?.metrics ?? DEFAULT_LANDING_CONTENT.heroSidecard.stats!.metrics)] as [
                            { label: string; value: string },
                            { label: string; value: string },
                          ];
                          metrics[idx] = { ...metrics[idx], label: e.target.value };
                          return {
                            ...p,
                            heroSidecard: {
                              ...p.heroSidecard,
                              stats: {
                                chartPreset: p.heroSidecard.stats?.chartPreset ?? "balanced",
                                metrics,
                              },
                            },
                          };
                        })
                      }
                      className="rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
                    />
                    <input
                      placeholder="Giá trị"
                      value={form.heroSidecard.stats?.metrics[idx]?.value ?? ""}
                      onChange={(e) =>
                        setForm((p) => {
                          const metrics = [...(p.heroSidecard.stats?.metrics ?? DEFAULT_LANDING_CONTENT.heroSidecard.stats!.metrics)] as [
                            { label: string; value: string },
                            { label: string; value: string },
                          ];
                          metrics[idx] = { ...metrics[idx], value: e.target.value };
                          return {
                            ...p,
                            heroSidecard: {
                              ...p.heroSidecard,
                              stats: {
                                chartPreset: p.heroSidecard.stats?.chartPreset ?? "balanced",
                                metrics,
                              },
                            },
                          };
                        })
                      }
                      className="rounded-lg border border-outline-variant px-3 py-2 text-body-sm"
                    />
                  </div>
                ))}
              </>
            )}
            {(form.heroSidecard.mode === "image" || form.heroSidecard.mode === "hybrid") && (
              <>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleUpload(file, "sidecard");
                  }}
                  className="mb-3 text-body-sm"
                />
                {form.heroSidecard.image?.url && (
                  <img
                    src={form.heroSidecard.image.url}
                    alt={form.heroSidecard.image.alt}
                    className="mb-3 max-h-32 rounded-lg object-cover"
                  />
                )}
                <label className="flex flex-col gap-1 text-body-sm">
                  Alt ảnh sidecard
                  <input
                    value={form.heroSidecard.image?.alt ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        heroSidecard: {
                          ...p.heroSidecard,
                          image: p.heroSidecard.image
                            ? { ...p.heroSidecard.image, alt: e.target.value }
                            : undefined,
                        },
                      }))
                    }
                    className="rounded-lg border border-outline-variant px-3 py-2"
                  />
                </label>
              </>
            )}
            <label className="mt-3 flex flex-col gap-1 text-body-sm">
              Ghi chú minh họa
              <input
                value={form.heroSidecard.illustrationFootnote}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    heroSidecard: { ...p.heroSidecard, illustrationFootnote: e.target.value },
                  }))
                }
                placeholder={DEFAULT_LANDING_ILLUSTRATION_FOOTNOTE}
                className="rounded-lg border border-outline-variant px-3 py-2"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPreviewOpen((v) => !v)}
              className="rounded-lg border border-outline-variant px-4 py-2 text-body-sm"
            >
              {previewOpen ? "Ẩn xem trước landing" : "Xem trước landing"}
            </button>
            <button
              type="button"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              className="rounded-lg bg-primary px-4 py-2 text-on-primary disabled:opacity-50"
            >
              Lưu nội dung trang chủ
            </button>
          </div>

          {previewOpen && (
            <div className="overflow-hidden rounded-xl border border-outline-variant">
              <LandingHero content={previewContent} catalogHref="#catalog" />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
