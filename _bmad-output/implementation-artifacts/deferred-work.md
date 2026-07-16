# Deferred Work

## Deferred from: code review of STORY-66 (2026-07-09)

- **STORY-66** — Server-side answer gating enforced by STORY-65; client lock icons are UX-only.
- **STORY-66** — Web pull-to-refresh omitted; AC-1 requires pull-to-refresh on Zalo only.

## Deferred from: code review of STORY-68 (2026-07-09)

- **STORY-68** — Partial-update preservation of `studyTierLimit` relies on existing upsert pattern; dedicated PATCH test not added.

## Deferred from: code review of STORY-65 (2026-07-09)

- **STORY-65** — `study_tier_usage.subject_id` has no FK to `subjects` (mirrors `free_tier_usage` pattern) — pre-existing schema convention.

## Deferred from: code review of STORY-65 (2026-07-10)

- **STORY-65** — List endpoint loads all `StudyViewLog` rows for user+subject+period on every list request — performance defer at scale; MVP acceptable.

## Deferred from: code review of EPIC-1 + EPIC-2 (2026-06-30)

- **STORY-1** — No git repository initialized (`baseline_commit: NO_VCS`); known project state, version control setup deferred.
- **STORY-8** — `zmp-sdk` not integrated; hardcoded test token used for dev scaffold phase.
- **STORY-9** — Cross-channel Subscription/Attempt History sync not covered by integration tests; no test infra yet.
- **STORY-9** — Link/merge audit log not covered by unit tests; test gap deferred.

## Deferred from: code review of EPIC-3 (2026-06-30)

- **STORY-12** — Subject detail resolves subject by scanning the full catalog list rather than a dedicated endpoint — performance-only defer.
- **STORY-13** — `Subscription.subjectId` is an untyped String without FK to `subjects.id` — pre-existing schema.
- **STORY-14** — Question text compliance not implemented — no Question model in codebase yet; deferred until Question content epic.

## Deferred from: spec-init-shadcn-ui-primitives (2026-06-30)

- Mount `<Toaster />` in web/admin/zalo app root providers — apps need one client mount for imperative `toast()` to render.
- Move `react-hook-form` to `peerDependencies` if consumers adopt their own `useForm` alongside `@practice-exam/ui` Form.
- Remove unused `zod` / `@hookform/resolvers` from `packages/ui` if no shared resolver helper is added.
- Add `"use client"` to remaining legacy ui primitives (dialog, button, card, etc.) for consistent Next.js RSC boundaries.
- Exclude `*.test.ts` from `packages/ui` tsc emit to avoid polluting `dist/`.

## Deferred from: code review of EPIC-5 (2026-07-01)

- **STORY-21** — `selectNextQuestion` loads full published pool per request — scale defer until question bank grows.
- **STORY-21** — Migration `DELETE` on NULL `subject_id` practice_sessions — acceptable for greenfield; archive if prod data exists.
- **STORY-22** — Answer option a11y: color-heavy states, missing `aria-label` on option icons — polish defer.
- **STORY-23** — Manual **Kết thúc** at cap routes to summary subscribe CTA instead of paywall sheet — minor UX defer.
- **Pre-existing** — `POST /entitlements/:subjectId/consume` allows quota burn outside practice flow (STORY-13 surface).

## Deferred from: code review of EPIC-6 (2026-07-01)

- **STORY-28** — Attempt history **UI** (W-41/Z-41) — no candidate history screen in EPIC-6; defer to progress epic.
- **STORY-26/28** — Thin test coverage for scoring/submit/review/timer paths — `mock-exam-attempts.service.spec.ts` has 4 tests; expand when patching.
- **STORY-26** — `expired` attempt status in schema never set by service — lifecycle gap defer.
- **STORY-29** — Zalo mini-app mock-exam routes not wired — shared UI supports Z-* screen IDs; app integration defer.

## Deferred from: code review of EPIC-6 post-patch (2026-07-01)

## Deferred from: code review of EPIC-10 (2026-07-01)

- **STORY-46** — Support role can force-delete via merge; matches UX A-63 support access; asymmetric vs super_admin-only unsuspend — by design for MVP.
- **STORY-48** — `manualRevoke` on already-revoked/expired subscription rows still succeeds — low impact policy gap.

- **STORY-26** — `syncTimer` auto-advances on section expiry without `SECTION_INCOMPLETE` validation — intentional timed auto-submit behavior.
- **STORY-27** — Submit allowed with unanswered questions — review grid warns only; no server-side block.

