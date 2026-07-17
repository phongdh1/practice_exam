---
title: 'Course create/edit screen redesign with cover image'
type: 'feature'
created: '2026-07-17'
status: 'done'
baseline_commit: 'b01079f8d6ec879f26cdcac07a30c245908deb12'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/courses/new` and `/courses/[id]` use a bare single-column form, unlike the polished `/subjects` editor. The new design wants a two-column layout (basic info + cover upload, important-note banner, live card preview), but `Course` has no cover-image field.

**Approach:** Add real `coverImageUrl` support to Course across all layers (Prisma → DTO → service → types → api-client), then build a shared `CourseEditorForm` used by both new and edit screens, mirroring the subjects editor pattern and the provided mock.

## Boundaries & Constraints

**Always:**
- Keep `super_admin` gate, `code`/`name` required, code-uniqueness conflict handling, and content-compliance on name/description.
- Reuse the subjects upload flow: `adminApi.adminUploadLandingAsset(file)` → store returned URL in `coverImageUrl`. Accept JPG/PNG/WebP, client cap 5MB.
- New courses stay `visibility: archived` on create (unchanged). Edit keeps visibility toggle (active/archived) and delete only when `subjectCount === 0`.
- Vietnamese copy. Align visuals with `subject-editor-form.tsx`.
- Migration mirrors `20260714120000_subject_cover_hot` (nullable TEXT column, no data backfill needed).

**Ask First:**
- Any change to course create default visibility, or making `code` read-only in edit.
- Adding a separate "banner" field distinct from cover (mock says "Ảnh bìa & Banner" — treat as ONE cover image unless told otherwise).

**Never:**
- Fake price/enrollment on the course preview card (use only name/code/description/cover).
- Break existing list reorder/activate/archive/delete or the courses list UI.
- Touch subjects editor or unrelated migrations.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Create with cover | valid fields + uploaded cover | POST includes `coverImageUrl`; course saved; redirect `/courses` | Show API error banner |
| Create no cover | valid fields, no image | `coverImageUrl: null`; saves fine | N/A |
| Duplicate code | existing code | 409 `COURSE_CODE_EXISTS` surfaced in form | Inline error banner |
| Bad file | >5MB or non-image | Reject before upload; show message | Local validation msg |
| Edit loads/removes cover | course has `coverImageUrl` | Preview shows image; remove sends `null` on save | N/A |
| Missing course (edit) | bad id | "Không tìm thấy khóa học." | N/A |

</frozen-after-approval>

## Code Map

- `apps/api/prisma/schema.prisma` -- add `coverImageUrl String? @map("cover_image_url")` to `Course`
- `apps/api/prisma/migrations/20260717120000_course_cover_image/migration.sql` -- NEW `ALTER TABLE "courses" ADD COLUMN "cover_image_url" TEXT;`
- `apps/api/src/courses/dto/admin-course.dto.ts` -- add optional `coverImageUrl` to Create + Update DTOs (pattern from subjects DTO)
- `apps/api/src/courses/courses.service.ts` -- persist on create/update; map in `toAdminCourseView`
- `packages/types/src/index.ts` -- add `coverImageUrl: string | null` to `AdminCourseView`
- `packages/api-client/src/index.ts` -- add `coverImageUrl?: string | null` to `adminCreateCourse`/`adminUpdateCourse` inputs
- `apps/admin/src/components/course-editor-form.tsx` -- NEW shared form (basic info, cover upload, note banner, preview, header actions)
- `apps/admin/src/app/courses/new/page.tsx` -- use `CourseEditorForm` (create) + cover upload handler
- `apps/admin/src/app/courses/[id]/page.tsx` -- use `CourseEditorForm` (edit) + visibility + delete
- `apps/admin/src/components/subject-editor-form.tsx` -- pattern reference only (upload/preview/header)

## Tasks & Acceptance

**Execution:**
- [x] `apps/api/prisma/schema.prisma` -- add nullable `coverImageUrl` to Course
- [x] `apps/api/prisma/migrations/20260717120000_course_cover_image/migration.sql` -- create migration adding the column
- [x] `apps/api/src/courses/dto/admin-course.dto.ts` -- add `@IsOptional() @ValidateIf(value!==null) @IsString() coverImageUrl?: string | null` to both DTOs
- [x] `apps/api/src/courses/courses.service.ts` -- write `coverImageUrl` on create (`dto.coverImageUrl ?? null`) and update (spread when defined); include in `toAdminCourseView`
- [x] `packages/types/src/index.ts` -- extend `AdminCourseView` with `coverImageUrl`
- [x] `packages/api-client/src/index.ts` -- extend create/update course input types with `coverImageUrl`
- [x] `apps/admin/src/components/course-editor-form.tsx` -- new shared component per mock (two-column; create vs edit modes; cover upload; note banner; preview card; Hủy + Lưu khóa học header)
- [x] `apps/admin/src/app/courses/new/page.tsx` -- render `CourseEditorForm` create mode with upload handler; keep redirect + invalidate
- [x] `apps/admin/src/app/courses/[id]/page.tsx` -- render `CourseEditorForm` edit mode; preload cover; keep visibility + add delete when `subjectCount === 0`

**Acceptance Criteria:**
- Given the new-course screen, when it renders, then it matches the mock: basic-info card, cover upload card, "LƯU Ý QUAN TRỌNG" banner, and live "Xem trước thẻ khóa học" preview.
- Given a valid form with an uploaded cover, when saved, then the course persists `coverImageUrl` and appears after redirect.
- Given the edit screen for a course with a cover, when it loads, then the current cover shows and can be replaced or removed.
- Given a duplicate code, when saved, then the 409 message is shown without losing form state.
- Given no cover, when saved, then `coverImageUrl` is null and no error occurs.

## Spec Change Log

## Design Notes

**Cover = one image.** Treat "Ảnh bìa & Banner" as a single `coverImageUrl` (16:9). Preview card renders cover (or placeholder), title, and code — no price/enrollment. Service update uses `...(dto.coverImageUrl !== undefined && { coverImageUrl: dto.coverImageUrl })`; create uses `dto.coverImageUrl ?? null`. Form props mirror `SubjectEditorForm` (mode, form, saving, error, uploadingCover, coverUploadError, onChange, onUploadCover, onSubmit, onDelete?, persistedVisibility?). Code editable in both modes (API allows).

## Verification

**Commands:**
- `pnpm --filter @practice-exam/types build` -- expected: pass (or typecheck)
- `pnpm --filter api typecheck` -- expected: pass
- `pnpm --filter admin typecheck` -- expected: pass
- `npx prisma migrate status` (in `apps/api`) -- expected: migration recognized (DB apply optional locally)

**Manual checks:**
- `/courses/new`: layout matches mock; upload → preview updates; save persists cover.
- `/courses/[id]`: existing cover loads; replace/remove works; delete guarded by subjectCount.

## Suggested Review Order

**UI entry**

- Shared editor layout matches the mock (info, cover, notes, preview).
  [`course-editor-form.tsx:83`](../../apps/admin/src/components/course-editor-form.tsx#L83)

- Create page wires upload + POST with `coverImageUrl`.
  [`new/page.tsx:40`](../../apps/admin/src/app/courses/new/page.tsx#L40)

- Edit hydrates once, supports visibility + guarded delete.
  [`[id]/page.tsx:49`](../../apps/admin/src/app/courses/[id]/page.tsx#L49)

**Persistence**

- Normalize blank cover URLs; trim code/name on write.
  [`courses.service.ts:13`](../../apps/api/src/courses/courses.service.ts#L13)

- Create/Update DTOs accept optional nullable `coverImageUrl`.
  [`admin-course.dto.ts:30`](../../apps/api/src/courses/dto/admin-course.dto.ts#L30)

- Prisma Course column + migration.
  [`schema.prisma:238`](../../apps/api/prisma/schema.prisma#L238)

**Contracts**

- `AdminCourseView` exposes `coverImageUrl`.
  [`index.ts:310`](../../packages/types/src/index.ts#L310)
