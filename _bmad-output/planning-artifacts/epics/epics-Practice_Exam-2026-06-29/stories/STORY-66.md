---
id: STORY-66
story_key: 14-66-candidate-study-mode-ui
status: ready-for-dev
baseline_commit: NO_VCS
prd_refs: ["FR-47"]
ad_refs: ["AD-8", "AD-12"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-07-09"
    prd_version_or_updated: "sprint-change-proposal-2026-07-09-study-mode"
    change_summary: "Candidate Study Mode UI — Z-12..14 / W-12..14 list, detail, paywall per EXPERIENCE.md UJ-7"
    story_delta: "Created"
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

- [ ] Add shared UI components: `StudyQuestionRow`, `StudyQuestionList`, `StudyQuestionDetail`, `StudyTierPaywall`, `StudyMeterBadge` in `@practice-exam/ui` (AC: #1–#4)
- [ ] Wire TanStack Query hooks from `api-client` for study list/detail (AC: #1, #2)
- [ ] Implement W-12/W-13/W-14 pages in `apps/web` (AC: #1–#6)
- [ ] Implement Z-12/Z-13/Z-14 routes in `apps/zalo-mini-app` (AC: #1–#6)
- [ ] Handle `STUDY_TIER_EXCEEDED` API error → show paywall without leaking answer payload (AC: #3)
- [ ] Component/unit tests for list row states (unlocked, locked, viewed) and paywall copy
- [ ] Verify `pnpm test` and `pnpm build` pass

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

(pending)

### Debug Log References

### Completion Notes List

### File List

## Status

ready-for-dev