## Deferred from: code review of EPIC-12 (2026-07-01)

- **STORY-54** — `callbackUrl` stored in Zalo config but not wired into OAuth redirect flow; future enhancement.
- **STORY-55** — Full PayOS/SePay SDK adapter wiring deferred; mock adapters acceptable for current scaffold; admin config surface is in place.
- **STORY-56** — Zalo OAuth events not manually retryable; AC only mandates payment webhook retry.

## Deferred from: code review of STORY-64 (2026-07-02)

- **STORY-64** — Unbounded parallel bulk API requests on A-30 (`Promise.allSettled` over N single-item endpoints); acceptable for MVP per story scope; revisit with server-side bulk endpoints or client concurrency cap when bank scale grows.

## Deferred from: code review of 13-60-admin-dashboard-kpis (2026-07-02)

- **M3** — No controller integration test for `/admin/dashboard/kpis` RBAC boundaries; story scoped unit tests only.
- **M4** — In-memory KPI cache not shared across API instances; acceptable for MVP single-instance deploy.

## Deferred from: code review of 13-59-system-settings (2026-07-02)

- **M3** — No controller integration test for maintenance 503 on practice/mock paths; story scoped unit tests only.
- **M4** — Email templates persisted but not wired to notification sender; AC-3 requires storage/API only.

## Deferred from: code review of 13-58-admin-user-management (2026-07-02)

- **M4** — `logLoginEvent` on `AdminUsersService` is unused dead code; login audit lives in `AdminAuthService`.
- **M5** — No controller-level integration test for disabled-login 403 path; story scoped to unit tests only.

## Deferred from: code review of 13-57-rbac-enforcement (2026-07-01)

- **M3** — `AdminRolesGuard` fail-open when `@Roles` omitted — pre-existing pattern; default-deny refactor deferred.
- **M4** — No controller-level integration tests for RBAC 403 boundaries; story scoped to unit tests only.

## Deferred from: code review EPIC-12 re-review (2026-07-01)

- **STORY-54** — `callbackUrl` stored in Zalo config but not wired into OAuth redirect flow; future enhancement.
- **STORY-55** — Full PayOS/SePay SDK adapter wiring deferred; mock adapters acceptable for current scaffold; admin config surface is in place.
- **STORY-56** — Zalo OAuth events not manually retryable; AC only mandates payment webhook retry.

## Deferred from: code review of story STORY-63 (2026-07-02)

- Import `validateRow` logic duplicated from `QuestionsService.validateOptions` — extract shared helper in follow-up to prevent drift.

## Deferred from: code review EPIC-9 (2026-07-02)

- **STORY-42/43** — Cross-subject mock exam entitlement bypass: `MockExamSectionDto.subjectId` not required to match template `subjectId`; `startAttempt` only checks template subject entitlement — security fix needed in `mock-exams.service.ts` + `mock-exam-attempts.service.ts`.
- **STORY-43** — Monthly attempt limit race: concurrent `startAttempt` can exceed `monthlyAttemptLimit` without serializable transaction/advisory lock.
- **STORY-43** — `getActiveAttempt`/`startAttempt` do not scope `in_progress` by `periodKey` — stale prior-month attempts block new monthly starts.
- **STORY-42/43** — `listBySubject` ignores `Subject.visibility` and parent `Course.visibility` — archived subjects still expose approved templates.
- **STORY-41/42** — `validatePoolForTemplate` counts total pool only; difficulty-split sections can pass approve then fail at generation.
- **STORY-41** — `selectByDifficulty` rounding can under-fill sections below `questionCount` when easy+medium rounds consume full count.
- **STORY-26/43** — `expired` attempt status in schema never written by any service — lifecycle gap from EPIC-6; attempt counting semantics undefined until implemented.
- **STORY-26** — `syncTimer` auto-advances sections on timeout without answer enforcement — may be intentional timed-exam behavior; confirm product intent before changing.
- **STORY-39** — Admin subject create/update returns raw Prisma shape vs `AdminSubjectView` from list endpoint — minor contract drift.

## Deferred from: spec-mock-exam-template-admin-ui draft (2026-07-02)

- **Mock Exam Template Admin UI** — list/create/edit/approve/archive pages at `/mock-exams` (STORY-42 API exists; no admin UI). Superseded in current quick-dev run by go-live threshold config request; resume from `_bmad-output/implementation-artifacts/spec-mock-exam-template-admin-ui.md`.

## Deferred from: spec-subject-go-live-config review (2026-07-02)

