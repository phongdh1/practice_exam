---
name: Practice Exam
description: CNVCK certification prep — professional, trustworthy Vietnamese ed-tech. shadcn/ui on Next.js + Tailwind; this DESIGN.md specifies the brand-layer delta for candidate and admin surfaces.
status: final
updated: 2026-07-09
colors:
  # Brand overrides on shadcn defaults. Unlisted tokens inherit shadcn
  # (background, foreground, muted, muted-foreground, card, border, input, ring, destructive).
  primary: '#1B4F72'
  primary-foreground: '#FFFFFF'
  secondary: '#E8F4F8'
  secondary-foreground: '#1B4F72'
  accent: '#0E7C4A'
  accent-foreground: '#FFFFFF'
  success: '#0E7C4A'
  success-foreground: '#FFFFFF'
  success-muted: '#E6F4ED'
  error: '#C0392B'
  error-foreground: '#FFFFFF'
  error-muted: '#FDECEA'
  warning: '#D68910'
  warning-foreground: '#1A1B1F'
  warning-muted: '#FEF5E7'
  surface-subtle: '#F7F9FB'
  surface-elevated: '#FFFFFF'
  ink-muted: '#5D6D7E'
  ink-disabled: '#AEB6BF'
  price-highlight: '#1B4F72'
  subscription-active: '#0E7C4A'
  subscription-expiring: '#D68910'
  disclaimer-bg: '#FEF9E7'
  disclaimer-border: '#F4D03F'
typography:
  # [ASSUMPTION] Be Vietnam Pro for Vietnamese diacritics; Inter fallback for Latin.
  display:
    fontFamily: 'Be Vietnam Pro, Inter, system-ui, sans-serif'
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: -0.02em
  display-sm:
    fontFamily: 'Be Vietnam Pro, Inter, system-ui, sans-serif'
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.3'
  heading:
    fontFamily: 'Be Vietnam Pro, Inter, system-ui, sans-serif'
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.35'
  body:
    fontFamily: 'Be Vietnam Pro, Inter, system-ui, sans-serif'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.55'
  body-sm:
    fontFamily: 'Be Vietnam Pro, Inter, system-ui, sans-serif'
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label:
    fontFamily: 'Be Vietnam Pro, Inter, system-ui, sans-serif'
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  caption:
    fontFamily: 'Be Vietnam Pro, Inter, system-ui, sans-serif'
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
  mono:
    fontFamily: 'JetBrains Mono, ui-monospace, monospace'
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  question-stem:
    fontFamily: 'Be Vietnam Pro, Inter, system-ui, sans-serif'
    fontSize: 17px
    fontWeight: '500'
    lineHeight: '1.6'
rounded:
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
  '10': 40px
  '12': 48px
  gutter-mobile: 16px
  gutter-tablet: 24px
  gutter-desktop: 32px
  section-gap: 32px
  question-padding: 20px
