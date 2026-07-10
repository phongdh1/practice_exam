---
id: STORY-23
story_key: 5-23-practice-session-resume-summary
status: review
baseline_commit: NO_VCS
prd_refs: ["FR-8"]
ad_refs: []
---

# STORY-23: Practice session resume and summary

**Epic:** EPIC-5

## Acceptance Criteria

### AC-1

**Given** return within 24h shows 'Tiếp tục phiên luyện tập?' prompt  
**When** session summary Z-22/W-22 shows score and questions answered  
**Then** ending session at Free Tier cap routes to paywall  
**And** 'Câu tiếp' disabled until answer submitted

## Tasks/Subtasks

- [x] `PracticeResumePrompt` for 24h resume flow
- [x] `PracticeSessionSummaryView` (W-22/Z-22) with score and paywall CTA
- [x] Free Tier cap routes to paywall on next question / summary
- [x] `Câu tiếp` disabled until answer revealed

## Dev Agent Record

### Completion Notes
✅ Resume prompt when active session has answeredCount > 0.  
✅ Summary shows score % and correct/total; paywall when free tier exhausted.

## File List

- packages/ui/src/components/practice-resume-prompt.tsx
- packages/ui/src/components/practice-session-summary-view.tsx
- packages/ui/src/components/practice-flow-screen.tsx
- apps/web/src/app/api/practice/**
- apps/web/src/lib/practice-api.ts

## Status

done

### Review Findings

- [x] [Review][Decision] Resume prompt gated on `answeredCount > 0` — resolved: show prompt for all resumable in-progress sessions within 24h [`packages/ui/src/components/practice-flow-screen.tsx:111-114`]
- [x] [Review][Patch] Free-tier paywall detected via `message.includes("miễn phí")` — structured `error.code` discarded in web adapter [`packages/ui/src/components/practice-flow-screen.tsx:91`, `apps/web/src/lib/practice-api.ts`]
- [x] [Review][Patch] `handleResume` / `handleStartNew` lack error handling — expired session leaves blank UI [`packages/ui/src/components/practice-flow-screen.tsx:204-215`]
- [x] [Review][Defer] Manual **Kết thúc** at free-tier cap shows summary subscribe CTA but not `FreeTierPaywall` sheet [`packages/ui/src/components/practice-flow-screen.tsx:184-188`]
