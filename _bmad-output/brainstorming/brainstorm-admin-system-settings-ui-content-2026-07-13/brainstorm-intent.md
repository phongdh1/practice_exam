# Intent: A-90 Landing Content CMS (System Settings Extension)

**Source:** Brainstorming session 2026-07-13 — Creative Partner mode  
**Goal:** Super admin configures landing hero UI (copy, markdown, banners, stats card) without code deploy  
**MVP policy:** Publish immediately on save (same pattern as disclaimer); no server-side draft

---

## Problem

Landing hero content (`packages/ui/src/components/landing-hero.tsx`) is hardcoded. A-90 (`/settings/system`) only covers disclaimer, maintenance, and email templates (STORY-13-59 / FR-46). Marketing copy and visuals cannot be updated before exam seasons without a deploy.

---

## MoSCoW (Converged Scope)

### Must (MVP)

| Item | Detail |
|------|--------|
| **Text fields** | `badge`, `headline`, `subheadlineMarkdown`, `ctaPrimaryLabel`, `ctaSecondaryLabel`, `signInPrompt` (optional) |
| **Markdown** | Sanitized subset for `subheadlineMarkdown` (bold, italic, links, line breaks, short lists) — not raw HTML textarea |
| **Hero background** | Upload image → object storage; persist `assetId`/`url`, `alt`, `overlayOpacity` (0–1), optional `focalPoint` |
| **Hero sidecard** | Mode: `stats` \| `image` \| `hybrid` |
| **Stats config** | `cardTitle`, 2× `{ label, value }`, chart preset (`balanced` \| `growth` \| `peak`) — marketing copy, not live user data |
| **Sidecard image** | Upload when mode is `image` or `hybrid`; `alt` required |
| **Legal footnote** | Fixed or configurable line under stats: *"Minh họa, không phải kết quả thực tế"* |
| **Admin UI** | New section **"Nội dung trang chủ"** on A-90; client-side preview before save |
| **Publish** | Save = live immediately; audit-logged (extend FR-46) |
| **Public API** | `GET /settings/landing-content` with version + 5min client staleTime (mirror disclaimer) |
| **Web consumption** | `LandingHero` reads API with hardcoded fallbacks |
| **RBAC** | `super_admin` only (same as existing system settings) |

### Should

| Item | Detail |
|------|--------|
| **Mobile banner** | Optional separate `heroBackgroundMobile` asset or auto-crop from focal point |
| **Image validation** | Max 2MB, JPEG/PNG/WebP, server-side resize to WebP |
| **Contrast helper** | Warn if overlay too light for white headline text |
| **Maintenance message** | Upgrade existing textarea to same markdown editor (reuse component) |

### Could (Phase 2)

| Item | Detail |
|------|--------|
| Draft vs publish | Server-side draft + preview token URL |
| Rollback | Last 3 published versions |
| Scheduled publish | Activate headline/banner at datetime |
| Chart custom heights | Per-bar sliders instead of presets |
| OG image | Separate social preview asset |

### Won't (this time)

| Item | Reason |
|------|--------|
| Raw HTML/CSS editor | Layout-breaking risk; template-fixed approach chosen |
| Full page builder | Out of scope; hero template only |
| A/B testing | Phase 2+ |
| AI copy suggestions | Phase 2+ |

---

## Proposed Data Model

```ts
interface LandingContentView {
  version: string;
  badge: string;
  headline: string;
  subheadlineMarkdown: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  heroBackground: {
    assetUrl: string;
    alt: string;
    overlayOpacity: number;
    focalPoint?: { x: number; y: number };
    mobileAssetUrl?: string;
  } | null;
  heroSidecard: {
    mode: "stats" | "image" | "hybrid";
    cardTitle: string;
    illustrationFootnote: string;
    stats?: {
      chartPreset: "balanced" | "growth" | "peak";
      metrics: [{ label: string; value: string }, { label: string; value: string }];
    };
    image?: { assetUrl: string; alt: string };
  };
  updatedAt: string | null;
}
```

Extend `SystemSettingsView` with `landingContent: LandingContentView` OR separate endpoints — **recommend separate** `GET/PATCH /admin/landing-content` + public `GET /settings/landing-content` to keep PATCH payloads small and allow dedicated asset upload route.

---

## API Sketch

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/settings/landing-content` | Public | Candidate web landing |
| GET | `/api/v1/admin/landing-content` | super_admin | Admin form load |
| PATCH | `/api/v1/admin/landing-content` | super_admin | Publish content |
| POST | `/api/v1/admin/landing-content/assets` | super_admin | Upload banner (multipart) |

Asset storage: platform bucket (e.g. Supabase Storage or S3-compatible); DB stores URLs/keys only.

---

## Story Draft (for bmad-create-story / dev)

**As a** Super Admin,  
**I want** to configure landing page hero copy, markdown description, background banner, and sidecard (stats or image) on A-90,  
**So that** marketing content updates without a code deploy.

### Acceptance Criteria

**AC-1: Text & markdown**  
Given super admin on A-90 landing section  
When they edit badge, headline, subheadline (markdown), and CTA labels and save  
Then values persist and public API returns them within 5 minutes

**AC-2: Hero background**  
Given super admin uploads a valid banner (≤2MB, image/*)  
When saved with overlay opacity  
Then web landing shows background image with overlay; text remains readable (contrast warning in admin if not)

**AC-3: Sidecard stats**  
Given sidecard mode is `stats` or `hybrid`  
When admin configures card title, two metric label/value pairs, and chart preset  
Then landing renders configured marketing stats with illustration footnote

**AC-4: Sidecard image**  
Given sidecard mode is `image` or `hybrid`  
When admin uploads sidecard image with alt text  
Then landing renders image in right column (desktop); hidden or simplified on mobile per design

**AC-5: Preview & publish**  
Given admin edits any field  
When they use client-side preview then click Lưu  
Then changes go live immediately (no draft slot); success message shown

**AC-6: RBAC & audit**  
Given any landing content change  
When saved by super_admin  
Then change is audit-logged (extend existing admin audit pattern)

**AC-7: Fallback**  
Given public API unavailable or empty  
When candidate loads landing  
Then hardcoded defaults in `LandingHero` render (no broken page)

---

## Implementation Notes (brownfield)

- Extend `SettingsService` or add `LandingContentService` alongside existing disclaimer/maintenance keys
- Reuse A-90 page shell + `SettingsSectionTabs`; add collapsible section
- Markdown: use existing stack if present, else `react-markdown` + `rehype-sanitize` allowlist
- Upload: follow pattern from question import multipart if applicable
- Types in `@practice-exam/types`; api-client + query keys mirror `adminSystemSettings`
- PRD: extend FR-46 consequences with landing content propagation

---

## Open Questions for Dev

1. Which object storage is already provisioned (Supabase vs local dev)?
2. Separate admin route vs extend `system-settings` PATCH?
3. Zalo mini-app: does it share landing hero or web-only scope?
