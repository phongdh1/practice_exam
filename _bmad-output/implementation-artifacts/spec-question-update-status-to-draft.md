---
title: 'Question update: allow status → draft for all statuses'
type: 'feature'
created: '2026-07-14'
status: 'draft'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `QuestionsService.update` rejects edits for `in_review` and `archived`, and never accepts a status change. Editors cannot return any question to `draft` through the update path; only review reject covers `in_review` → draft, and unpublish goes to `archived` not draft.

**Approach:** Extend the question **update** API so a request can set `status: "draft"` for every current status, with **published** keeping the existing fork-new-draft-version behavior. Wire Admin editor UI so editors can trigger return-to-draft from any status.

## Boundaries & Constraints

**Always:**
- Only `status: "draft"` is allowed on update (no other status writes via this DTO field).
- **published** + return-to-draft / content update continues to use `createDraftVersionFromPublished` (new child draft; published row unchanged).
- **in_review** / **archived** + `status: "draft"` updates the same row to `draft` and clears review assignment fields (`reviewerId`, `assignedAt`, `submittedAt`) where applicable.
- Content-only update (no `status`) keeps today’s gates: draft editable; published forks draft; in_review/archived still blocked for content-only PATCH.
- Record a `contentReview` (or existing audit pattern) when leaving `in_review` via update→draft so editorial history stays consistent with reject.
- Vietnamese user-facing messages for new errors.

**Ask First:**
- Allowing other `status` values on update beyond `draft`.
- Changing unpublish (`published` → `archived`) behavior.
- Requiring a reject-style comment when editors return `in_review` → draft via update.

**Never:**
- In-place demotion of published to draft on the same row.
- Removing or bypassing review reject / unpublish endpoints.
- Changing Candidate-facing practice/study consumers.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Draft content update | status=draft, content fields | Content saved, stays draft | Validation errors as today |
| Draft + status draft | status=draft, `status: "draft"` | No-op on status; content may update | N/A |
| In review → draft | status=in_review, `status: "draft"` | Same row → draft; review fields cleared; review audit recorded | N/A |
| Archived → draft | status=archived, `status: "draft"` | Same row → draft | N/A |
| Published → draft | status=published, `status: "draft"` (optional content) | New child draft via `createDraftVersionFromPublished`; original stays published | N/A |
| In review content-only | status=in_review, no status field | Rejected | `QUESTION_IN_REVIEW` |
| Archived content-only | status=archived, no status field | Rejected | `QUESTION_ARCHIVED` |
| Invalid status value | `status: "published"` etc. | Rejected | Validation / BadRequest |

</frozen-after-approval>

## Code Map

- `apps/api/src/questions/dto/question.dto.ts` -- add optional `status` enum limited to `"draft"`
- `apps/api/src/questions/questions.service.ts` -- `update()`, `createDraftVersionFromPublished()` status→draft branches
- `apps/api/src/questions/questions.service.spec.ts` -- cover I/O matrix status cases (update currently untested)
- `apps/api/src/content/content.service.ts` -- reject/unpublish patterns for audit field clearing (reference only)
- `packages/api-client/src/index.ts` -- type `adminUpdateQuestion` input to allow `status?: "draft"`
- `apps/admin/src/lib/question-editor.ts` -- payload builder support for optional status
- `apps/admin/src/components/question-editor-form.tsx` -- return-to-draft control by status
- `apps/admin/src/app/questions/[id]/edit/page.tsx` -- unlock/`status: draft` mutation; today readOnly for in_review/archived

## Tasks & Acceptance

**Execution:**
- [ ] `apps/api/src/questions/dto/question.dto.ts` -- add optional `@IsEnum(["draft"]) status?: "draft"` on `UpdateQuestionDto`
- [ ] `apps/api/src/questions/questions.service.ts` -- when `dto.status === "draft"`: handle in_review/archived in-place; published via existing fork; draft no-op; content-only path unchanged
- [ ] `apps/api/src/questions/questions.service.spec.ts` -- unit-test I/O matrix rows for status→draft and content-only gates
- [ ] `packages/api-client/src/index.ts` -- document/type update payload `status?: "draft"`
- [ ] `apps/admin/src/lib/question-editor.ts` + `question-editor-form.tsx` + `questions/[id]/edit/page.tsx` -- UI action “Chuyển về nháp” / equivalent that PATCHes `{ status: "draft" }` for in_review, archived, and published (published forks); refresh to resulting draft detail

**Acceptance Criteria:**
- Given an `in_review` question, when admin PATCH update includes `status: "draft"`, then the question is draft and editable again.
- Given an `archived` question, when admin PATCH update includes `status: "draft"`, then the same question is draft.
- Given a `published` question, when admin PATCH update includes `status: "draft"`, then a new draft child is returned and the published original remains published.
- Given `in_review`/`archived` without `status`, when content-only update is sent, then existing errors still apply.
- Given the edit page for in_review/archived/published, when the editor uses return-to-draft, then UI calls update with `status: "draft"` and lands on an editable draft (fork id for published).

## Spec Change Log

## Design Notes

Return-to-draft on **published** must not call unpublish. Prefer the smallest fork path:

```ts
// published + status draft → reuse createDraftVersionFromPublished(existing, authorId, dtoWithoutStatusNecessity)
// in_review/archived + status draft → tx: optional contentReview + update { status: "draft", reviewerId: null, assignedAt: null, submittedAt: null }
```

Content fields may accompany `status: "draft"` on in_review/archived in the same request; apply both in one transaction when present.

## Verification

**Commands:**
- `pnpm --filter api test -- questions.service.spec` -- expected: new update/status→draft cases pass
- `pnpm --filter api exec tsc --noEmit` (or project’s usual api typecheck) -- expected: clean
- `pnpm --filter admin exec tsc --noEmit` -- expected: clean

**Manual checks (if no CLI):**
- Admin edit: in_review → Chuyển về nháp → editable draft
- Admin edit: archived → Chuyển về nháp → editable draft
- Admin edit: published → Chuyển về nháp → redirected/opened to new draft child; original still published in list
