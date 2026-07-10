---
id: STORY-49
story_key: 8-39-import-template-download
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-22"]
ad_refs: ["AD-10"]
---

# STORY-49: Downloadable question import template

## User Story

As a **Content Editor**,  
I want **to download an Excel template from A-33 before bulk import**,  
So that **I know the exact column format and reduce import errors**.

## Acceptance Criteria

**Given** A-33 bulk import page  
**When** editor clicks "Tải file mẫu"  
**Then** API returns `.xlsx` with Vietnamese canonical columns and one example row  
**And** the template parses successfully via existing `parseWorkbook` logic

## Tasks/Subtasks

- [x] `buildImportTemplateBuffer()` in ImportQuestionsService
- [x] `GET /admin/questions/import/template` endpoint
- [x] Unit tests for template headers and parse roundtrip
- [x] Api-client blob download method
- [x] A-33 download button

### Review Findings

- [x] [Review][Dismiss] AC "one example row" — superseded by STORY-63 (`8-40`): template now has 3 example rows + `DanhMuc`/`HuongDan` sheets; documented in `spec-8-39` `superseded_by`.
- [x] [Review][Dismiss] AC parse roundtrip for example row — superseded by STORY-63: built-in example stems skipped on import to avoid accidental draft creation.
- [x] [Review][Defer] No controller test for 401 on template endpoint — guards covered by existing admin auth patterns; defer dedicated integration test.
- [x] [Review][Patch] Sprint status sync — `8-39-import-template-download` marked `done` after review (was `review`).

## Dev Agent Record

### Review Approval

Approved 2026-07-02. Core 8-39 deliverables verified: `GET /admin/questions/import/template`, `adminDownloadImportTemplate`, A-33 download button, canonical Vietnamese columns via `IMPORT_TEMPLATE_COLUMNS`. Template behavior extended by STORY-63 without breaking FR-22 intent.

## File List

- apps/api/src/questions/import-questions.service.ts
- apps/api/src/questions/import-questions.controller.ts
- apps/api/src/questions/import-questions.service.spec.ts
- packages/api-client/src/index.ts
- apps/admin/src/app/questions/import/page.tsx

## Status

done
