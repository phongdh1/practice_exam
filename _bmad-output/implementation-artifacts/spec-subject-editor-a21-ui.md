---
title: 'Subject Editor A-21 UI (create + edit)'
type: 'feature'
created: '2026-07-14'
status: 'done'
baseline_commit: '3a34b55586402648aa0f50933de638e4aaed153c'
context:
  - '{project-root}/_bmad-output/stitch-html/Subject_Course_Editor_A-21_.html'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Admin create/edit subject pages are flat forms that do not match Subject Editor A-21, while create still needs API fields the mock omits.

**Approach:** Rebuild `/subjects/new` and `/subjects/[id]` with one shared Subject Editor matching A-21 layout/copy, wired to existing subject APIs. Cover, Hot, and performance card are disabled placeholders (no new backend). Keep courseId, study tier, go-live mins, display order, and tags in a secondary section.

## Boundaries & Constraints

**Always:**
- A-21 structure and Vietnamese labels for primary sections; existing admin design tokens.
- One shared editor component; thin page wrappers for role gate + data/mutations.
- Save via `adminCreateSubject` / `adminUpdateSubject` (+ activate/archive when edit visibility changes).
- Preserve edit go-live gating (cannot activate until thresholds met).
- Keep sticky top-bar titles via `resolveAdminTopHeader`; in-content chrome is “Thông tin môn học” + Hủy bỏ / Lưu (no duplicate page H1).
- Cancel → `/subjects` without saving.
- Cover, Hot, and KPI card visible but non-functional (no upload/persist).

**Ask First:**
- New API/schema/upload for cover, Hot, or subscribers.
- Dynamic top-bar breadcrumb “Subject Editor / {name}” needing client context beyond pathname.
- Changing delete rules vs subjects list (confirm; archived subjects).

**Never:**
- Backend work for cover / Hot / subscriber KPIs this pass.
- Redesigning sidebar, subjects list, or Course screens.
- Dropping create-required fields (especially courseId).
- Touching the bulk-upload stash.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Create OK | Valid form + active course | Create; invalidate; go `/subjects` | Show API error; stay |
| Create blocked | No active courses | Submit disabled | N/A |
| Edit fields | Visibility unchanged | PATCH; invalidate; `/subjects` | Show error; stay |
| Edit activate | Public on + go-live OK | Update then activate | Show error; stay |
| Activate blocked | Public on + go-live unmet | Cannot enable / blocked as today | Show go-live progress |
| Edit archive | Public off | Update then archive | Show error; stay |
| Missing id | Unknown id | Not-found message | N/A |
| Delete OK | Confirm on archived | Delete; `/subjects` | Show error; stay |
| Delete cancel | Dismiss confirm | No API call | N/A |
| Placeholders | Cover / Hot / KPI | No network; Hot not persisted | N/A |

</frozen-after-approval>

## Code Map

- `apps/admin/src/app/subjects/new/page.tsx` -- create; local `SubjectForm` today
- `apps/admin/src/app/subjects/[id]/page.tsx` -- edit; duplicated form + visibility/go-live
- `apps/admin/src/app/subjects/page.tsx` -- delete confirm / archived delete precedent
- `apps/admin/src/components/admin-page-shell.tsx` -- content padding only
- `apps/admin/src/lib/admin-nav.ts` -- top-bar titles for subject routes
- `packages/api-client/src/index.ts` -- create/update/activate/archive/delete
- `packages/types/src/index.ts` -- `AdminSubjectView` (no cover/hot/subscribers)
- `_bmad-output/stitch-html/Subject_Course_Editor_A-21_.html` -- layout reference

## Tasks & Acceptance

**Execution:**
- [x] `apps/admin/src/components/subject-editor-form.tsx` -- Shared A-21 form: left identity + package/limits + free-tier note; right cover placeholder, public toggle→visibility, disabled Hot, updatedAt, edit delete, disabled KPI; secondary section for course/code/study tier/go-live/order/tags. Props: mode, state, courses, saving, errors, goLive, callbacks.
- [x] `apps/admin/src/app/subjects/new/page.tsx` -- Use shared editor; keep create mutation + courses query; code editable.
- [x] `apps/admin/src/app/subjects/[id]/page.tsx` -- Use shared editor; keep list load, update/activate/archive, go-live gate; code read-only; delete with list-equivalent confirm → `adminDeleteSubject`.
- [x] `apps/admin/src/lib/admin-nav.ts` -- Optional subtitle tweak for A-21 framing; title stays in top bar.
- [x] Smoke -- Walk I/O matrix create/edit/delete/placeholder cases manually.

**Acceptance Criteria:**
- Given `/subjects/new`, when loaded, then A-21 editor shows identity, package & limits, placeholders, and secondary course fields; submit creates via existing API.
- Given `/subjects/[id]`, when loaded, then fields populate and public toggle matches `visibility`; save follows update/activate/archive + go-live rules.
- Given either route, when Cancel, then `/subjects` with no write.
- Given edit of an archived subject, when Delete confirmed, then deleted and list shown; cancel confirm no-ops.
- Given Cover / Hot / KPI, when used, then no API calls and Hot does not persist.
- Given no active courses on create, when shown, then submit stays disabled.

## Spec Change Log

## Design Notes

Primary ~8/12: identity + pricing. Right ~4/12: cover, visibility, KPI. Put advanced API fields in a secondary card so create stays valid without crowding A-21 hero fields. Public toggle = `visibility` active|archived. Hot disabled with “not available yet” helper.

## Verification

**Commands:**
- `pnpm --filter admin lint` -- expected: pass / no new errors in touched files
- `pnpm --filter admin exec tsc --noEmit` -- expected: types pass

**Manual checks:**
- Create → appears on list; edit name/price/visibility persists; go-live still blocks invalid activate; placeholders inert; edit delete confirm matches list rules

## Suggested Review Order

**Shared A-21 editor**

- Entry point: bento layout, wired public toggle, disabled placeholders
  [`subject-editor-form.tsx:116`](../../apps/admin/src/components/subject-editor-form.tsx#L116)

- Delete uses persisted visibility, not unsaved toggle
  [`subject-editor-form.tsx:142`](../../apps/admin/src/components/subject-editor-form.tsx#L142)

- Advanced API fields kept without crowding A-21 hero
  [`subject-editor-form.tsx:310`](../../apps/admin/src/components/subject-editor-form.tsx#L310)

**Create / edit wiring**

- Create mutation + trim/guard empty code
  [`new/page.tsx:54`](../../apps/admin/src/app/subjects/new/page.tsx#L54)

- One-shot hydrate by subject id; update/activate/archive + delete
  [`[id]/page.tsx:64`](../../apps/admin/src/app/subjects/[id]/page.tsx#L64)

- Delete confirm only for server-archived subjects
  [`[id]/page.tsx:131`](../../apps/admin/src/app/subjects/[id]/page.tsx#L131)

**Top bar**

- A-21 framing subtitles; titles stay in sticky header
  [`admin-nav.ts:104`](../../apps/admin/src/lib/admin-nav.ts#L104)
