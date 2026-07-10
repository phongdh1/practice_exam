---
id: STORY-38
story_key: 8-38-flagged-questions-admin-queue
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-9"]
---

# STORY-38: Flagged questions admin queue

## Tasks/Subtasks

- [x] QuestionFlag model and candidate POST /questions/:id/flag
- [x] Admin queue with assign, resolve (audit-logged), escalate to editorial
- [x] MVP: flagging does not unpublish question
- [x] Admin A-42 triage UI

## File List

- apps/api/src/content/question-flags.service.ts
- apps/api/src/content/question-flags.controller.ts
- apps/admin/src/app/flags/page.tsx


## Review Approval

Approved by user on 2026-07-01 (verdict: approve with changes). Code review follow-up improvements are treated as nice-to-have/deferred unless already documented in this story.

## Status

done
