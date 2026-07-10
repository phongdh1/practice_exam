---
title: 'Admin-configurable Subject Go-Live Gate'
type: 'feature'
created: '2026-07-02'
status: 'done'
baseline_commit: 'NO_VCS'
context:
  - '{project-root}/_bmad-output/planning-artifacts/epics/epics-Practice_Exam-2026-06-29/stories/STORY-39.md'
  - '{project-root}/_bmad-output/implementation-artifacts/stories/STORY-42.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Subject go-live gate thresholds are hardcoded globally (`200` published questions, `1` approved mock exam template). Admins see `0/200 câu hỏi, 0/1 template` on `/subjects` but cannot change these requirements per subject — blocking staging/dev subjects and preventing policy flexibility.

**Approach:** Persist per-subject go-live requirements on `Subject`, expose them via existing admin subject create/update APIs, use them in `buildGoLiveStatusMap` / activation checks, and add numeric fields to admin subject create/edit forms. Defaults remain 200/1 for backward compatibility.

## Boundaries & Constraints

**Always:**
- Defaults: `minPublishedQuestionsForGoLive = 200`, `minApprovedTemplatesForGoLive = 1` (existing STORY-39 behavior for current subjects).
- Prisma migration backfills existing rows with defaults.
- `goLive.requirements` in API responses reflects the subject's configured values (not global constants).
- Dynamic error message on activation block uses configured thresholds from `details`.
- Admin UI fields on `/subjects/new` and `/subjects/[id]` with Vietnamese labels matching existing go-live display.
- Validation: integers `>= 0`, max 10_000 each; `0` disables that leg of the gate.

**Ask First:**
- Lowering global platform minimum below STORY-39 PRD default for production subjects.
- System-wide default settings (only per-subject in this spec).

**Never:**
- Mock Exam Template admin UI (separate deferred spec).
- Changing what counts toward the gate (still `published` questions and `approved` templates only).
- Allowing activation bypass without meeting configured thresholds.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Create subject | `minPublishedQuestionsForGoLive: 50`, `minApprovedTemplatesForGoLive: 1` | Subject saved; list shows `0/50 câu hỏi, 0/1 template` | DTO validation error if negative or > 10_000 |
| Omit on create | No gate fields | Defaults 200/1 applied | N/A |
| Update thresholds | PATCH with new mins on archived subject | Saved; go-live display updates | Validation errors surfaced in UI |
| Activate with custom gate | 50 published, min=50, 1 approved template, minTemplates=1 | Activation succeeds | N/A |
| Activate blocked | 10 published, min=50 | Activation fails | API `SUBJECT_GO_LIVE_BLOCKED` with dynamic message |
| Zero gate | minPublished=0, minTemplates=0 | `canActivate` true regardless of counts | N/A |
| Existing subjects | Post-migration | All show requirements 200/1 until edited | N/A |

</frozen-after-approval>

## Code Map

- `apps/api/prisma/schema.prisma` — add `minPublishedQuestionsForGoLive`, `minApprovedTemplatesForGoLive` on `Subject`.
- `apps/api/prisma/migrations/*` — migration with defaults 200 and 1.
- `apps/api/src/subjects/subject.constants.ts` — rename constants to `DEFAULT_MIN_PUBLISHED_QUESTIONS_FOR_GO_LIVE`, `DEFAULT_MIN_APPROVED_TEMPLATES_FOR_GO_LIVE`.
- `apps/api/src/subjects/dto/admin-subject.dto.ts` — optional fields on create/update with validation.
- `apps/api/src/subjects/subjects.service.ts` — persist fields; `buildGoLiveStatusMap` loads per-subject mins; dynamic `assertGoLiveGate` message; expose on `AdminSubjectView`.
- `apps/api/src/subjects/subjects.service.spec.ts` — tests for custom thresholds and zero-gate.
- `packages/types/src/index.ts` — add gate fields to `AdminSubjectView` (or document via existing `goLive.requirements` only).
- `packages/api-client/src/index.ts` — extend create/update subject input types.
- `apps/admin/src/app/subjects/new/page.tsx` — gate config inputs (defaults pre-filled 200/1).
- `apps/admin/src/app/subjects/[id]/page.tsx` — gate config inputs bound to subject requirements.
- `apps/admin/src/app/subjects/page.tsx` — display already uses `goLive.requirements` (no change if API updated).

