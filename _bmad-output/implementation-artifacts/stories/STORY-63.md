---
id: STORY-63
story_key: 8-40-import-ux-multi-type-template
status: done
baseline_commit: NO_VCS
prd_refs: ["FR-22", "FR-8"]
ad_refs: ["AD-10"]
prd_version: prd-Practice_Exam-2026-06-29
epic: EPIC-8
---

# Story 8.40: Import UX, multi-type questions, and Excel data-sheet dropdowns

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **Content Editor**,  
I want **to select Course and Subject on A-33 and import Excel with dropdown-defined question types (Single Choice, Multiple Choice, True/False)**,  
so that **I can bulk-load questions accurately without guessing UUIDs or free-typing enum values**.

## Acceptance Criteria

### AC-1: Course → Subject cascade on A-33
**Given** an editor on `/questions/import`  
**When** they select a Course  
**Then** the Subject dropdown lists only Subjects where `subject.courseId === selectedCourseId` (show `name (code)`)  
**And** upload remains disabled until a Subject is selected  
**And** the raw UUID text input is removed.

### AC-2: Excel template uses `DanhMuc` data sheet + dropdowns
**Given** an authenticated editor downloads the template  
**When** the `.xlsx` opens in Excel  
**Then** it contains sheets: `Câu hỏi` (data entry), `DanhMuc` (master lists), `HuongDan` (column rules)  
**And** `DanhMuc!A2:A4` defines question-type labels: `Một lựa chọn`, `Nhiều lựa chọn`, `Đúng/Sai`  
**And** `DanhMuc!C2:C4` defines difficulty labels: `Dễ`, `Trung bình`, `Khó`  
**And** `Câu hỏi!A2:A501` has list validation referencing `DanhMuc!$A$2:$A$4`  
**And** `Câu hỏi!I2:I501` has list validation referencing `DanhMuc!$C$2:$C$4`  
**And** `Câu hỏi` includes **3 example rows** (one per question type).

### AC-3: Parser reads `Câu hỏi` sheet and maps labels to DB enums
**Given** an uploaded workbook  
**When** `parseWorkbook` runs  
**Then** it reads sheet **`Câu hỏi`** by name (not first sheet blindly)  
**And** ignores `DanhMuc` and `HuongDan`  
**And** maps:
- `Một lựa chọn` → `single_choice`
- `Nhiều lựa chọn` → `multiple_choice`
- `Đúng/Sai` → `true_false`
- `Dễ` / `Trung bình` / `Khó` → `easy` / `medium` / `hard` (keep legacy `dễ`/`khó` aliases in parser)  
**And** unknown labels produce row error `Loại câu hỏi không hợp lệ` or `Độ khó không hợp lệ`.

### AC-4: Row validation per question type (align with `QuestionsService.validateOptions`)
**Given** a parsed import row  
**When** validated before insert  
**Then** rules apply:

| Type | Options | Correct answer column |
|------|---------|----------------------|
| `single_choice` | A+B required; C/D optional | Exactly 1 key (`A`–`D`) |
| `multiple_choice` | A+B required; C/D optional | 2+ comma-separated keys; each must exist in options; no duplicates |
| `true_false` | Exactly A=`Đúng`, B=`Sai`; C/D must be empty | Exactly 1 key (`A` or `B`) |

**And** stem min length (normalized ≥ 10) still enforced  
**And** all created questions remain `status: draft` (never `published`).

### AC-5: Backward compatibility
**Given** a legacy template without `Loại câu hỏi` column  
**When** uploaded  
**Then** default `questionType` to `single_choice`  
**And** existing Vietnamese/English column aliases for stem/options still parse.

### AC-6: Tests
**Given** the implementation  
**When** `pnpm --filter api test import-questions.service.spec` runs  
**Then** tests cover: template sheets + dropdown ranges, 3-type parse roundtrip, per-type validation errors, course/subject UI not required in API tests.

## Tasks / Subtasks

