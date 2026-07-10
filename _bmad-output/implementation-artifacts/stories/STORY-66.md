---
id: STORY-66
story_key: 14-66-candidate-study-mode-ui
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-47"]
ad_refs: ["AD-8", "AD-12"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-07-09"
    prd_version_or_updated: "sprint-change-proposal-2026-07-09-study-mode"
    change_summary: "Candidate Study Mode UI — Z-12..14 / W-12..14 list, detail, paywall per EXPERIENCE.md UJ-7"
    story_delta: "Created"
  - date: "2026-07-09"
    prd_version_or_updated: "dev-story STORY-66"
    change_summary: "Implemented study UI components, web/Zalo routes, study API proxies, STUDY_TIER_EXCEEDED paywall handling"
    story_delta: "ready-for-dev → review"
---

# STORY-66: Candidate Study Mode UI (web + Zalo)

**Epic:** EPIC-14

As a **Candidate**,  
I want **to browse and read study questions with visible answers on web and Zalo**,  
So that **I can review content passively before active practice**.

## Acceptance Criteria

### AC-1: Study question list (Z-12 / W-12)

**Given** a Candidate navigates to Study Mode from Subject detail  
**When** the study list screen loads  
**Then** Z-12 (Zalo) / W-12 (web) shows paginated Published questions with stem preview, topic tag, and difficulty  
**And** no answer indicators or correct-option highlighting appear in list rows  
**And** an inline Study Tier meter shows "Đã xem {n}/{limit} câu ôn miễn phí tháng này" (hidden when subscribed)  
**And** pull-to-refresh works on Zalo list

### AC-2: Study question detail (Z-13 / W-13)

**Given** a Candidate taps a list row with remaining Study Tier allowance (or subscribed)  
**When** the detail screen loads  
**Then** Z-13 / W-13 shows read-only layout: stem, options with correct answer highlighted via `{components.answer-option-correct}`  
**And** explanation displays below options without requiring "Xác nhận" submit (unlike Practice Mode UX-A7)  
**And** "Báo cáo câu hỏi" ghost action is visible (reuses STORY-24 flagging flow)  
**And** first view this period consumes 1 Study Tier view server-side (via STORY-65 detail API)

### AC-3: Study Tier paywall (Z-14 / W-14)

**Given** a freemium Candidate at Study Tier cap attempts a new unviewed question  
**When** they tap a locked row or detail is blocked  
**Then** Z-14 bottom sheet (Zalo/mobile) or W-14 dialog (desktop) appears  
**And** copy explains Study Tier vs Free Tier: "Xem đáp án và giải thích cho tất cả câu hỏi"  
**And** primary CTA Subscribe → Z-24/W-24; secondary "Quay lại danh sách" or "Luyện tập miễn phí" if Free Tier remains

### AC-4: Locked rows at cap

**Given** Study Tier is exhausted  
**When** the list remains visible  
**Then** unviewed rows show lock icon; tap → Z-14/W-14  
**And** already-viewed-this-month rows remain unlocked and open in Z-13/W-13 without extra consumption

### AC-5: Subscribed user experience

**Given** a subscribed Candidate  
**When** they use Study Mode  
**Then** no Study Tier meter is shown  
**And** all rows are unlocked; detail loads without counter increment

### AC-6: Routing and navigation

**Given** Study Mode screens sit between Subject detail and Practice setup  
**When** Candidate uses back navigation from list  
**Then** they return to Z-11/W-11 Subject detail  
**And** web routes: `/subjects/[id]/study`, `/subjects/[id]/study/[questionId]`  
**And** Zalo routes: `/subjects/$subjectId/study`, `/subjects/$subjectId/study/$questionId`

## Tasks / Subtasks

- [x] Add shared UI components: `StudyQuestionRow`, `StudyQuestionList`, `StudyQuestionDetail`, `StudyTierPaywall`, `StudyMeterBadge` in `@practice-exam/ui` (AC: #1–#4)
- [x] Wire TanStack Query hooks from `api-client` for study list/detail (AC: #1, #2)
- [x] Implement W-12/W-13/W-14 pages in `apps/web` (AC: #1–#6)
- [x] Implement Z-12/Z-13/Z-14 routes in `apps/zalo-mini-app` (AC: #1–#6)
- [x] Handle `STUDY_TIER_EXCEEDED` API error → show paywall without leaking answer payload (AC: #3)
- [x] Component/unit tests for list row states (unlocked, locked, viewed) and paywall copy
- [x] Verify `pnpm test` and `pnpm build` pass

## Dev Notes

### Architecture compliance

- **AD-8:** TanStack Query for server state; study list/detail fetched from API only — never assemble answers client-side.
- **AD-12:** Use DESIGN.md tokens; `{components.study-meter-badge}`, `{components.study-question-row}`, `{components.answer-option-correct}`.
- **UX-A7 does NOT apply:** Study detail is read-only; answers visible on load — no confirm-before-reveal.

### UX contract (EXPERIENCE.md)

| Screen | ID | Key behavior |
|--------|-----|--------------|
| Study list | Z-12 / W-12 | Stem preview only; meter in header |
| Study detail | Z-13 / W-13 | Correct answer highlighted; explanation below |
| Study paywall | Z-14 / W-14 | Separate from Z-23 Free Tier practice paywall |

Microcopy (Vietnamese):
- Meter: "Đã xem {n}/5 câu ôn miễn phí tháng này."
- Cap headline: "Bạn đã xem hết 5 câu ôn miễn phí tháng này." / "Hết lượt xem đáp án!"

### Dependency

- **Blocked on STORY-65:** Study API endpoints and `studyTier` status in list response must exist before UI wiring.
- **STORY-67** adds Subject detail CTA entry point — this story implements target screens; can stub navigation from detail until STORY-67 lands.

### Reuse patterns

- Mirror `PracticeFlowScreen` / practice routing structure from STORY-22 for web/Zalo route setup.
- Reuse `FreeTierPaywall` layout patterns for `StudyTierPaywall` (different copy and benefits list).
- Reuse question flagging action from STORY-24 on detail screen.

### Files to create/modify

| Area | Path |
|------|------|
| UI components | `packages/ui/src/components/study-*.tsx` |
| UI exports | `packages/ui/src/index.ts` |
| API client | `packages/api-client/src/index.ts` (if not done in STORY-65) |
| Web pages | `apps/web/src/app/subjects/[id]/study/**` |
| Zalo routes | `apps/zalo-mini-app/src/main.tsx` (route config) |

### Testing requirements

- Component tests: locked vs unlocked row at `isAtLimit`; meter hidden when subscribed.
- Manual UJ-7 walkthrough: 5 detail views → 6th shows paywall; question 3 re-open without paywall.

### References

- [Source: EXPERIENCE.md Z-12..14, W-12..14, UJ-7, UX-A14..A16]
- [Source: DESIGN.md Study Tier meter component spec]
- [Source: STORY-22 practice UI patterns]
- [Source: STORY-65 study API]

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Debug Log References

- Extended `StudyQuestionListItem` with `viewedThisPeriod` for locked-row UX at cap (list API enrichment)
- Web uses BFF proxy routes under `/api/study/**` mirroring practice pattern

### Completion Notes List

- Added `StudyMeterBadge`, `StudyTierPaywall`, `StudyQuestionRow`, `StudyQuestionList`, `StudyQuestionDetail`, `StudyFlowScreen` in `@practice-exam/ui`
- `isStudyRowLocked` helper + unit tests for unlocked/locked/viewed row states at cap
- Web: W-12/W-13 pages + `/api/study/**` BFF proxies + `createWebStudyApi` adapter
- Zalo: Z-12/Z-13 routes with pull-to-refresh on list; `createZaloStudyApi` adapter
- `STUDY_TIER_EXCEEDED` on detail fetch opens paywall without rendering answer payload
- All tests pass; web, zalo-mini-app, api, ui builds verified

### File List

- packages/types/src/index.ts
- packages/ui/src/components/study-meter-badge.tsx
- packages/ui/src/components/study-tier-paywall.tsx
- packages/ui/src/components/study-question-row.tsx
- packages/ui/src/components/study-question-row.test.ts
- packages/ui/src/components/study-question-list.tsx
- packages/ui/src/components/study-question-detail.tsx
- packages/ui/src/components/study-flow-screen.tsx
- packages/ui/src/index.ts
- apps/api/src/study/study.service.ts
- apps/api/src/study/study.service.spec.ts
- apps/web/src/lib/study-api.ts
- apps/web/src/app/api/study/subjects/[subjectId]/questions/route.ts
- apps/web/src/app/api/study/subjects/[subjectId]/questions/[questionId]/route.ts
- apps/web/src/app/api/study/subjects/[subjectId]/tier/route.ts
- apps/web/src/app/(candidate)/(shell)/subjects/[id]/study/page.tsx
- apps/web/src/app/(candidate)/(shell)/subjects/[id]/study/[questionId]/page.tsx
- apps/zalo-mini-app/src/main.tsx

### Review Findings

- [x] [Review][Patch] Paywall "Quay lại danh sách" from list mode navigates to subject detail instead of closing paywall [`packages/ui/src/components/study-flow-screen.tsx:205`]
- [x] [Review][Patch] Detail load with missing `questionId` leaves perpetual loading skeleton [`packages/ui/src/components/study-flow-screen.tsx:95-96`]
- [x] [Review][Patch] List fetch failure retains stale `listResult` from prior load [`packages/ui/src/components/study-flow-screen.tsx:86-88`]
- [x] [Review][Patch] Detail fetch failure retains stale `detail` from prior question [`packages/ui/src/components/study-flow-screen.tsx:109`]
- [x] [Review][Patch] `questionId` change does not clear previous detail before load [`packages/ui/src/components/study-flow-screen.tsx:115-121`]
- [x] [Review][Patch] Study list/detail pages show perpetual "Đang tải..." when subject ID not in catalog [`apps/web/src/app/(candidate)/(shell)/subjects/[id]/study/page.tsx:65-67`]
- [x] [Review][Patch] Zalo study pages lack not-found and unauthenticated handling [`apps/zalo-mini-app/src/main.tsx:414-508`]
- [x] [Review][Patch] Missing unit tests for paywall copy per story task [`packages/ui/src/components/study-tier-paywall-copy.test.ts`]
- [x] [Review][Defer] Server-side answer gating — enforced by STORY-65 `StudyService.getQuestionDetail`; client lock is UX-only [`apps/api/src/study/study.service.ts`]
- [x] [Review][Defer] Web pull-to-refresh omitted — AC-1 requires pull-to-refresh on Zalo only, not web

## Status

done