## Tasks & Acceptance

**Execution:**
- [x] `apps/api/prisma/schema.prisma` + migration — add two Int columns with defaults 200/1 on `subjects`.
- [x] `apps/api/src/subjects/subject.constants.ts` — default constants for create fallback.
- [x] `apps/api/src/subjects/dto/admin-subject.dto.ts` — add optional `minPublishedQuestionsForGoLive`, `minApprovedTemplatesForGoLive` (`@Min(0)` `@Max(10000)`).
- [x] `apps/api/src/subjects/subjects.service.ts` — wire create/update; refactor `buildGoLiveStatusMap` to accept subject records with mins; fix hardcoded activate error message.
- [x] `apps/api/src/subjects/subjects.service.spec.ts` — cover custom threshold activation and zero-gate.
- [x] `packages/types/src/index.ts` — add optional gate fields to admin subject types if needed for forms.
- [x] `packages/api-client/src/index.ts` — extend `adminCreateSubject` / `adminUpdateSubject` payloads.
- [x] `apps/admin/src/app/subjects/new/page.tsx` — number inputs: "Tối thiểu câu Published", "Tối thiểu Mock Exam Template đã duyệt".
- [x] `apps/admin/src/app/subjects/[id]/page.tsx` — same fields on edit form; show current progress vs configured mins in go-live banner.

**Acceptance Criteria:**
- Given a new subject with min published = 10 and min templates = 1, when viewing `/subjects`, then the row shows `0/10 câu hỏi, 0/1 template`.
- Given 10 published questions and 1 approved template for that subject, when admin clicks Kích hoạt, then subject becomes active.
- Given an existing subject before edit, when listed, then requirements remain `200/1` until changed.
- Given min published = 0 and min templates = 0, when activating an empty subject, then activation succeeds.

## Spec Change Log

- **2026-07-02 (review loop 1):** PATCH gate check runs only on visibility transition to `active`, using merged DTO mins (`assertGoLiveGateWithThresholds`). Fixed hardcoded `/subjects` tooltip, edit banner labels, and empty number-input coercion to accidental `0`.

## Suggested Review Order

**Gate evaluation**

- Per-subject thresholds replace global constants for activation
  [`subjects.service.ts:408`](../../apps/api/src/subjects/subjects.service.ts#L408)

- Activation asserts merged next mins, not stale DB-only values
  [`subjects.service.ts:187`](../../apps/api/src/subjects/subjects.service.ts#L187)

**Persistence**

- Subject columns with 200/1 defaults for existing rows
  [`schema.prisma:260`](../../apps/api/prisma/schema.prisma#L260)

**Admin UI**

- Create/edit forms expose configurable gate fields
  [`new/page.tsx:182`](../../apps/admin/src/app/subjects/new/page.tsx#L182)

- List row and tooltip reflect per-subject requirements
  [`page.tsx:98`](../../apps/admin/src/app/subjects/page.tsx#L98)

**Tests**

- Custom threshold, zero-gate, and activation coverage
  [`subjects.service.spec.ts:154`](../../apps/api/src/subjects/subjects.service.spec.ts#L154)

## Design Notes

Store gate config on `Subject` (not `SubjectPricing`) — go-live is a catalog readiness rule, not pricing. `buildGoLiveStatusMap` must load subjects first to read per-row mins, then merge with question/template counts.

Form defaults in admin UI: pre-fill 200 and 1 so admins see current platform standard without looking at list display.

## Verification

**Commands:**
- `pnpm --filter api exec prisma migrate dev` — migration applies cleanly.
- `pnpm --filter api test -- subjects.service.spec` — expected: all pass including new threshold tests.
- `pnpm --filter admin exec tsc --noEmit` — expected: admin compiles with new form fields.

**Manual checks:**
- Create subject with min=5/1 → confirm list display → publish 5 questions + approve 1 template → activate succeeds.
