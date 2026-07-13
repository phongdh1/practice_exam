---
title: 'Candidate Account/Profile screen (W-50)'
type: 'feature'
created: '2026-07-13'
status: 'done'
story: 'STORY-70'
story_key: '2-70-candidate-account-profile-w50'
baseline_commit: '580fa2536245e24f9d39f2ea1711a11da8f6fa5d'
context:
  - '{project-root}/_bmad-output/stitch-html/Account_Profile_W-50_.html'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-Practice_Exam-2026-06-29/EXPERIENCE.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-web-session-provider.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Nav links to `/account` but no W-50 profile page exists — only W-51 (`/account/link/zalo`) and W-52 merge summary. Candidates cannot view subscriptions, linked identities, recent attempts, or settings info from the shell.

**Approach:** Add authenticated W-50 page inside the candidate shell at `/account`, with a shared `AccountProfileView` UI component matching the approved Stitch mockup (user-provided screenshot + `Account_Profile_W-50_.html`). Wire existing BFF endpoints (`/api/auth/me`, `/api/subscriptions`, `/api/progress/attempts`) and extend minimal API fields needed for email display and subscription subject names.

## Boundaries & Constraints

**Always:**
- Route lives at `apps/web/src/app/(candidate)/(shell)/account/page.tsx` — inherits `CandidateTopNav`, session provider, and bottom nav
- Unauthenticated visitors redirect to `/sign-in?returnTo=/account`
- Visual layout follows W-50 bento grid: profile + Zalo CTA (left), subscriptions + attempt history + settings/disclaimer (right)
- Reuse design tokens, `MaterialIcon`, `InternalLink`, `CatalogSkeleton`, `CandidateFooter`, `DisclaimerGate`
- Zalo link CTA navigates to existing `/account/link/zalo` (W-51)
- Vietnamese copy per EXPERIENCE.md voice (exam-serious, no hype)
- `data-screen="W-50"` on root view

**Ask First:**
- Adding attempt duration column (no duration field in current progress API/schema)
- Full data-export workflow (W-53) beyond static info text
- Moving `/account/link/zalo` under candidate shell layout

**Never:**
- Change session provider behavior (STORY-69)
- Implement admin-side account features
- Use `document.cookie` for auth tokens on account page
- Pixel-copy mock placeholder data when live API returns empty

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Guest visits `/account` | No session cookie | Redirect to `/sign-in?returnTo=/account` | No redirect loop |
| Authenticated profile load | Valid session | Avatar, display name, email (if email identity), verified badge when email linked | `CatalogSkeleton` while loading |
| Zalo not linked | No `zalo` identity in `/api/auth/me` | Profile shows "Chưa liên kết"; primary CTA card visible | CTA links to W-51 |
| Zalo linked | `zalo` identity present | Hide or collapse Zalo CTA; show linked status | N/A |
| Active subscriptions | `GET /api/subscriptions` returns rows | Cards with subject name, status color (active/expiring/expired), expiry date formatted `dd/MM/yyyy` | Empty state: "Chưa có gói đăng ký" |
| Expiring subscription | `status: expiring` or `daysUntilExpiry <= 3` | Amber left border + warning copy "(Sắp tới)" | N/A |
| Recent attempts | `GET /api/progress/attempts` | Table of latest 5 items: subject, date, score badge | Empty: link to `/progress/history` |
| Suspended account | `/api/auth/me` → 401 `ACCOUNT_SUSPENDED` | Show suspended message per EXPERIENCE.md | No partial data render |
| Settings rows | Static W-53 info | Privacy policy + data export info (copy only, no export API) | Disclaimer text from platform settings |

</frozen-after-approval>

## Code Map

- `packages/types/src/index.ts` — extend `AuthMeUser` with optional `email`; extend `SubscriptionSummary` with optional `subjectName`
- `apps/api/src/auth/auth.service.ts` — include `email` in `getMe` response (email identity externalId)
- `apps/api/src/subscriptions/subscriptions.service.ts` — join subject name in `listForUser`
- `packages/ui/src/components/account-profile-view.tsx` — new W-50 presentational component (bento layout)
- `packages/ui/src/index.ts` — export `AccountProfileView`
- `apps/web/src/app/(candidate)/(shell)/account/page.tsx` — data fetching + page shell
- `apps/web/src/lib/web-api.ts` — optional `subscriptionsQueryOptions` helper (mirror disclaimer pattern)
- `_bmad-output/stitch-html/Account_Profile_W-50_.html` — design reference (layout, spacing, copy)
- `apps/web/src/app/account/link/zalo/page.tsx` — existing W-51 target (unchanged)
- `spec-web-session-provider.md` — session patterns; do not regress

