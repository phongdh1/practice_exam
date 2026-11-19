---
title: 'Dynamic question answer options'
type: 'feature'
created: '2026-11-19'
status: 'in-review'
baseline_commit: 'adf8c1a32f9304b21cf816a0f42ecbe06adc3217'
context: []
---

<frozen-after-approval reason="User requested implementation of configurable answer counts">

## Intent

**Problem:** Question authoring and Excel import assume A–D, preventing editors from using real questions with five or more alternatives. Existing storage and grading already support lists of string-keyed options.

**Approach:** Let editors add and remove answer alternatives, recognize arbitrary alphabetic option columns during import, and render the actual stored option key throughout candidate views. Keep four initial editor slots for convenience, without imposing four as the maximum. Labels continue A…Z, AA, AB… as needed.

## Boundaries & Constraints

**Always:** Preserve existing saved keys and correct-answer associations when options are removed. Remove the deleted key from selected correct answers. Keep at least two editor slots. Keep true/false limited to A/B. Accept older A–D workbooks and existing questions unchanged. Preserve single-choice and multiple-choice correctness rules, and existing review and draft behavior. Use the actual stored key for answer badges to avoid ordinal relabeling after deletions.

**Ask First:** Any database migration or change to the definition of correct answers.

**Never:** Renumber existing alternatives on deletion, cap ordinary questions at four or six options, change publishing permissions, or change grading rules.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Add | Four editor slots | Add E, then F, continuing through AA | None |
| Remove | B and D selected; remove B | Keep A/C/D and selected D | Existing multiple-choice validation requires another correct answer |
| Minimum | Two slots | Removal disabled | Helper also rejects operation |
| True/false | A/B | Add/remove hidden and blocked | Import rejects nonempty extra options |
| Extended import | A/B/E/AA columns, correct AA | Persist all nonempty options in spreadsheet-label order | Correct key must have option text |
| Optional blanks | Blank E/F in old or new template | Exclude unused options | Blank selected option fails validation |
| Candidate display | Stored A/C/E/AA | Show actual A/C/E/AA labels | No ordinal substitution |

</frozen-after-approval>

## Code Map

- `apps/admin/src/lib/question-editor.ts` — pure editor state transitions and existing payload validation.
- `apps/admin/src/components/question-editor-form.tsx` — answer editing controls, read-only and question-type restrictions.
- `apps/admin/src/app/questions/import/page.tsx` — import instructions.
- `apps/api/src/questions/import-questions.service.ts` — parser, validation, template generator and persistence.
- `packages/ui/src/components/answer-option.tsx` and five callers — shared candidate badges.

## Tasks & Acceptance

**Execution:**
- [x] Add immutable add/remove editor helpers with spreadsheet labels and selected-key cleanup.
- [x] Wire controls into the editor, restricting true/false and read-only states.
- [x] Parse Vietnamese and legacy `option_x` answer columns dynamically; accept bare single letters for compatibility, skip blanks and validate actual keys.
- [x] Include optional E/F template columns and instructions for additional columns; find difficulty dropdown by header.
- [x] Pass stored keys into shared answer badges; support alphabetic rollover for ordinal-only callers.
- [x] Add editor, import, and badge regressions; add Admin Vitest script/dependency and lock entry.
- [x] Run available checks and record verification blockers without retrying rejected test execution.

**Acceptance Criteria:**
- Given a normal choice question, when adding and removing alternatives, then any supported alphabetic count is retained and selected correct answers remain associated with their original keys.
- Given an existing question with more than four alternatives, when opened and saved, then its options and correct keys survive unchanged.
- Given an Excel workbook containing extended option columns, when imported, then all nonempty alternatives persist and matching correct keys are accepted.
- Given an A–D workbook, when imported, then its previous behavior remains available.
- Given read-only or true/false editor state, when viewing the form, then unsupported option-count changes cannot be invoked.

## Spec Change Log

- Review: multi-letter bare headers collide with metadata such as ID/URL/STT. Require explicit prefixes for multi-letter labels while keeping single-letter bare headers compatible. Preserve unlimited prefixed options and spreadsheet ordering.
- Review: removing interior choices can leave C/E as two valid options. Validate actual nonblank option counts during import instead of mandatory A/B for choice questions; retain exact A/B for true/false.

## Design Notes

Stable option keys avoid changing a saved correct answer's meaning. Deleting an interior option can leave gaps such as A/C/D; candidate badges therefore display stored keys. Choice imports require any two nonblank options; true/false retains exact A/B. No database change is necessary because options and correct keys already use JSON lists. New templates provide E/F as optional starter columns; users may add further named columns without changing code.

## Verification

- `pnpm --filter @practice-exam/admin test` — editor add/remove, selection cleanup, rollover, validation, and existing-question preservation.
- `pnpm --filter @practice-exam/api test -- --runInBand import-questions.service.spec.ts` — import/persistence and template regressions.
- `pnpm --filter @practice-exam/ui test` — shared UI tests, including stored labels and rollover.
- Targeted Admin/API/UI typechecks and lint; `git diff --check`.
- Passed: Admin and UI TypeScript checks; `git diff --check`.
- API typecheck reports errors in unchanged test fixtures (auth, content, entitlements, mock exams and subjects); no errors observed in changed import files.
- Admin lint cannot run because ESLint 9 has no flat configuration in this app.
- Unit tests remain unexecuted: Node spawning failed with EPERM; escalation returned `Rejected("rejected by user")`. No further reason was provided.

## Suggested Review Order

- Stable keys and selected-answer cleanup: [question-editor.ts](../../apps/admin/src/lib/question-editor.ts#L50).
- Editor controls: [question-editor-form.tsx](../../apps/admin/src/components/question-editor-form.tsx#L245).
- Dynamic import and template: [import-questions.service.ts](../../apps/api/src/questions/import-questions.service.ts#L532).
- Actual saved-key badges: [answer-option.tsx](../../packages/ui/src/components/answer-option.tsx#L39).
- Regressions: [question-editor.test.ts](../../apps/admin/src/lib/question-editor.test.ts), [import-questions.service.spec.ts](../../apps/api/src/questions/import-questions.service.spec.ts), [answer-option.test.ts](../../packages/ui/src/components/answer-option.test.ts).
