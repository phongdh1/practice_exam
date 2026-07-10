---
id: STORY-32
story_key: 7-32-progress-dashboard-ui
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-13", "FR-14"]
ad_refs: ["AD-12"]
---

# STORY-32: Progress dashboard UI

**Epic:** EPIC-7

## Acceptance Criteria

### AC-1

**Given** dashboard shows per-Subject summary cards  
**When** links to full attempt history  
**Then** layout differs Zalo tabs vs web nav but data is identical  
**And** meets WCAG focus order on web

## Tasks/Subtasks

- [x] `ProgressDashboard` component with 30/90-day tabs (W-40/Z-40)
- [x] Web `/progress` page with CandidateTopNav/BottomNav active=progress
- [x] Zalo `/progress` route with ZaloBottomTabs active=progress
- [x] Link to full attempt history from dashboard
- [x] Semantic main landmark and tab focus order on web

### Review Follow-ups (AI)

- [x] [AI-Review][Medium] Add `id="main-content"` and `tabIndex={-1}` to history page `<main>` for skip-link parity

## Dev Agent Record

### Completion Notes
✅ Progress dashboard shows per-subject summary cards with 30/90-day toggle.  
✅ Web uses top/bottom nav; Zalo uses bottom tabs — same API data.  
✅ Dashboard links to `/progress/history` for full attempt list.  
✅ Resolved review finding [Medium]: History page `<main>` now has `id="main-content"` and `tabIndex={-1}` matching progress dashboard WCAG pattern.

## File List

- packages/ui/src/components/progress-dashboard.tsx
- packages/ui/src/index.ts
- apps/web/src/app/progress/page.tsx
- apps/web/src/app/progress/history/page.tsx
- apps/zalo-mini-app/src/main.tsx

## Change Log

- 2026-07-01: Implemented progress dashboard UI for web and Zalo.
- 2026-07-01: Addressed code review findings - 1 item resolved (history page main landmark).
- 2026-07-01: Second-pass code review approved — all stories done.

## Status

done

### Review Findings

- [x] [Review][Patch] History page missing `id="main-content"` and skip-focus `tabIndex={-1}` on `<main>` — WCAG gap vs progress dashboard [`apps/web/src/app/progress/history/page.tsx:47`]
- [x] [Review][Defer] Detail page `<main>` lacks landmark id/focus attrs — matches other candidate pages [`apps/web/src/app/progress/history/[type]/[id]/page.tsx:73`] — deferred, pre-existing pattern

### Senior Developer Review (AI)

**Outcome:** Changes Requested (2026-07-01)

**Severity:** High 0 · Medium 1 · Low 0

AC-1 largely satisfied: `ProgressDashboard` with 30/90 tabs, per-subject cards, history link, web nav vs Zalo tabs with shared API data. Dashboard page has semantic `main#main-content` with `tabIndex={-1}`; history list page does not — partial WCAG focus-order gap.

**Action Items:**
- [x] [Medium] Add `id="main-content"` and `tabIndex={-1}` to history page `<main>` for skip-link parity

### Senior Developer Review (AI) — Second Pass

**Outcome:** Approve (2026-07-01)

**Severity:** High 0 · Medium 0 · Low 0

First-pass medium finding verified resolved: history page `<main>` now has `id="main-content"` and `tabIndex={-1}` matching dashboard WCAG pattern. Detail page landmark gap remains deferred (pre-existing candidate-page pattern). AC-1 satisfied.

**Prior medium issues:** All resolved.

**Tests:** N/A (UI); API regression suite 138/138 pass.
