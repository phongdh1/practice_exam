---
title: 'Web landing page UI — match marketing mockup'
type: 'feature'
created: '2026-07-20'
status: 'done'
baseline_commit: '3ec2b01a050f2e577fbe4cb2a6636a445341becf'
context:
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-Practice_Exam-2026-06-29/DESIGN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Guest home is only CMS hero + paginated catalog + minimal footer. It does not match the approved marketing mockup (features row, featured subjects, dark CTA band, disclaimer footer).

**Approach:** Restyle and extend the guest landing in `packages/ui` + `apps/web` home composition to match the mockup section order and visual language, using existing CMS hero content and live catalog data for featured subjects. Authenticated home stays catalog-first (no marketing sections).

## Boundaries & Constraints

**Always:**
- Guest-only marketing stack: Hero → Why-choose (3 cards) → Featured subjects (≤2) → Dark CTA → Footer with yellow disclaimer banner.
- Preserve CMS-driven hero fields via `mergeLandingContent` (badge, headline, subhead, CTAs, sidecard).
- Brand tokens from DESIGN.md / existing CSS vars (`primary` ≈ `#1B4F72`, secondary, accent/success, disclaimer yellow). Be Vietnam Pro.
- Featured subjects from catalog: prefer `isHot`, else first available; show `coverImageUrl` when present; link to `/subjects/{id}`.
- Keep full catalog reachable via `#catalog` / “Xem tất cả môn học” (primary hero CTA and featured header link).
- Responsive: stack columns on mobile; hero sidecard may stay `md+` only.
- Vietnamese UI copy aligned with mockup defaults.

**Ask First:**
- Extending `LandingContent` / admin CMS for features or CTA copy (default: hardcoded mockup defaults).
- Changing authenticated home to include marketing sections.
- Adding API fields solely for marketing badges (e.g. question counts / category tags).

**Never:**
- Redesign admin app, auth/register flows, or disclaimer modal gate behavior.
- Invent question counts or category tags not returned by catalog API.
- Purple/glow/dark-mode redesign; replace Be Vietnam Pro with Inter/Roboto as primary.
- Break `InternalLink` client navigation on in-app CTAs.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Guest happy path | Unauthenticated; CMS + catalog OK | Full mockup sections; featured ≤2 cards; catalog below or at `#catalog` | N/A |
| Guest CMS missing | Landing content 404/empty | Hero uses `DEFAULT_LANDING_CONTENT` | No crash |
| Guest catalog empty | 0 subjects | Featured empty state or hide strip; catalog empty message unchanged | N/A |
| Guest catalog error | listSubjects fails | Featured omitted/hidden; existing catalog error + pull-to-refresh | Show catalog error |
| No cover image | Subject without `coverImageUrl` | Card uses neutral placeholder (no broken img) | N/A |
| Authenticated | Session present | No hero/features/CTA; catalog + footer as today | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/(candidate)/(shell)/page.tsx` — compose guest marketing sections + catalog `#catalog`
- `packages/ui/src/components/landing-hero.tsx` — polish to mockup (spacing, white primary CTA, green sidecard footnote badge)
- `packages/ui/src/components/landing-features.tsx` — **new** Why-choose 3-card section
- `packages/ui/src/components/landing-featured-subjects.tsx` — **new** PHASE 1 / featured strip
- `packages/ui/src/components/landing-cta-band.tsx` — **new** dark CTA → `/register`
- `packages/ui/src/components/candidate-footer.tsx` — disclaimer banner + mockup footer layout
- `packages/ui/src/components/subject-catalog-grid.tsx` / `subject-card.tsx` — unchanged API; optional cover reuse patterns
- `packages/ui/src/index.ts` — export new sections
- `packages/types/src/landing-content.ts` — read-only defaults (no schema expand unless Ask First approved)
- Mockup reference (session): guest marketing composition for “LUYỆN CHỨNG CHỈ” / CNVCK Prep

## Tasks & Acceptance

