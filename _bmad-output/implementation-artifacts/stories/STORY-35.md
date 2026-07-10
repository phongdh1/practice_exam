---
id: STORY-35
story_key: 8-35-emergency-unpublish-source-attribution
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-19", "FR-20"]
---

# STORY-35: Emergency unpublish and source attribution

## Tasks/Subtasks

- [x] Unpublish sets archived status with ContentAuditLog
- [x] sourceRef field on Question (admin-only in API responses)
- [x] PATCH source-ref endpoint for admins
- [x] Archived questions excluded from published candidate queries

## File List

- apps/api/src/content/content.service.ts
- apps/api/src/content/content-admin.controller.ts


## Review Approval

Approved by user on 2026-07-01 (verdict: approve with changes). Code review follow-up improvements are treated as nice-to-have/deferred unless already documented in this story.

## Status

done