- **Go-live threshold audit trail** — no record of who changed mins or prior values.
- **Active subject re-validation** — raising mins on an already-active subject does not auto-archive or warn beyond edit banner.
- **minsBySubject fallback** — missing subject ID in map silently uses DEFAULT_* constants.
- **Pre-existing active subjects below 200/1** — migration adds defaults but does not re-check catalog readiness.

## Deferred from: code review of spec-frontend-401-login-redirect (2026-07-10)

- `tsconfig.tsbuildinfo` files in working tree — build-artifact noise unrelated to feature logic.

## Deferred from: code review of STORY-71 (2026-07-10)

- **STORY-71** — No controller RBAC integration test for `/admin/notifications/recent` — follows 13-60 MVP test-scope pattern.
- **STORY-71** — Bell component has no poll error UI — stale feed on API failure is silent.

## Deferred from: code review of STORY-72 (2026-07-10)

- **STORY-72** — Deferred pages (`webhooks`, `import`, `flags`, `review`) intentionally out of scope per story.
- **STORY-72** — Disabled `AdminIconAction` buttons may not show tooltips (Radix disabled-trigger pattern) — a11y polish.
- **STORY-72** — No automated tests for `AdminDataTable` / `AdminIconAction` primitives — visual component smoke coverage acceptable for MVP.

## Deferred from: code review of STORY-73 (2026-07-10)

- **STORY-73** — `listActiveCatalogPaginated` loads full active catalog then slices in memory — DB skip/take when catalog grows.
- **STORY-73** — No unit tests for paginated catalog path — controller/service specs cover non-paginated path only.
- **STORY-73** — Home page page state not in URL — refresh loses current page.
- **STORY-73** — Course group headers may repeat or split across pages when a course spans page boundaries — flat pagination tradeoff.
- **STORY-73** — `featuredCount` applies per page (first two cards on every page get featured styling) — minor visual polish.

## Deferred from: code review of STORY-69 (2026-07-10)

- **STORY-69** — `clearWebSession` / `getWebAccessToken` read `document.cookie` but tokens are httpOnly — client-side session clear/token read ineffective; needs BFF logout route.
- **STORY-69** — OAuth tokens passed in URL query params (referrer/history leak risk) — Google routes commented out; existing redirect contract.
- **STORY-69** — No unit/integration tests for BFF `/api/auth/me` or `/api/auth/set-session` routes — API `auth/me` e2e covered; BFF layer untested.

## Deferred from: code review of spec-admin-login-user-info (2026-07-14)

- No server revoke/logout API on admin Sign Out — client clears storage only; token remains valid until expiry if copied.
- No automated unit tests for `admin-session` helpers (snapshot cache, corrupt JSON, login partial-admin clear).

## Deferred from: code review of spec-subject-editor-a21-ui (2026-07-14)

- Update-then-activate/archive is still a non-atomic two-step client chain (pre-existing pattern) — partial persist if activate fails after PATCH.
- Admin app `pnpm --filter admin lint` fails repo-wide (missing eslint.config) — pre-existing; typecheck used instead.
- Stitch free-tier "limit 0 locks free users" vs API `@Min(1)` — product decision to allow 0 deferred; UI corrected to API floor for this pass.

## Deferred from: code review of spec-subject-editor-cover-hot-tags (2026-07-14)

- Catalog card does not render `coverImageUrl` media yet — Ask First in spec; types/API expose URL for a later pass.
- Subject covers reuse landing-content upload storage/lifecycle (no subject-owned delete cleanup) — accepted storage choice; dedicated subject-asset lifecycle later.
- No DB index on `subjects.is_hot` — fine for MVP catalog size.
- Arbitrary `coverImageUrl` strings accepted on DTO (admin-trusted) beyond the upload UI path — tighten URL allowlist if needed later.
- Pre-existing update-then-activate/archive non-atomic client chain unchanged.

## Deferred from: code review of spec-rbac-editor-course-subject-read (2026-07-16)

- Subject list payload still includes `monthlyAmountVnd` / tier limits / embedded `goLive` for editor/reviewer — acceptable for dropdown binding this pass; consider a projected list DTO later.
- Controller role specs assert Reflector metadata only — no HTTP 200/403 integration tests for list vs mutate (same depth as existing AdminRolesGuard unit coverage).
- `AdminRolesGuard` fails open when `@Roles` omitted — pre-existing (STORY-57 M3); removing class-level `@Roles` increases importance of decorating every new handler.