components:
  button-primary:
    background: '{colors.primary}'
    foreground: '{colors.primary-foreground}'
    radius: '{rounded.md}'
  button-subscribe:
    background: '{colors.primary}'
    foreground: '{colors.primary-foreground}'
    radius: '{rounded.md}'
    minHeight: 48px
  answer-option:
    background: '{colors.surface-elevated}'
    border: '1px solid {colors.border}'
    radius: '{rounded.md}'
    padding: '{spacing.4}'
  answer-option-selected:
    border: '2px solid {colors.primary}'
    background: '{colors.secondary}'
  answer-option-correct:
    border: '2px solid {colors.success}'
    background: '{colors.success-muted}'
  answer-option-incorrect:
    border: '2px solid {colors.error}'
    background: '{colors.error-muted}'
  subject-card:
    background: '{colors.surface-elevated}'
    radius: '{rounded.lg}'
    shadow: 'sm'
    padding: '{spacing.5}'
  price-badge:
    color: '{colors.price-highlight}'
    fontWeight: '700'
  subscription-badge-active:
    background: '{colors.success-muted}'
    foreground: '{colors.subscription-active}'
    radius: '{rounded.full}'
  subscription-badge-expiring:
    background: '{colors.warning-muted}'
    foreground: '{colors.subscription-expiring}'
    radius: '{rounded.full}'
  disclaimer-banner:
    background: '{colors.disclaimer-bg}'
    border: '1px solid {colors.disclaimer-border}'
    radius: '{rounded.md}'
    padding: '{spacing.3}'
  mock-exam-timer:
    fontFamily: '{typography.mono.fontFamily}'
    fontSize: '{typography.mono.fontSize}'
    color: '{colors.primary}'
  progress-bar-fill:
    background: '{colors.accent}'
    radius: '{rounded.full}'
  study-meter-badge:
    foreground: '{colors.primary}'
    captionFont: '{typography.caption}'
    progressFill: '{colors.primary}'
  study-question-row:
    background: '{colors.surface-elevated}'
    border: '1px solid {colors.border}'
    radius: '{rounded.md}'
    padding: '{spacing.4}'
    stemFont: '{typography.body-sm}'
    metadataFont: '{typography.caption}'
    metadataColor: '{colors.ink-muted}'
  study-question-row-locked:
    background: '{colors.surface-subtle}'
    foreground: '{colors.ink-muted}'
    lockIconColor: '{colors.ink-disabled}'
    border: '1px dashed {colors.border}'
  admin-data-table:
  # Admin inherits shadcn Table; no brand override beyond primary actions.
    headerBackground: '{colors.surface-subtle}'
    rowHover: '{colors.surface-subtle}'
---

## Brand & Style

Practice Exam is a **professional certification prep tool** for Vietnamese securities professionals preparing for CNVCK. The visual posture is **trustworthy, clear, and exam-serious** — closer to a well-designed bank or government-adjacent service than a gamified study app. Candidates are investing money and study time; the interface must signal accuracy, legitimacy, and calm focus.

The product is **not** an official UBCKNN examination. Visual language must never imply government endorsement: no state seals, no faux-official crests, no "official exam" styling. [ASSUMPTION: no custom logo beyond wordmark + simple mark; final brand assets TBD.]

**UI system:** shadcn/ui on Next.js 15+ with Tailwind CSS for responsive web and Admin Back-Office. Zalo Mini App candidate surfaces inherit this token set where Zalo platform constraints allow; platform-native chrome (navigation bar, OAuth buttons) follows Zalo guidelines. DESIGN.md specifies brand-layer deltas; unlisted shadcn components ship at defaults.

**Aesthetic keywords:** professional, readable, Vietnamese-first, exam-focused, restrained color, no gamification chrome.

## Colors

The palette is anchored in **institutional navy** (trust, finance) and **verified green** (correct answers, active subscriptions). Chromatic restraint everywhere else — shadcn defaults handle neutrals.

- **Primary Navy (`{colors.primary}` / `#1B4F72`)** — Brand color. Primary CTAs (Đăng ký, Bắt đầu luyện tập), active nav, links, Subject price emphasis. Replaces shadcn default `primary`. Reads as professional, not playful.
- **Secondary Mist (`{colors.secondary}` / `#E8F4F8`)** — Selected answer backgrounds, subtle highlights, info panels. Pairs with primary for interactive states without adding a third brand hue.
- **Success Green (`{colors.success}` / `#0E7C4A`)** — Correct answer feedback, active subscription badges, pass indicators on Mock Exam results. Never used for decorative chrome.
- **Error Red (`{colors.error}` / `#C0392B`)** — Incorrect answers, failed payment, validation errors. Muted variants (`{colors.error-muted}`) for answer-option backgrounds post-submit.
- **Warning Amber (`{colors.warning}` / `#D68910`)** — Subscription expiring within 3 days, timer urgency below 5 minutes, admin attention items. Not for marketing highlights.
- **Disclaimer Yellow (`{colors.disclaimer-bg}`, `{colors.disclaimer-border}`)** — UBCKNN non-affiliation disclaimer banner. Persistent but visually distinct from error/warning states.
- **Surface tokens** — `{colors.surface-subtle}` for page backgrounds and admin table headers; `{colors.surface-elevated}` for cards on subtle backgrounds.
- **Ink muted (`{colors.ink-muted}`)** — Secondary text, metadata, Free Tier counters. Replaces generic `muted-foreground` where Vietnamese long labels need slightly higher contrast. [ASSUMPTION: verified AA against white.]

