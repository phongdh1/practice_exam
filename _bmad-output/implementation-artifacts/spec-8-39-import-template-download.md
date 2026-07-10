---
title: '8-39 Downloadable question import template'
type: 'feature'
created: '2026-07-01'
status: 'done'
baseline_commit: 'NO_VCS'
story_key: '8-39-import-template-download'
superseded_by: '8-40-import-ux-multi-type-template (STORY-63)'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FR-22 promises bulk import via Excel template, but A-33 only supports upload. Editors must guess column names and validation rules, causing unnecessary import errors.

**Approach:** Add an API-generated `.xlsx` template that uses the canonical Vietnamese column headers accepted by the import parser, plus one example row. Expose a download action on the A-33 import page.

## Boundaries & Constraints

**Always:** Template columns must match `parseWorkbook` Vietnamese headers. Template generation lives in `ImportQuestionsService` (single source of truth). Route `GET template` registered before `GET :batchId`. Admin JWT required.

**Ask First:** Changing canonical column names or adding new question types beyond single-choice.

**Never:** Static template file that can drift from parser. Synchronous import changes. CSV support in this story.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | Authenticated admin GET `/admin/questions/import/template` | `.xlsx` with headers + 1 example row | N/A |
| PARSE_ROUNDTRIP | Template file re-uploaded via import | Example row parses as valid ImportRow | Row-level validation on import |
| UNAUTHORIZED | No JWT | 401 | Standard guard |

</frozen-after-approval>

## Code Map

- `apps/api/src/questions/import-questions.service.ts` -- add `buildImportTemplateBuffer()`; export column constants
- `apps/api/src/questions/import-questions.controller.ts` -- `GET template` before `:batchId`
- `apps/api/src/questions/import-questions.service.spec.ts` -- template buffer tests
- `packages/api-client/src/index.ts` -- `adminDownloadImportTemplate()` blob fetch
- `apps/admin/src/app/questions/import/page.tsx` -- "Tải file mẫu" button
- `_bmad-output/planning-artifacts/epics/epics-Practice_Exam-2026-06-29/epics.md` -- STORY-49 entry
- `_bmad-output/implementation-artifacts/stories/STORY-49.md` -- story artifact
- `_bmad-output/implementation-artifacts/sprint-status.yaml` -- `8-39-import-template-download`

## Tasks & Acceptance

**Execution:**
- [x] `apps/api/src/questions/import-questions.service.ts` -- add template builder with Vietnamese headers and example row
- [x] `apps/api/src/questions/import-questions.controller.ts` -- add authenticated template download endpoint
- [x] `apps/api/src/questions/import-questions.service.spec.ts` -- test template headers and parse roundtrip
- [x] `packages/api-client/src/index.ts` -- add `adminDownloadImportTemplate` blob method
- [x] `apps/admin/src/app/questions/import/page.tsx` -- add download template button
- [x] `_bmad-output/planning-artifacts/epics/epics-Practice_Exam-2026-06-29/epics.md` -- add STORY-49 to EPIC-8
- [x] `_bmad-output/implementation-artifacts/stories/STORY-49.md` -- create story file
- [x] `_bmad-output/implementation-artifacts/sprint-status.yaml` -- register story key

**Acceptance Criteria:**
- Given an authenticated Content Editor on A-33, when they click "Tải file mẫu", then a `.xlsx` file downloads with canonical Vietnamese columns and one example row
- Given the downloaded template, when uploaded for import, then the example row parses without column-mapping errors
- Given an unauthenticated request to the template endpoint, when called, then the API returns 401

## Verification

**Commands:**
- `pnpm --filter api test import-questions.service.spec` -- expected: all tests pass

**Manual checks:**
- Open `/questions/import` in admin app; confirm download button appears and file opens in Excel with expected columns

## Suggested Review Order

**Template generation (single source of truth)**

- Canonical Vietnamese columns exported for parser alignment
  [`import-questions.service.ts:9`](../../apps/api/src/questions/import-questions.service.ts#L9)

- Buffer builder with one example row for editors
  [`import-questions.service.ts:195`](../../apps/api/src/questions/import-questions.service.ts#L195)

**API download endpoint**

- Template route registered before dynamic `:batchId`
  [`import-questions.controller.ts:53`](../../apps/api/src/questions/import-questions.controller.ts#L53)

**Admin UI & client**

- Blob download wired to A-33 button
  [`page.tsx:24`](../../apps/admin/src/app/questions/import/page.tsx#L24)

- Api-client mirrors existing export blob pattern
  [`index.ts:330`](../../packages/api-client/src/index.ts#L330)

**Tests**

- Headers and parse roundtrip verified
  [`import-questions.service.spec.ts:94`](../../apps/api/src/questions/import-questions.service.spec.ts#L94)
