---
title: 'Mock Exam Template Admin UI'
type: 'feature'
created: '2026-07-02'
status: 'draft'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/stories/STORY-42.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** STORY-42 delivered Mock Exam Template CRUD on the API (`admin/mock-exam-templates`), but the admin portal has no UI. Super admins cannot create or approve templates without raw API calls, blocking the subject go-live gate (`0/1 template` on `/subjects`).

**Approach:** Add Catalog-scoped admin pages to list, create, edit (draft/archived only), approve, and archive Mock Exam Templates via existing API endpoints. Wire api-client + shared types, subject filter, and invalidate subject queries after approve so go-live counters refresh.

## Boundaries & Constraints

**Always:**
- Reuse existing admin patterns: `AdminPageShell`, `AdminRoleGate` (`super_admin`), TanStack Query, `adminApi` client.
- Call existing API only — no backend schema or endpoint changes.
- Vietnamese UI labels consistent with `/subjects` and `/courses` pages.
- Approved templates are read-only in UI (API rejects PATCH); show archive action instead.
- Section `weightPercent` values must sum to 100 before save/approve.
- After approve/archive, invalidate `queryKeys.subjects.admin` so go-live template count updates.

**Ask First:**
- Adding fixed-selection section UI with question picker (deferred — see Never).
- Changing RBAC beyond existing `super_admin` gate on API.

**Never:**
- Candidate attempt flow, timer, or scoring UI.
- Fixed-selection mode with question-ID picker in this spec (API supports it; defer to follow-up).
- Multi-section advanced editor (difficulty rules UI, cross-subject sections) — MVP supports 1–N sections with randomized mode, topic tags as comma-separated text, and manual weight inputs.
- Modifying `@practice-exam/ui` `MockExamTemplateList` (candidate-facing).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| List templates | GET with optional `subjectId` | Table: name, subject, status badge, duration, passing %, section count; links to edit | Loading skeleton; empty state message |
| Create draft | Valid form: subject, metadata, ≥1 section (randomized), weights=100 | POST create → redirect to edit or list | Show API error message (e.g. weight invalid) |
| Edit draft | Template status `draft` or `archived` | PATCH update; sections replaced on save | Block save when approved; show API errors |
| Approve | Draft with valid sections + sufficient published pool | POST approve → status `approved`; subjects cache invalidated | Show `INSUFFICIENT_QUESTION_POOL` / weight errors inline |
| Approve blocked | Approved template | No edit button; archive only | N/A |
| Archive | Any non-archived template | POST archive → status `archived` | Show error toast/text |
| Subject deep link | `/mock-exams?subjectId={id}` from subjects page | List pre-filtered to that subject | Invalid subjectId → show all |

</frozen-after-approval>

## Code Map

- `packages/types/src/index.ts` — add `AdminMockExamSectionView`, `AdminMockExamTemplateView`, create/update input types mirroring API DTOs.
- `packages/api-client/src/index.ts` — admin methods: list, get, create, update, approve, archive, preview; add `queryKeys.mockExamTemplates`.
- `apps/admin/src/lib/admin-nav.ts` — route `/mock-exams` under `catalog` active state.
- `apps/admin/src/app/mock-exams/page.tsx` — list + subject filter + approve/archive actions.
- `apps/admin/src/app/mock-exams/new/page.tsx` — create form.
- `apps/admin/src/app/mock-exams/[id]/edit/page.tsx` — edit form (draft/archived).
- `apps/admin/src/lib/mock-exam-template-form.ts` — form defaults, section row helpers, weight-sum validation, DTO mapping.
- `apps/admin/src/components/mock-exam-template-form.tsx` — shared create/edit form component.
- `apps/admin/src/app/subjects/page.tsx` — link "Đề thi thử" per subject row → `/mock-exams?subjectId=…`.
- `apps/api/src/mock-exams/mock-exams-admin.controller.ts` — reference only; endpoints already exist.
- `apps/api/src/mock-exams/mock-exams.service.ts` — reference for approve pool validation and approved-edit block.

## Tasks & Acceptance

**Execution:**
- [ ] `packages/types/src/index.ts` — add admin mock-exam template view + input types exported from package.
- [ ] `packages/api-client/src/index.ts` — add `adminListMockExamTemplates`, `adminGetMockExamTemplate`, `adminCreateMockExamTemplate`, `adminUpdateMockExamTemplate`, `adminApproveMockExamTemplate`, `adminArchiveMockExamTemplate`, `queryKeys.mockExamTemplates`.
- [ ] `apps/admin/src/lib/mock-exam-template-form.ts` — map form state ↔ API DTO; validate weights sum 100; default single randomized section at 100%.
- [ ] `apps/admin/src/components/mock-exam-template-form.tsx` — fields: subject select, name, description, duration, passing %, monthly limit; dynamic section rows (order, questionCount, timeLimit, weightPercent, topicTags); add/remove section; randomized mode only.
- [ ] `apps/admin/src/app/mock-exams/page.tsx` — super_admin list with subject filter (from query param + dropdown), status badges, create link, edit/approve/archive actions.
- [ ] `apps/admin/src/app/mock-exams/new/page.tsx` — create page using shared form; redirect to list on success.
- [ ] `apps/admin/src/app/mock-exams/[id]/edit/page.tsx` — load template, read-only when approved, save when draft/archived.
- [ ] `apps/admin/src/lib/admin-nav.ts` — `/mock-exams` resolves `active: "catalog"`.
- [ ] `apps/admin/src/app/subjects/page.tsx` — add per-row link to filtered mock-exam list.
- [ ] `apps/admin/src/app/subjects/[id]/page.tsx` — add go-live helper link to create mock exam for subject (optional if row link exists).

**Acceptance Criteria:**
- Given a super_admin on `/mock-exams`, when the page loads, then all templates appear with status and subject name.
- Given a draft template with one randomized section (weight 100%) and valid metadata, when saved and approved, then status becomes `approved` and `/subjects` shows `1/1 template` for that subject.
- Given an approved template, when viewing edit page, then fields are read-only and only Archive is available.
- Given insufficient published questions for section pool, when Approve is clicked, then API error message is shown and status stays draft.
- Given `/mock-exams?subjectId=X`, when loaded, then only templates for subject X are shown.

## Spec Change Log

## Design Notes

Default MVP section: one randomized section using template `subjectId`, `sectionOrder: 0`, `weightPercent: 100`, reasonable defaults for `questionCount` (e.g. 50) and `timeLimitMinutes`. Multi-section: user adds rows and distributes weights manually; form shows running total and blocks submit when ≠ 100.

Approve success must call `queryClient.invalidateQueries({ queryKey: queryKeys.subjects.admin })` — this is what unlocks **Kích hoạt** on subjects.

## Verification

**Commands:**
- `pnpm --filter @practice-exam/types build` — expected: clean compile.
- `pnpm --filter @practice-exam/api-client exec tsc --noEmit` — expected: types resolve for new methods.
- `pnpm --filter admin exec tsc --noEmit` — expected: admin app compiles.

**Manual checks:**
- Create draft template for a subject → approve → confirm `/subjects` template counter increments.
- Confirm `/mock-exams` appears in Catalog nav when visiting the page.