- [x] Add `exceljs` to `apps/api` for template generation only (AC: #2)
  - [x] Keep `xlsx` for upload parsing — do NOT replace parse path
- [x] Refactor `buildImportTemplateBuffer()` to ExcelJS workbook (AC: #2)
  - [x] Sheet `DanhMuc` with type + difficulty lists (+ hidden DB code columns B/D optional)
  - [x] Sheet `Câu hỏi` with canonical Vietnamese headers including **`Loại câu hỏi`** as column A
  - [x] Apply data validation rows 2–501 on columns A and I
  - [x] Sheet `HuongDan` with column rules and per-type examples
  - [x] 3 example data rows on `Câu hỏi`
- [x] Extend `IMPORT_TEMPLATE_COLUMNS`, `ImportRow`, `parseWorkbook`, `validateRow`, `processBatch` (AC: #3, #4, #5)
  - [x] Add `questionType` and `correctOptionKeys: string[]` to `ImportRow`
  - [x] Parse `Đáp án đúng` as comma-separated keys for multiple choice
  - [x] Map question type + difficulty labels via exported constants (single source of truth)
  - [x] Prefer extracting shared option validation with `QuestionsService.validateOptions` or duplicate rules exactly — avoid drift
- [x] Update A-33 admin page (AC: #1)
  - [x] `useQuery` `adminListCourses()` + `adminListSubjects()` (pattern: `apps/admin/src/app/subjects/new/page.tsx`)
  - [x] Filter subjects by `courseId`; reset subject when course changes
  - [x] Show column legend / link to template rules
- [x] Update unit tests (AC: #6)
- [x] Update `spec-8-39-import-template-download.md` status note or add cross-ref — template behavior superseded by this story

### Review Findings

- [x] [Review][Decision] Template example rows import as real draft questions — Resolved: skip built-in template example stems during `parseWorkbook`.
- [x] [Review][Decision] true_false option text not enforced — Resolved: keep flexible; import only requires exactly 2 options (A/B) and empty C/D.
- [x] [Review][Patch] Missing question-type label aliases [`import-questions.service.ts:40`](../../apps/api/src/questions/import-questions.service.ts#L40)
- [x] [Review][Patch] No parseWorkbook e2e test for invalid question type label [`import-questions.service.spec.ts`](../../apps/api/src/questions/import-questions.service.spec.ts)
- [x] [Review][Defer] Import validation duplicated from QuestionsService.validateOptions — deferred, pre-existing drift risk acceptable for v1; extract shared helper in follow-up

## Dev Notes

### Current state (READ BEFORE CODING)

**`apps/admin/src/app/questions/import/page.tsx`**
- Uses raw UUID `Subject ID` text input — must become Course + Subject `<select>`.
- Download button already calls `adminDownloadImportTemplate()`.

**`apps/api/src/questions/import-questions.service.ts`**
- `IMPORT_TEMPLATE_COLUMNS` — 9 columns, no `Loại câu hỏi`.
- `buildImportTemplateBuffer()` — SheetJS `json_to_sheet`, single sheet, 1 example row.
- `parseWorkbook()` — reads `workbook.SheetNames[0]` only; hardcodes `questionType: "single_choice"`.
- `validateRow()` — single correct key A–D only; no multi-select or true/false rules.
- `correctOptionKeys` stored as single-element array today.

**`apps/api/src/questions/questions.service.ts` — `validateOptions()`**
- `single_choice`: exactly 1 correct key.
- `true_false`: exactly 2 options.
- `multiple_choice`: no max on correct keys; practice layer requires ≥1 selected.
- Import should require **≥2 correct keys** for multiple choice (editor intent).

### Excel library split (CRITICAL — do not use SheetJS for dropdowns)

| Operation | Library | Reason |
|-----------|---------|--------|
| Template download | **`exceljs`** | SheetJS community cannot write `dataValidation` list dropdowns |
| Upload parse | **`xlsx`** | Already works; reading dropdown-selected values is plain cell text |

`exceljs` data validation example:
```ts
cell.dataValidation = {
  type: "list",
  allowBlank: false,
  formulae: ["DanhMuc!$A$2:$A$4"],
  showErrorMessage: true,
  errorTitle: "Loại câu hỏi",
  error: "Chọn từ danh sách trên sheet DanhMuc",
};
```

### Canonical `Câu hỏi` column order

| Col | Header | DB field |
|-----|--------|----------|
| A | Loại câu hỏi | `questionType` |
| B | Câu hỏi | `stem` |
| C–F | Đáp án A–D | `options` |
| G | Đáp án đúng | `correctOptionKeys` |
| H | Giải thích | `explanation` |
| I | Độ khó | `difficulty` |
| J | Chủ đề | `tags` |

### `DanhMuc` sheet layout

| A: Loại câu hỏi | B: mã (optional) | C: Độ khó | D: mã (optional) |
|-----------------|------------------|-----------|------------------|
| Một lựa chọn | single_choice | Dễ | easy |
| Nhiều lựa chọn | multiple_choice | Trung bình | medium |
| Đúng/Sai | true_false | Khó | hard |

User-facing dropdowns use columns A and C only.

### Example rows for template

1. **Một lựa chọn** — 4 options, correct `A`
2. **Nhiều lựa chọn** — 4 options, correct `A,C`
3. **Đúng/Sai** — A=`Đúng`, B=`Sai`, correct `A`, C/D empty

### API / client — no new endpoints required

- `POST /admin/questions/import` — already accepts `subjectId` + file
- `GET /admin/questions/import/template` — same route; buffer format changes
- Reuse `adminListCourses()`, `adminListSubjects()`, `queryKeys.courses.admin`, `queryKeys.subjects.admin`

### Regression guardrails

- Max 500 rows/batch unchanged (AD-10).
- Draft-only creation unchanged.
- `GET template` must stay registered **before** `GET :batchId` in controller.
- STORY-49 parse roundtrip tests must be updated, not deleted.
- Do not add `questionType` to Excel per-row for subject — subject remains batch-level on form.

### Project structure

```
apps/api/src/questions/import-questions.service.ts   # primary logic
apps/api/src/questions/import-questions.service.spec.ts
apps/admin/src/app/questions/import/page.tsx
apps/api/package.json                                 # + exceljs
```

### Testing commands

```bash
pnpm --filter api test import-questions.service.spec
pnpm --filter api build
pnpm --filter admin typecheck   # if import page types change
```

### References

- [Source: apps/api/src/questions/import-questions.service.ts] — current import pipeline
- [Source: apps/api/src/questions/questions.service.ts#validateOptions] — type validation rules
- [Source: apps/admin/src/app/subjects/new/page.tsx] — Course select pattern
- [Source: _bmad-output/implementation-artifacts/stories/STORY-37.md] — async import pipeline (done)
- [Source: _bmad-output/implementation-artifacts/stories/STORY-49.md] — template download v1 (done/review)
- [Source: _bmad-output/planning-artifacts/architecture/.../ARCHITECTURE-SPINE.md#AD-10] — import constraints
- [Source: packages/types/src/index.ts] — `QuestionTypeValue`

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- Python resolver unavailable on Windows host; proceeded with customize.toml defaults.
- `baseline_commit` remains `NO_VCS` (no git repo detected).

### Implementation Plan

1. Add `exceljs` for template generation; keep `xlsx` for upload parsing.
2. Rebuild template with `DanhMuc` / `HuongDan` / `Câu hỏi` sheets and list validations.
3. Extend import parser and per-type validation; preserve legacy file compatibility.
4. Replace A-33 UUID input with Course → Subject cascade.
5. Expand unit tests for all three question types and template structure.

### Completion Notes List

- Template now uses ExcelJS with dropdown validation on `Loại câu hỏi` (col A) and `Độ khó` (col I), sourced from `DanhMuc`.
- Import supports `single_choice`, `multiple_choice`, `true_false` with type-specific validation aligned to `QuestionsService`.
- A-33 uses Course → Subject selects; column legend added.
- 14/14 import service tests pass after review patches.

### File List

- apps/api/package.json
- apps/api/src/questions/import-questions.service.ts
- apps/api/src/questions/import-questions.service.spec.ts
- apps/api/src/questions/import-questions.controller.ts
- apps/admin/src/app/questions/import/page.tsx
- _bmad-output/implementation-artifacts/spec-8-39-import-template-download.md
- _bmad-output/implementation-artifacts/stories/STORY-63.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

## Change Log

- 2026-07-02: Story created from editor feedback — Course/Subject picker, 3 question types, Excel `DanhMuc` dropdown template.
- 2026-07-02: Code review complete — decision 2B: true_false option text stays flexible (2 options only).
