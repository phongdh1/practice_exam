---
id: STORY-37
story_key: 8-37-excel-bulk-import
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-22"]
ad_refs: ["AD-10"]
---

# STORY-37: Excel bulk import with async job pipeline

## Tasks/Subtasks

- [x] ImportBatch + ImportRowError models
- [x] Async enqueue via setImmediate (non-blocking HTTP)
- [x] xlsx parser with row-level error report
- [x] Draft-only question creation; max 500 rows
- [x] Admin A-33 upload UI with polling report
- [x] Unit tests for parse, validate, draft creation

## File List

- apps/api/src/questions/import-questions.service.ts
- apps/api/src/questions/import-questions.controller.ts
- apps/admin/src/app/questions/import/page.tsx


## Review Approval

Approved by user on 2026-07-01 (verdict: approve with changes). Code review follow-up improvements are treated as nice-to-have/deferred unless already documented in this story.

## Status

done
