---
title: 'Admin cover image — paste URL in addition to upload'
type: 'feature'
created: '2026-07-23'
status: 'done'
baseline_commit: '8aab6b3f196ceb2c051377306e77a84cb0c6d729'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Course and subject admin editors only set cover via file upload. Editors cannot paste an external image URL for preview and save, even though the API already persists `coverImageUrl` as a string.

**Approach:** Add a URL text field next to existing upload/clear controls on both shared editor forms so create (`/new`) and edit (`/[id]`) can paste a link, preview it, and save — without removing upload.

## Boundaries & Constraints

**Always:**
- Keep existing upload (and course drag-drop) working; URL and upload both write `form.coverImageUrl`.
- Shared forms cover create + edit for courses and subjects.
- Preview `<img>` updates when the URL field changes (same as after upload).
- Clear still sets `coverImageUrl: null` and removes preview.
- Empty/whitespace URL on blur or save normalizes to `null` in the form (parity with course API trim).
- Vietnamese labels (e.g. “Hoặc dán link ảnh”).
- Client-side: reject obviously invalid URLs (failed `URL` parse or non-`http:`/`https:`); show a short inline error; do not block save of a previously valid uploaded URL unless the field was edited to invalid.

**Ask First:**
- Server-side `@IsUrl` / host allowlist (default: leave API as permissive `@IsString`).
- Proxying remote images through our storage (default: store the URL as-is).

**Never:**
- Remove file upload or change landing-asset upload API.
- Require download/re-host of external images.
- Change candidate catalog display beyond using the stored URL already supported.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Paste valid HTTPS URL | `https://cdn.example/cover.jpg` | Preview shows; save persists URL | N/A |
| Upload after URL | Valid file uploaded | Form URL replaced by uploaded asset URL | Existing upload errors |
| Clear | Click clear with URL or upload set | `coverImageUrl` null; preview gone | N/A |
| Empty URL | Clear text / whitespace | Form stores `null` | N/A |
| Invalid URL | `not-a-url` or `ftp://…` | Inline error; do not set invalid value on form | Message in Vietnamese |
| Broken remote image | Valid URL, image 404/CORS | Preview broken-image state OK; URL still savable | Optional `onError` placeholder |
| Edit hydrate | Subject/course has cover URL | Field + preview populated | N/A |

</frozen-after-approval>

## Code Map

- `apps/admin/src/components/course-editor-form.tsx` — course cover UI (upload + new URL field)
- `apps/admin/src/components/subject-editor-form.tsx` — subject cover UI (same)
- `apps/admin/src/app/courses/new/page.tsx` / `courses/[id]/page.tsx` — already send `coverImageUrl` (no change unless helper extracted)
- `apps/admin/src/app/subjects/new/page.tsx` / `subjects/[id]/page.tsx` — same
- `apps/api/src/courses/dto/admin-course.dto.ts` / `subjects/dto/admin-subject.dto.ts` — already accept string URL (read-only unless Ask First)

## Tasks & Acceptance

**Execution:**
- [x] `apps/admin/src/components/course-editor-form.tsx` — add cover URL input bound to `coverImageUrl`; keep upload/clear/preview; validate http(s); Vietnamese helper copy
- [x] `apps/admin/src/components/subject-editor-form.tsx` — same cover URL input pattern as course for consistency
- [x] Manual verify create + edit for course and subject — paste URL, upload override, clear, hydrate
- [x] `apps/admin/src/lib/cover-image-url.ts` — shared http(s) parse helper used by both editors

**Acceptance Criteria:**
- Given admin on course or subject create/edit, when a valid `http(s)` image URL is entered, then preview updates and save persists that URL.
- Given a cover set by URL, when a file is uploaded, then the uploaded asset URL replaces the pasted URL.
- Given a cover is set, when clear is used, then URL field and preview are empty and save clears cover.
- Given an invalid URL string, when entered, then an inline error appears and the invalid value is not kept as the cover.
- Given upload-only workflow, when used without the URL field, then behavior matches today.

## Spec Change Log

## Verification

**Commands:**
- `pnpm --filter admin exec tsc --noEmit` — expected: clean

**Manual checks:**
- `/courses/new`, `/courses/[id]`, `/subjects/new`, `/subjects/[id]`: paste URL → preview → save → reload shows URL.
- Upload still works; clear clears both upload and pasted URL.

## Suggested Review Order

**URL validation**

- Shared http(s) parse: empty → null; reject non-http(s)
  [`cover-image-url.ts:12`](../../apps/admin/src/lib/cover-image-url.ts#L12)

**Course editor**

- Draft/apply/commit + submit blocked while invalid
  [`course-editor-form.tsx:131`](../../apps/admin/src/components/course-editor-form.tsx#L131)

- Paste URL field under cover upload
  [`course-editor-form.tsx:390`](../../apps/admin/src/components/course-editor-form.tsx#L390)

**Subject editor**

- Same cover URL pattern for subjects
  [`subject-editor-form.tsx:242`](../../apps/admin/src/components/subject-editor-form.tsx#L242)

- Subject “Hoặc dán link ảnh” field
  [`subject-editor-form.tsx:653`](../../apps/admin/src/components/subject-editor-form.tsx#L653)
