---
title: 'Fix admin cover image preview for external URLs'
type: 'bugfix'
created: '2026-07-23'
status: 'done'
route: 'one-shot'
---

# Fix admin cover image preview for external URLs

## Intent

**Problem:** Pasted live cover image URLs validated and saved, but the admin preview often showed a blank/broken area — commonly because CDNs block hotlinking via `Referer`, and failure was silent under the upload overlay.

**Approach:** Introduce a shared `CoverImagePreview` with `referrerPolicy="no-referrer"`, remount-on-src-change, explicit broken-state messaging, and a dedicated under-URL preview on course/subject editors (lighter overlay on the upload zone).

## Suggested Review Order

**Shared preview**

- Hotlink-tolerant img + broken-state alert
  [`cover-image-preview.tsx:18`](../../apps/admin/src/components/cover-image-preview.tsx#L18)

**Editors**

- Course drop zone + under-URL + card previews use CoverImagePreview
  [`course-editor-form.tsx:353`](../../apps/admin/src/components/course-editor-form.tsx#L353)

- Subject under-URL dedicated preview
  [`subject-editor-form.tsx:685`](../../apps/admin/src/components/subject-editor-form.tsx#L685)