Avoid: gradients, neon accents, achievement-badge gold, streak flames, cartoon mascots, dark-mode-by-default (light mode primary for exam readability; dark mode deferred post-MVP [ASSUMPTION]).

## Typography

Vietnamese UI requires full diacritic support. [ASSUMPTION: **Be Vietnam Pro** as primary typeface with Inter fallback; both support Vietnamese and render well at 16px body on mobile.]

| Role | Token | Usage |
|---|---|---|
| Display | `{typography.display}` | Mock Exam results score, paywall headline |
| Display small | `{typography.display-sm}` | Subject catalog section headers, empty-state heroes |
| Heading | `{typography.heading}` | Card titles, section labels, question numbers |
| Body | `{typography.body}` | Explanations, descriptions, form labels |
| Body small | `{typography.body-sm}` | Metadata, timestamps, helper text |
| Question stem | `{typography.question-stem}` | Question text in Practice and Mock Exam — slightly larger and medium weight for scanability |
| Caption | `{typography.caption}` | Legal footnotes, Free Tier counter, disclaimer subtext |
| Mono | `{typography.mono}` | Mock Exam countdown timer, admin transaction IDs |

**Rules:** Left-align all reading text (Vietnamese convention). No all-caps labels except admin table column headers. Line length max ~65 characters on web for explanations. Question stems may span full card width.

Zalo Mini App: inherit token sizes; respect Zalo safe-area insets. [ASSUMPTION: Zalo system font acceptable fallback if custom webfont load fails in Mini App webview.]

## Layout & Spacing

Spacing scale: `{spacing.1}` through `{spacing.12}` (4px base). Gutters: `{spacing.gutter-mobile}` (16px) on Zalo Mini App and mobile web; `{spacing.gutter-tablet}` (24px) at `md`; `{spacing.gutter-desktop}` (32px) at `lg+`.

**Candidate surfaces (web + Zalo):**
- Single-column primary layout on mobile; Subject catalog becomes 2-column card grid at `md` (768px+).
- Practice/Mock question cards: `{spacing.question-padding}` internal padding, full-width within gutter.
- Sticky bottom bar for Practice Mode navigation (Câu tiếp / Kết thúc) on mobile.
- Max content width `max-w-2xl` (672px) for question reading comfort on desktop web.

**Admin Back-Office:**
- Sidebar + main content at `lg+`; sidebar collapses to icons at `md`; hamburger sheet below `md`.
- Data-dense tables permitted; max width unconstrained. Minimum table row height 48px for touch targets on tablet admin use.

**Zalo Mini App:** Bottom tab navigation (Trang chủ, Tiến độ, Tài khoản) [ASSUMPTION: 3-tab pattern aligned with Zalo Mini App conventions]. Top bar shows Subject context when in practice flow.

## Elevation & Depth

Restrained elevation — exam focus prefers flat cards over floating layers.

- **Level 0:** Page background `{colors.surface-subtle}`.
- **Level 1:** Cards, answer options — `shadow-sm` on hover only; default flat with `{colors.border}` hairline.
- **Level 2:** Modals, paywall sheet, disclaimer first-visit dialog — shadcn `Dialog` / `Sheet` default shadows.
- **Level 3:** Mock Exam timer bar — sticky top, subtle `shadow-md` to separate from scrolling questions.

No parallax, no glassmorphism. Depth communicates layering (modal over page), not delight.

## Shapes

Corner radii: `{rounded.sm}` (6px) inputs and chips; `{rounded.md}` (8px) buttons and answer options; `{rounded.lg}` (12px) Subject cards and result panels; `{rounded.full}` badges and progress bars only.

Imagery in Questions (charts, tables as images) inherits container `{rounded.md}`. No circular crop on content images.

