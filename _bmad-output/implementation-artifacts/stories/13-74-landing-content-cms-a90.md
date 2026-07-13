---
id: STORY-74-EPIC13
story_key: 13-74-landing-content-cms-a90
status: review
baseline_commit: 018d276
prd_refs: ["FR-46", "FR-15"]
ad_refs: ["A-90"]
brainstorm_ref: "_bmad-output/brainstorming/brainstorm-admin-system-settings-ui-content-2026-07-13/brainstorm-intent.md"
---

# Story 13.74: Landing content CMS on A-90

Status: review

## Story

As a **Super Admin**,  
I want **to configure the candidate web landing hero (copy, markdown description, background banner, and sidecard stats/image) on A-90**,  
So that **marketing content updates without a code deploy**.

## Acceptance Criteria

### AC-1: Text and markdown fields

**Given** a super admin on A-90 section **"Nội dung trang chủ"**  
**When** they edit `badge`, `headline`, `subheadlineMarkdown`, `ctaPrimaryLabel`, `ctaSecondaryLabel`, and optional `signInPrompt` and click **Lưu**  
**Then** values persist via admin API and public `GET /api/v1/settings/landing-content` returns them  
**And** subheadline markdown is sanitized (bold, italic, links, line breaks, short lists only — no raw HTML)  
**And** changes propagate to candidate web within 5 minutes (`version` + `SETTINGS_QUERY_STALE_MS`)

### AC-2: Hero background banner

**Given** super admin uploads a valid image (JPEG/PNG/WebP, ≤2MB) for hero background  
**When** they set `alt` text, `overlayOpacity` (0–1), and optional focal point, then save  
**Then** unauthenticated candidate web home (`apps/web` `/`) renders the background image behind hero text with overlay  
**And** admin UI warns (non-blocking) when overlay is too light for white headline contrast  
**And** asset URL is stored by reference (not base64 in `system_settings`)

### AC-3: Sidecard stats (marketing copy)

**Given** sidecard `mode` is `stats` or `hybrid`  
**When** admin configures `cardTitle`, two metric `{ label, value }` pairs, and chart preset (`balanced` | `growth` | `peak`)  
**Then** landing right column renders the configured stats card (desktop `md+`)  
**And** illustration footnote displays (default: *"Minh họa, không phải kết quả thực tế"*) — configurable text field with that default

### AC-4: Sidecard image

**Given** sidecard `mode` is `image` or `hybrid`  
**When** admin uploads sidecard image with required `alt` and saves  
**Then** landing renders the image in the right column on desktop  
**And** sidecard image is hidden on mobile (`<md`) per existing hero layout convention

### AC-5: Client preview and immediate publish

**Given** admin edits any landing field  
**When** they use **client-side preview** (render current form state without save) then click **Lưu**  
**Then** changes go live immediately (no server draft slot)  
**And** success toast/message matches existing A-90 pattern (`"Đã lưu cài đặt hệ thống."` or landing-specific variant)

### AC-6: RBAC and audit

**Given** any landing content change  
**When** saved by `super_admin`  
**Then** change is written to `admin_auth_audit_logs` (action `landing_content_updated` or extend `system_setting_updated` with `landingContent` in `details`)  
**And** non–super-admin roles receive 403 on admin landing-content routes

### AC-7: Fallback when API empty or failing

**Given** public landing-content API returns empty, default, or errors  
**When** candidate loads unauthenticated home  
**Then** `LandingHero` renders **current hardcoded defaults** (extracted to `DEFAULT_LANDING_CONTENT` constant) — page never breaks

### AC-8: Web-only scope (explicit non-goal)

**Given** Zalo Mini App  
**When** this story ships  
**Then** Zalo is **unchanged** (no landing hero CMS consumption) — web candidate home only

## Tasks / Subtasks

