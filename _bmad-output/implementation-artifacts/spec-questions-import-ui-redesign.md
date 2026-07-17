---
title: 'Questions import screen UI redesign'
type: 'feature'
created: '2026-07-17'
status: 'done'
baseline_commit: 'fd0586a348ec46fe3753cb92d809ae16aba09fa7'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/questions/import` works but looks outdated vs the mock — stacked fields, click-only upload that fires immediately on file pick, no in-page title, and no explicit confirm action.

**Approach:** Restyle the page to match the mock (header, tip banner, two-column Course/Subject, drag-drop zone, deferred “Tiến hành tải lên”), while keeping template download, course→subject cascade, import API, and report polling.

## Boundaries & Constraints

**Always:**
- Keep `AdminRoleGate` (`editor` | `super_admin`), template download, column tip copy, course→subject cascade, import mutation + 2s report poll until completed/failed.
- Match mock layout: back link left + “Tải file mẫu” right; in-page title “Import hàng loạt” + A-33 / 500-row subtitle; yellow tip with info icon; two-column Course | Môn học; dashed dropzone; primary submit disabled until subject + valid file selected.
- Deferred upload: selecting/dropping a file only stages it; upload runs on “Tiến hành tải lên”.
- Client accept `.xlsx` (and `.xls` if already accepted); reject non-spreadsheet and files over 10MB before upload with a clear Vietnamese error.
- Vietnamese copy. Align visuals with existing admin tokens (primary, warning tip, rounded cards).

**Ask First:**
- Changing the API 500-row limit or adding a server-side file-size cap.
- Removing the post-import report section (keep it below the form; not in the mock but required for current workflow).

**Never:**
- Auto-upload on file pick (current behavior).
- Breaking template download or report error table.
- Backend/schema changes for this pass.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Stage file | Subject chosen + .xlsx ≤10MB | Dropzone shows filename; submit enabled | N/A |
| Submit | Click “Tiến hành tải lên” | Calls `adminImportQuestions`; pending copy; then report | Show mutation error |
| No subject | File staged, no subject | Submit disabled | N/A |
| Bad type / >10MB | Drop/pick invalid file | Do not stage; show local error | Local validation msg |
| Drag-drop | Drop .xlsx onto zone | Same as pick | Same validation |
| Course change | Change Course | Clear subject + staged file | N/A |

</frozen-after-approval>

## Code Map

- `apps/admin/src/app/questions/import/page.tsx` -- sole rewrite target
- `apps/admin/src/components/course-editor-form.tsx` -- drag-drop pattern reference
- `apps/admin/src/lib/admin-nav.ts` -- existing shell title/subtitle (keep; may still add in-page title per mock)
- `packages/api-client/src/index.ts` -- `adminImportQuestions` / template download (read-only)
- `apps/api/src/questions/import-questions.service.ts` -- 500-row limit (read-only context)

## Tasks & Acceptance

**Execution:**
- [x] `apps/admin/src/app/questions/import/page.tsx` -- Redesign to mock: header row, title/subtitle, tip banner, 2-col course/subject, drag-drop staging zone, deferred submit button, keep report block; client validate type + 10MB

**Acceptance Criteria:**
- Given the import page, when it loads, then layout matches the mock (title, tip, two selects, dropzone, disabled submit until ready).
- Given a subject and staged .xlsx, when the admin clicks “Tiến hành tải lên”, then the import API runs and the report section updates as before.
- Given an invalid or oversized file, when picked/dropped, then it is rejected client-side with an error and submit stays disabled.
- Given Course changes, when selected, then subject and staged file reset.

## Spec Change Log

## Design Notes

**Deferred upload state:** `selectedFile: File | null`. Dropzone click + drag-drop both set it. Submit: `if (!subjectId || !selectedFile) return; importMutation.mutate(selectedFile)`. Clear staged file after successful start optional; keep filename visible during pending.

**10MB:** Mock-only client guard (`10 * 1024 * 1024`). API still enforces 500 rows.

## Verification

**Commands:**
- `pnpm --filter admin typecheck` -- expected: pass

**Manual checks:**
- `/questions/import`: layout matches mock; drag-drop + button upload works; report still polls; template download works.

## Suggested Review Order

**Layout**

- Mock header, title, tip banner, two-column course/subject card.
  [`page.tsx:137`](../../apps/admin/src/app/questions/import/page.tsx#L137)

**Deferred upload**

- Stage + validate type/size; submit only via button with subjectId lock.
  [`page.tsx:75`](../../apps/admin/src/app/questions/import/page.tsx#L75)

- Drag-drop zone + “Tiến hành tải lên” disabled until ready.
  [`page.tsx:248`](../../apps/admin/src/app/questions/import/page.tsx#L248)

**Preserved report**

- Batch report polling and row-error table remain below the form.
  [`page.tsx:323`](../../apps/admin/src/app/questions/import/page.tsx#L323)
