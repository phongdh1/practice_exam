---
id: STORY-4
story_key: 1-4-shared-ui-package
status: review
baseline_commit: NO_VCS
prd_refs: []
ad_refs: ["AD-12"]
prd_version: prd-Practice_Exam-2026-06-29
changelog:
  - date: "2026-06-29"
    prd_version_or_updated: "prd-Practice_Exam-2026-06-29 (final)"
    change_summary: "Initial story created from finalized PRD, architecture spine, and UX contract"
    story_delta: "Created"
  - date: "2026-06-29"
    prd_version_or_updated: "EPIC-1 implementation"
    change_summary: "@practice-exam/ui with DESIGN.md tokens and components"
    story_delta: "Implemented — status review"
---

# STORY-4: Create shared UI package with DESIGN.md brand tokens

**Epic:** EPIC-1

As a **frontend developer**,  
I want **`@practice-exam/ui` exporting shadcn components and Tailwind preset**,  
So that **web, admin, and Zalo apps share consistent brand styling**.

## Acceptance Criteria

### AC-1

**Given** Package exports primary `#1B4F72`, success `#0E7C4A`, and typography tokens from DESIGN.md  
**When** web app extends tailwind config from package preset  
**Then** Subject card and answer-option component tokens are available  
**And** Be Vietnam Pro font is configured

## Tasks/Subtasks

- [x] Create `@practice-exam/ui` package with Tailwind preset exporting brand colors
- [x] Export `SubjectCard` and `AnswerOption` components with DESIGN.md token classes
- [x] Export `brandColors` constants and `globals.css` with Be Vietnam Pro
- [x] Configure web app `tailwind.config.ts` to extend UI preset
- [x] Configure Be Vietnam Pro via `next/font` in web layout
- [x] Add unit tests for brand color exports

## Dev Agent Record

### Implementation Plan
Shared UI package per AD-12 with Tailwind preset and DESIGN.md component tokens.

### Completion Notes
✅ Primary `#1B4F72` and success `#0E7C4A` exported in preset and `brandColors`.  
✅ SubjectCard and AnswerOption components available with design token classes.  
✅ Web app extends preset and loads Be Vietnam Pro via next/font.

## File List

- packages/ui/package.json
- packages/ui/tailwind-preset.js
- packages/ui/tailwind-preset.d.ts
- packages/ui/src/globals.css
- packages/ui/src/index.ts
- packages/ui/src/components/subject-card.tsx
- packages/ui/src/components/answer-option.tsx
- packages/ui/src/lib/utils.ts
- packages/ui/src/index.test.ts
- apps/web/tailwind.config.ts
- apps/web/src/app/layout.tsx

## Change Log

| Date | Change |
|------|--------|
| 2026-06-29 | Created shared UI package with brand tokens (STORY-4) |

## Status

review

### Review Findings

- [ ] [Review][Decision] STORY-4 description says "exporting shadcn components" but AC only requires SubjectCard/AnswerOption tokens — defer full shadcn export to a later story or add primitives now?
- [ ] [Review][Patch] Tailwind preset missing `text-body` and `text-display-sm` tokens used by UI components [`packages/ui/tailwind-preset.js`, `packages/ui/src/components/answer-option.tsx`]
- [ ] [Review][Patch] Be Vietnam Pro not wired in Zalo Mini App — `--font-be-vietnam-pro` undefined in `apps/zalo-mini-app/src/index.css` [`apps/zalo-mini-app/src/index.css`]
