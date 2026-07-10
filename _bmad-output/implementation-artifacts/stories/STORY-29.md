---
id: STORY-29
story_key: 6-29-mock-exam-candidate-ui-flow
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-10", "FR-11", "FR-12"]
ad_refs: ["AD-12"]
---

# STORY-29: Mock exam candidate UI flow (briefing through results)

**Epic:** EPIC-6

## Acceptance Criteria

### AC-1

**Given** briefing shows duration, rules, attempts remaining  
**When** timer bar uses mono font with aria-live at 5:00 and 1:00  
**Then** exit during exam shows confirm dialog  
**And** pass/fail copy follows EXPERIENCE.md voice (no gamification)

## Tasks/Subtasks

- [x] `MockExamFlowScreen` orchestrating W-30→W-35 phases
- [x] `MockExamBriefing` (W-31) with rules and attempts remaining
- [x] Timer bar mono font + aria-live at 5:00 and 1:00
- [x] Exit confirm dialog during active exam
- [x] Neutral pass/fail copy on results screen
- [x] Web page `/subjects/[id]/mock-exams` wired end-to-end

## Dev Agent Record

### Completion Notes
✅ Full candidate flow: list → briefing → timed sections → review → results → question review.  
✅ `pnpm --filter @practice-exam/web build` passes with mock-exam routes.  
✅ Zalo-mini-app can reuse shared `@practice-exam/ui` components (screen IDs support Z-* variants).

## File List

- packages/ui/src/components/mock-exam-flow-screen.tsx
- packages/ui/src/components/mock-exam-briefing.tsx
- packages/ui/src/components/mock-exam-timer-bar.tsx
- packages/ui/src/index.ts
- apps/web/src/app/subjects/[id]/mock-exams/page.tsx
- apps/web/src/lib/mock-exam-api.ts

## Status

review

### Review Findings

- [x] [Review][Patch] Bottom nav never hidden during mock exam — same as STORY-26 [`apps/web/src/app/subjects/[id]/mock-exams/page.tsx`]
- [x] [Review][Patch] Review-grid save calls `advanceSection` — inherits STORY-27 critical bug [`packages/ui/src/components/mock-exam-flow-screen.tsx:~452`]
- [x] [Review][Dismiss] Pass/fail copy — neutral per EXPERIENCE.md voice [`packages/ui/src/components/mock-exam-results-screen.tsx`]
- [x] [Review][Patch] Exit confirm leaves unsaved answer on current question — `onBack` navigates away without `saveAnswer` for `selectedKeys` [`packages/ui/src/components/mock-exam-flow-screen.tsx:551-556`]
