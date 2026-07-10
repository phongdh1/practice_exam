---
id: STORY-36
story_key: 8-36-question-search-filter-preview
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-23", "FR-24"]
---

# STORY-36: Question search, filter, and candidate preview

## Tasks/Subtasks

- [x] Search/filter API by subject, status, difficulty, topic, author, text
- [x] Paginated results with indexed Prisma queries
- [x] QuestionPreview shared UI component matching Practice Mode
- [x] Admin A-30 list with URL query param persistence
- [x] Admin A-32 preview page

## File List

- apps/api/src/questions/questions.service.ts
- packages/ui/src/components/question-preview.tsx
- apps/admin/src/app/questions/**


## Review Approval

Approved by user on 2026-07-01 (verdict: approve with changes). Code review follow-up improvements are treated as nice-to-have/deferred unless already documented in this story.

## Status

done
