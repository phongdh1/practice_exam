---
title: 'Client-side web navigation (partial content loading)'
type: 'bugfix'
created: '2026-07-02'
status: 'done'
baseline_commit: 'NO_VCS'
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-Practice_Exam-2026-06-29/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** On the candidate web app (`apps/web`), clicking nav links and in-app anchors triggers a full browser document reload instead of Next.js client-side navigation, so the entire page (including header, footer, and shell) reloads visibly.

**Approach:** Introduce an injectable internal link component in `@practice-exam/ui`, wire it to `next/link` from the web app, and hoist the candidate shell (top nav + bottom nav) into a persistent route-group layout so only `{children}` swap on navigation.

## Boundaries & Constraints

**Always:**
- Keep `@practice-exam/ui` free of `next/link` imports — use an optional `linkComponent` prop or shared `InternalLink` abstraction.
- Preserve existing Zalo mini-app behavior (`onSubjectClick` / `onCardClick` callbacks must still work unchanged).
- Use Next.js App Router conventions (route groups, `usePathname` for active tab).
- Keep external redirects (`window.location.href` for payment/OAuth) as full navigations.

**Ask First:**
- Whether admin app (`apps/admin`) should be included in this spec or deferred to a follow-up.

**Never:**
- Do not add React Router or a second routing library to the web app.
- Do not change API routes, auth flows, or payment redirect behavior.
- Do not refactor unrelated admin shell or Zalo routing in this spec.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Main nav click | User on `/`, clicks "Tiến độ" | URL becomes `/progress`; only main content area updates; top/bottom nav stay mounted | N/A |
| Subject card click | User on catalog, clicks subject card | Client navigates to `/subjects/{id}` without full reload | N/A |
| Progress history link | User on `/progress`, clicks "Xem lịch sử đầy đủ" | Client navigates to `/progress/history` | N/A |
| External / auth redirect | Checkout or sign-in OAuth | Full page navigation via `window.location` or external URL | Unchanged |
| Anchor hash link | Landing hero "Bắt đầu luyện tập" with `#catalog` | Scroll to in-page anchor without route change | N/A |
| Unauthenticated account tab | User clicks account nav | Navigates to `/account` or sign-in per existing behavior | N/A |

</frozen-after-approval>

## Code Map

- `packages/ui/src/components/internal-link.tsx` — shared link wrapper; renders `linkComponent` when provided, else `<a>`
- `packages/ui/src/components/candidate-top-nav.tsx` — replace raw `<a>` with `InternalLink`
- `packages/ui/src/components/candidate-bottom-nav.tsx` — replace raw `<a>` with `InternalLink`
- `packages/ui/src/components/subject-card.tsx` — wrap card anchor with `InternalLink`
- `packages/ui/src/components/progress-dashboard.tsx` — history + fallback practice links via `InternalLink`
- `packages/ui/src/components/landing-hero.tsx` — in-app CTAs via `InternalLink` (hash links stay `<a>`)
- `packages/ui/src/components/attempt-history-list.tsx` — fallback link via `InternalLink`
- `packages/ui/src/index.ts` — export `InternalLink` type/props if needed by apps
- `apps/web/src/components/client-link.tsx` — thin `next/link` adapter passed as `linkComponent`
- `apps/web/src/app/(candidate)/layout.tsx` — persistent shell: `CandidateTopNav`, `{children}`, `CandidateBottomNav`; derive `active` from `usePathname()`
- `apps/web/src/app/(candidate)/page.tsx` — move from `app/page.tsx`; drop duplicated shell
- `apps/web/src/app/(candidate)/progress/` — move progress routes; drop duplicated shell from pages
- `apps/web/src/app/(candidate)/subjects/` — move subject routes; drop duplicated shell from pages
- `apps/web/src/app/providers.tsx` — optionally wrap with link context provider if prop-drilling is excessive

## Tasks & Acceptance