## Tasks & Acceptance

**Execution:**
- [x] `packages/types/src/index.ts` -- add `email?: string` to `AuthMeUser`; add `subjectName?: string` to `SubscriptionSummary` -- enables profile email + subscription labels
- [x] `apps/api/src/auth/auth.service.ts` -- return email from email identity in `getMe` -- matches W-50 profile card
- [x] `apps/api/src/subscriptions/subscriptions.service.ts` -- include subject in `listForUser` query; map `subjectName` in `toSummary` -- subscription cards show subject title
- [x] `packages/ui/src/components/account-profile-view.tsx` -- implement W-50 bento UI per stitch reference -- shared, testable presentation
- [x] `packages/ui/src/index.ts` -- export `AccountProfileView` and props type -- web app import
- [x] `apps/web/src/app/(candidate)/(shell)/account/page.tsx` -- fetch session, subscriptions, attempts (limit 5), disclaimer; redirect guests; render `AccountProfileView` inside `DisclaimerGate` -- W-50 route
- [x] `apps/web/src/lib/web-api.ts` -- add typed query options for subscriptions list if not inline in page -- consistent TanStack Query keys

**Acceptance Criteria:**
- Given an unauthenticated user, when they open `/account`, then they are redirected to sign-in with return URL preserved
- Given a signed-in candidate, when they click "Tài khoản" in nav, then W-50 renders inside the candidate shell with profile, subscriptions, attempt summary, and settings/disclaimer sections
- Given a user with email identity, when the profile loads, then email and "Đã xác thực" badge are shown
- Given a user without Zalo identity, when the profile loads, then the Zalo linking CTA card is visible and links to `/account/link/zalo`
- Given active or expiring subscriptions, when the page loads, then each card shows subject name, status styling, and formatted expiry date
- Given attempt history exists, when the page loads, then the five most recent attempts appear in the summary table with links to attempt detail
- Given the stitch W-50 mockup, when comparing desktop layout, then bento grid proportions (4/8 columns), card hierarchy, and Vietnamese copy align with the approved design

## Spec Change Log

## Design Notes

Profile email is derived server-side from the email identity only — never expose other providers' externalIds on `GET /auth/me`.

Attempt history table omits duration column (not in current schema). Show score as percent badge from `scorePercent`; if null, show em dash.

"Gia hạn ngay" links to subject catalog `/` or first expiring subscription's subject detail — use `/subjects/{subjectId}` when expiring sub exists, else `/`.

Golden layout reference: stitch bento — left column profile card + navy Zalo CTA; right column subscriptions grid, attempt table, settings + disclaimer cards.

## Verification

**Commands:**
- `pnpm --filter @practice-exam/api exec tsc --noEmit` -- expected: no type errors
- `pnpm --filter @practice-exam/ui exec tsc --noEmit` -- expected: no type errors
- `pnpm --filter web exec tsc --noEmit` -- expected: no type errors

**Manual checks:**
- Sign in → navigate to `/account` → page matches W-50 layout with live data
- Sign out → `/account` redirects to sign-in
- User without subscriptions sees empty state, not mock data

## Suggested Review Order

**W-50 page shell & data wiring**

- Guest redirect and authenticated data orchestration for the account route
  [`page.tsx:44`](../../apps/web/src/app/(candidate)/(shell)/account/page.tsx#L44)

- Shared subscriptions query helper for TanStack Query consistency
  [`web-api.ts:62`](../../apps/web/src/lib/web-api.ts#L62)

**W-50 presentational UI**

- Bento layout component matching Stitch W-50 mockup
  [`account-profile-view.tsx:78`](../../packages/ui/src/components/account-profile-view.tsx#L78)

- Package export surface for the new view
  [`index.ts:175`](../../packages/ui/src/index.ts#L175)

**API & type extensions**

- Email on session profile for W-50 card display
  [`auth.service.ts:344`](../../apps/api/src/auth/auth.service.ts#L344)

- Subject names joined onto subscription summaries
  [`subscriptions.service.ts:17`](../../apps/api/src/subscriptions/subscriptions.service.ts#L17)

- Shared types for email and subjectName fields
  [`index.ts:32`](../../packages/types/src/index.ts#L32)

**Auth return path**

- Sign-in honors `returnTo` after email login
  [`page.tsx:12`](../../apps/web/src/app/sign-in/page.tsx#L12)

**Disclaimer gate**

- W-50 screen id registered for disclaimer acknowledgment
  [`disclaimer-gate.tsx:15`](../../packages/ui/src/components/disclaimer-gate.tsx#L15)