- [x] **Types & defaults** (AC: #1, #7)
  - [x] Add `LandingContentView`, `HeroBackgroundConfig`, `HeroSidecardConfig`, chart preset type to `packages/types/src/index.ts`
  - [x] Export `DEFAULT_LANDING_CONTENT` mirroring current `landing-hero.tsx` strings and chart heights `[40,60,85,100,70]`
  - [x] Chart preset map: `balanced` → current heights; `growth` / `peak` → predefined alternate arrays

- [x] **API — persistence** (AC: #1–#4, #6)
  - [x] Add `LANDING_CONTENT_KEY = "landing_content"` in `SettingsService` (or dedicated `LandingContentService` in `apps/api/src/settings/`)
  - [x] Store JSON in existing `system_settings` table (same pattern as `maintenance_mode`, `email_templates`)
  - [x] 5-minute in-memory cache + `version` from `updatedAt` (mirror `getPlatformDisclaimer`)
  - [x] DTO validation: `class-validator` max lengths, enum modes, opacity 0–1

- [x] **API — routes** (AC: #1, #6)
  - [x] `SettingsController`: `GET settings/landing-content` (public)
  - [x] `AdminLandingContentController`: `GET/PATCH admin/landing-content` — `@Roles("super_admin")`, guards same as `AdminSystemSettingsController`
  - [x] **Do NOT** bloat `PATCH /admin/system-settings` — separate resource per brainstorm decision

- [x] **API — asset upload** (AC: #2, #4)
  - [x] `POST admin/landing-content/assets` with `FileInterceptor("file")` — copy multipart pattern from `ImportQuestionsController`
  - [x] Validate MIME + 2MB max; reject with `BadRequestException` + Vietnamese message
  - [x] Implement `LandingAssetStorage` interface; MVP: `LocalDiskLandingAssetStorage` writing to `storage/landing-assets/` (gitignored)
  - [x] Public serve: `GET settings/landing-assets/:assetId` (or static module) — return `Cache-Control` suitable for CDN
  - [x] Document env `LANDING_ASSETS_DIR` (default `./storage/landing-assets`) in `.env.example` comment block
  - [x] Persist only `assetUrl` / `assetId` in landing JSON — never file bytes in DB

- [x] **API — audit** (AC: #6)
  - [x] On PATCH, log to `adminAuthAuditLog` with changed field keys (not full image binary)

- [x] **API — tests** (AC: #1–#7)
  - [x] Unit: `SettingsService` landing parse/merge/defaults/cache invalidation
  - [x] Unit: upload validation (size, mime)
  - [x] Controller spec or service integration for super_admin RBAC 403

- [x] **api-client** (AC: #1, #5)
  - [x] `getLandingContent()`, `adminGetLandingContent()`, `adminUpdateLandingContent()`, `adminUploadLandingAsset(file, slot: 'background' | 'sidecard')`
  - [x] `queryKeys.settings.landingContent` + `queryKeys.adminLandingContent.all`
  - [x] Multipart upload: follow `adminImportQuestions` FormData + Bearer pattern (`packages/api-client/src/index.ts` ~L428)

- [x] **packages/ui — LandingHero** (AC: #1–#4, #7)
  - [x] Extend `LandingHeroProps` with `content?: LandingContentView` (merged with defaults)
  - [x] Render `subheadlineMarkdown` via `react-markdown` + `rehype-sanitize` allowlist (add deps to `packages/ui`)
  - [x] Background: optional `backgroundImage` with `overlayOpacity` CSS overlay; retain `bg-primary` fallback when null
  - [x] Sidecard: branch on `mode` — stats / image / hybrid; use configurable metrics and chart preset heights
  - [x] Keep `signInHref`, `registerHref`, `catalogHref` as props (routing stays in web app)

- [x] **Admin A-90 UI** (AC: #1–#5)
  - [x] Add section **"Nội dung trang chủ"** to `apps/admin/src/app/settings/system/page.tsx` (below existing sections or tabbed within page)
  - [x] Markdown editor: textarea + live markdown preview panel (reuse one component for subheadline)
  - [x] File inputs for background + sidecard with preview thumbnails
  - [x] Sidecard mode select; conditional stats fields vs image upload
  - [x] Overlay opacity slider + contrast warning (client-side luminance check)
  - [x] **Preview landing** button: render `<LandingHero content={formState} />` in modal or split pane (client-only, no API call)
  - [x] Separate **Lưu nội dung trang chủ** or unified save — if separate mutation, invalidate both query keys

- [x] **Web home consumption** (AC: #1, #7, #8)
  - [x] `landingContentQueryOptions` in `apps/web/src/lib/web-api.ts` with `SETTINGS_QUERY_STALE_MS`
  - [x] Pass `content` to `<LandingHero />` on `apps/web/src/app/(candidate)/(shell)/page.tsx` when `!isAuthenticated`
  - [x] Do not touch Zalo mini-app

## Dev Notes

### Why separate from STORY-13-59

STORY-13-59 (`13-59-system-settings`) delivered disclaimer, maintenance, email templates. This story **extends** the same A-90 screen and `system_settings` KV store but uses **dedicated REST routes** to keep payloads small and enable multipart asset upload. Do not regress existing system-settings ACs.

### Architecture compliance

- **Stack:** NestJS API (`apps/api`), Next.js admin (`apps/admin`), Next.js web (`apps/web`), shared types (`packages/types`), UI (`packages/ui`), api-client (`packages/api-client`)
- **Settings pattern:** `system_settings` key-value JSON — see `apps/api/src/settings/settings.service.ts` (`PLATFORM_DISCLAIMER_KEY`, `MAINTENANCE_MODE_KEY`, cache TTL `SETTINGS_CACHE_TTL_MS = 5 * 60 * 1000`)
- **RBAC:** `AdminSystemSettingsController` uses `@Roles("super_admin")` — replicate exactly on landing routes
- **Audit:** `adminAuthAuditLog.create` with `toInputJsonValue` — see `updateAdminSystemSettings` L157–169
- **Multipart:** `FileInterceptor` from `@nestjs/platform-express` — see `apps/api/src/questions/import-questions.controller.ts`
- **Screen ID:** A-90 `/settings/system` — `apps/admin/src/components/settings-section-tabs.tsx`

### References

- [Source: `_bmad-output/brainstorming/.../brainstorm-intent.md`] — MoSCoW scope, API sketch, user decisions
- [Source: `_bmad-output/implementation-artifacts/stories/13-59-system-settings.md`] — settings KV pattern, audit, A-90 UI, staleTime
- [Source: `packages/ui/src/components/landing-hero.tsx`] — current hardcoded hero to extract as defaults

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Implemented `landing_content` key in `system_settings` with 5-minute API cache and `landing_content_updated` audit action.
- Separate admin/public routes: `admin/landing-content`, `settings/landing-content`, `settings/landing-assets/:id`.
- Local disk asset storage with 2MB + MIME validation; `SafeMarkdown` shared between admin preview and public hero.
- Web home fetches landing content only for anonymous users; defaults via `mergeLandingContent`.
- API tests: 252/252 pass (includes 2 new landing tests + storage validation).

### File List

- packages/types/src/landing-content.ts
- packages/types/src/index.ts
- packages/api-client/src/index.ts
- packages/ui/package.json
- packages/ui/src/components/safe-markdown.tsx
- packages/ui/src/components/landing-hero.tsx
- packages/ui/src/index.ts
- apps/api/src/settings/settings.service.ts
- apps/api/src/settings/settings.service.spec.ts
- apps/api/src/settings/settings.controller.ts
- apps/api/src/settings/settings.module.ts
- apps/api/src/settings/landing-asset.storage.ts
- apps/api/src/settings/landing-asset.storage.spec.ts
- apps/api/src/settings/admin-landing-content.controller.ts
- apps/api/src/settings/dto/update-landing-content.dto.ts
- apps/admin/src/components/landing-content-settings.tsx
- apps/admin/src/app/settings/system/page.tsx
- apps/web/src/lib/web-api.ts
- apps/web/src/app/(candidate)/(shell)/page.tsx
- .env.example
- .gitignore
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/stories/13-74-landing-content-cms-a90.md

## Change Log

- 2026-07-13: Story created from brainstorming converge + brownfield analysis (extends EPIC-13 / A-90)
- 2026-07-13: Implemented landing content CMS — API, admin A-90 UI, web hero consumption, tests