Admin surfaces use `{rounded.md}` consistently — sharper than consumer apps, signaling tool not toy.

## Components

**Inherited from shadcn unchanged:** `Dialog`, `Sheet`, `DropdownMenu`, `Toast`, `Tabs`, `Avatar`, `Separator`, `Form`, `Input`, `Select`, `Checkbox`, `RadioGroup`, `Progress`, `Badge` (neutral variants), `Skeleton`, `Alert`.

**Brand-layer components:**

| Component | Visual spec |
|---|---|
| **Button primary** | `{components.button-primary}` — full-width on mobile subscribe CTAs |
| **Button subscribe** | `{components.button-subscribe}` — min 48px height for thumb reach |
| **Subject card** | `{components.subject-card}` — thumbnail area for Subject icon [ASSUMPTION: simple letter/icon, no stock photos]; price in `{components.price-badge}` |
| **Answer option** | `{components.answer-option}` — radio/checkbox left, label right; states: default → selected → correct/incorrect post-submit |
| **Subscription badge** | Active: `{components.subscription-badge-active}`; expiring ≤3 days: `{components.subscription-badge-expiring}` |
| **Disclaimer banner** | `{components.disclaimer-banner}` — always includes info icon; text from admin CMS (FR-15) |
| **Mock Exam timer** | `{components.mock-exam-timer}` — fixed top bar; turns `{colors.warning}` below 5:00 |
| **Progress bar** | shadcn `Progress` with `{components.progress-bar-fill}` override |
| **Free Tier meter** | Thin `{colors.primary}` progress on Subject detail; caption text below |
| **Study Tier meter** | `{components.study-meter-badge}` — same visual weight as Free Tier meter but distinct caption ("câu ôn" vs "câu luyện tập"); stacked below Free Tier meter on Z-11/W-11; inline on Z-12/W-12 header |
| **Study question row** | `{components.study-question-row}` — stem preview truncated 2 lines; topic/difficulty chips; chevron right. Locked variant: `{components.study-question-row-locked}` with lock icon, no answer preview |
| **Study detail (read-only)** | Reuses `{components.answer-option}` layout; correct option pre-styled `{components.answer-option-correct}`; no selected/incorrect states. Explanation block uses `{typography.body}` on `{colors.surface-subtle}` panel |
| **Paywall sheet** | shadcn `Sheet` bottom on mobile, centered `Dialog` on desktop; price large in `{typography.display-sm}`, VND formatted with thousand separators (100.000 ₫) |
| **Question report flag** | Ghost button, `{colors.ink-muted}`; destructive confirmation only on submit |
| **Admin data table** | `{components.admin-data-table}` — zebra optional; status pills use semantic colors |

**Payment provider buttons:** Use official ZaloPay / VNPay / MoMo brand assets per provider guidelines; do not recolor provider logos.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Use `{colors.primary}` for primary actions and trust signals | Use primary for correct/incorrect answer feedback (use success/error) |
| Show UBCKNN disclaimer on `{components.disclaimer-banner}` at first visit and in footer | Imply government endorsement with crests, seals, or "official" styling |
| Format VND as `100.000 ₫` with Vietnamese locale | Use `$` or USD formatting |
| Keep Practice Mode UI minimal — question, options, explanation | Add streaks, XP, leaderboards, or celebration confetti |
| Keep Study Mode read-only — answers visible on detail load | Add answer-submit step or gamification in Study detail |
| Distinguish Study Tier meter copy from Free Tier meter on Subject detail | Use identical meter labels for study and practice |
| Use `{typography.question-stem}` for all assessable content | Shrink question text below 16px effective size |
| Inherit shadcn defaults for standard form controls | Custom-redesign every shadcn component |
| Show subscription status prominently after payment (climax moment) | Hide entitlement state behind settings |
| Use provider-native payment button styling | Wrap payment CTAs in generic brand buttons |
| Admin: dense tables, clear status pills | Consumer-playful illustrations in admin |
| Zalo Mini App: respect safe areas and platform OAuth button | Fight Zalo navigation patterns with custom chrome |