**Execution:**
- [x] `packages/ui/src/components/landing-hero.tsx` — align layout/typography/CTA/sidecard badge with mockup; keep CMS wiring
- [x] `packages/ui/src/components/landing-features.tsx` — add 3 feature cards (question bank, exam structure, progress) with mockup copy/icons
- [x] `packages/ui/src/components/landing-featured-subjects.tsx` — ≤2 cards from subjects (`isHot` first); cover + name + description + “Khám phá ngay”; header link to `#catalog`
- [x] `packages/ui/src/components/landing-cta-band.tsx` — dark primary band + register CTA
- [x] `packages/ui/src/components/candidate-footer.tsx` — yellow disclaimer strip + brand/links layout per mockup
- [x] `packages/ui/src/index.ts` — export new landing sections
- [x] `apps/web/src/app/(candidate)/(shell)/page.tsx` — guest-only compose Hero → Features → Featured → catalog `#catalog` → CTA → Footer; auth path unchanged

**Acceptance Criteria:**
- Given a guest on `/`, when the page loads, then sections appear in mockup order with brand navy/white/gray and Vietnamese copy.
- Given CMS landing content, when hero renders, then badge/headline/CTAs/sidecard still come from `mergeLandingContent`.
- Given hot or listed subjects, when featured renders, then up to 2 cards link to subject detail and covers degrade gracefully.
- Given “Bắt đầu luyện tập ngay” or “Xem tất cả môn học”, when activated, then the catalog section (`#catalog`) is reached without full page reload for in-app links.
- Given an authenticated user on `/`, when the page loads, then marketing sections are absent and catalog behavior is unchanged.
- Given viewport &lt; `md`, when guest landing renders, then columns stack and remain usable with bottom nav padding.

## Spec Change Log

## Design Notes

Guest composition (order locked):

```
LandingHero (CMS)
LandingFeatures (static)
LandingFeaturedSubjects (catalog-derived)
#catalog SubjectCatalogGrid + pagination
LandingCtaBand → /register
CandidateFooter (disclaimer + links)
```

Featured card badge: use course/group label already available in catalog grouping — do not fabricate “450 Câu hỏi”. Sidecar footnote: style existing `illustrationFootnote` as success pill when present.

## Verification

**Commands:**
- `pnpm --filter @practice-exam/ui exec tsc --noEmit` — expected: clean
- `pnpm --filter web exec tsc --noEmit` — expected: clean (or project’s usual web typecheck)

**Manual checks:**
- Guest `/`: visual parity with mockup (hero, 3 features, 2 featured, dark CTA, yellow disclaimer footer).
- Auth `/`: no marketing stack; catalog only.
- Primary CTA / “Xem tất cả” scrolls to `#catalog`.

## Suggested Review Order

**Guest composition**

- Entry point: guest marketing stack order and auth gating
  [`page.tsx:90`](../../apps/web/src/app/(candidate)/(shell)/page.tsx#L90)

- Page-1 featured pool so pagination does not reshuffle featured cards
  [`page.tsx:82`](../../apps/web/src/app/(candidate)/(shell)/page.tsx#L82)

- Auth gets compact footer; guests get marketing footer + CTA
  [`page.tsx:143`](../../apps/web/src/app/(candidate)/(shell)/page.tsx#L143)

**New landing sections**

- Static Why-choose three-card row matching mockup
  [`landing-features.tsx:30`](../../packages/ui/src/components/landing-features.tsx#L30)

- Hot-first featured cards with cover fallback
  [`landing-featured-subjects.tsx:17`](../../packages/ui/src/components/landing-featured-subjects.tsx#L17)

- Dark register CTA band
  [`landing-cta-band.tsx:10`](../../packages/ui/src/components/landing-cta-band.tsx#L10)

**Shared chrome polish**

- Marketing vs compact footer variants + disclaimer banner
  [`candidate-footer.tsx:15`](../../packages/ui/src/components/candidate-footer.tsx#L15)

- Hero sidecard footnote as success pill
  [`landing-hero.tsx:169`](../../packages/ui/src/components/landing-hero.tsx#L169)

- Package exports for new sections
  [`index.ts:131`](../../packages/ui/src/index.ts#L131)