**Execution:**
- [x] `packages/ui/src/components/internal-link.tsx` — add `InternalLink` with optional `linkComponent` prop — centralizes link rendering without Next.js dependency
- [x] `packages/ui/src/components/candidate-top-nav.tsx` — use `InternalLink` for brand, nav items, account icon — fixes main nav full reloads
- [x] `packages/ui/src/components/candidate-bottom-nav.tsx` — use `InternalLink` for all tabs — fixes mobile nav full reloads
- [x] `packages/ui/src/components/subject-card.tsx` — use `InternalLink` when `href` is set — fixes catalog card full reloads
- [x] `packages/ui/src/components/progress-dashboard.tsx` — use `InternalLink` for history link and fallback practice link — fixes progress sub-nav reloads
- [x] `packages/ui/src/components/landing-hero.tsx` — use `InternalLink` for sign-in/register; keep `#` anchors as plain `<a>` — fixes landing CTA reloads
- [x] `packages/ui/src/components/attempt-history-list.tsx` — use `InternalLink` for fallback link
- [x] `packages/ui/src/index.ts` — export new link types/components
- [x] `apps/web/src/components/client-link.tsx` — create Next.js `Link` adapter
- [x] `apps/web/src/app/(candidate)/layout.tsx` — add persistent candidate shell with pathname-based active tab
- [x] `apps/web/src/app/(candidate)/` — move `page.tsx`, `progress/`, `subjects/` from `app/`; remove per-page `CandidateTopNav` / `CandidateBottomNav` duplication
- [x] `apps/web/src/app/page.tsx` (and moved pages) — replace remaining raw `<a href="/sign-in">` with `ClientLink` or `Link`
- [x] `apps/web/src/app/(candidate)/progress/page.tsx` — pass `linkComponent` or use app-level provider so `ProgressDashboard` history link is client-side

**Acceptance Criteria:**
- Given the user is on the web home page, when they click "Tiến độ" in the top or bottom nav, then the URL changes to `/progress`, the nav bar does not flash/reload, and only the main content area updates.
- Given the user is on the subject catalog, when they click a subject card, then navigation to `/subjects/{id}` happens without a full document reload (no white flash, no full HTML refetch visible in Network tab as `document` navigation).
- Given the user is on `/progress`, when they click "Xem lịch sử đầy đủ", then they reach `/progress/history` via client-side navigation.
- Given the user completes a payment checkout redirect, when returning via external URL, then full page load still occurs (unchanged behavior).
- Given the Zalo mini-app uses `SubjectCatalogGrid` with `onSubjectClick`, when a subject is tapped, then callback navigation still works with no regression.

## Spec Change Log

## Design Notes

Use a React context in the web app to avoid passing `linkComponent` through every page:

```tsx
// apps/web — LinkProvider wraps (candidate) layout
const LinkContext = createContext<LinkComponent>(DefaultAnchor);
export function useAppLink() { return useContext(LinkContext); }
// InternalLink reads linkComponent from optional prop OR a module-level default set by web app
```

Route group `(candidate)` keeps URLs unchanged (`/` not `/candidate`). Pages outside the group (`sign-in`, `register`, `auth/*`, `checkout/*`) keep their own layouts without the candidate shell.

Active tab mapping from pathname:
- `/`, `/subjects/*` → `subjects`
- `/progress`, `/progress/*` → `progress`
- `/account`, `/account/*` → `account`

## Verification

**Commands:**
- `pnpm --filter @practice-exam/ui build` — expected: no TypeScript errors
- `pnpm --filter web build` — expected: Next.js build succeeds
- `pnpm --filter web lint` — expected: no new lint errors (if lint script exists)

**Manual checks (if no CLI):**
- Start web dev server; click between Môn học / Tiến độ tabs — nav stays visible, no full page reload.
- Open DevTools Network; filter Document — nav clicks should not fetch a new HTML document.
- Click a subject card — client transition to subject detail page.

## Suggested Review Order

**Client-side link injection**

- Framework-agnostic link wrapper with optional Next.js adapter via context.
  [`internal-link.tsx:1`](../../packages/ui/src/components/internal-link.tsx#L1)

- Next.js `Link` adapter wired into the shared UI provider.
  [`client-link.tsx:1`](../../apps/web/src/components/client-link.tsx#L1)

**Persistent candidate shell**

- Route-group layout keeps top/bottom nav mounted across page transitions.
  [`layout.tsx:1`](../../apps/web/src/app/(candidate)/(shell)/layout.tsx#L1)

- Per-page shell overrides for sign-in CTA and exam-mode bottom nav hiding.
  [`candidate-shell-context.tsx:1`](../../apps/web/src/components/candidate-shell-context.tsx#L1)

**Shared UI navigation fixes**

- Top and bottom nav now use `InternalLink` instead of raw anchors.
  [`candidate-top-nav.tsx:47`](../../packages/ui/src/components/candidate-top-nav.tsx#L47)

- Subject cards and progress links navigate without full document reload.
  [`subject-card.tsx:156`](../../packages/ui/src/components/subject-card.tsx#L156)
