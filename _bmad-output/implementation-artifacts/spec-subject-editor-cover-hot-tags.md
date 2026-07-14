---
title: 'Subject editor: code suggest, cover upload, Hot, tag chips'
type: 'feature'
created: '2026-07-14'
status: 'done'
baseline_commit: 'f48192d1c10ef8fa0d446bc2a1495ac80fe19f92'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/spec-subject-editor-a21-ui.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A-21 subject editor still placeholders cover upload and Hot, lacks usable tag chips, and subject code is only forced uppercase — not suggested from the name. Catalog/list cannot prioritize Hot subjects.

**Approach:** One cohesive create/edit capability: auto-suggest editable uppercase code from name initials; real cover upload via existing local assetStorage + public URL; persist `isHot` and sort Hot first; free-text topic tag chips that auto-create and save as `topicTags`.

## Boundaries & Constraints

**Always:**
- Shared A-21 editor (`subject-editor-form`) + thin create/edit pages; Vietnamese primary labels preserved.
- Code suggest on create: first letter of each whitespace-separated word in name → uppercase Latin (diacritics stripped for the initial); user may edit anytime; stop overwriting once user has manually changed code (or after explicit clear → resumable suggest).
- Edit mode: keep code read-only as today; hydrate cover/Hot/tags from API.
- Cover: jpeg/png/webp ≤2MB via existing `LocalDiskLandingAssetStorage` pattern (+ public URL builder); persist URL on Subject; enable upload UI on new + edit.
- Hot: boolean `isHot` (default false); admin toggle enabled; sort admin + public catalog with `isHot desc` before existing `course.displayOrder` → `displayOrder` → `name`. Do not overload `displayOrder` / reorder endpoint for Hot.
- Tags: chip input (type + Enter / comma); duplicate-insensitive; persist `string[]` on create/update (API already supports `topicTags`).
- Expose `coverImageUrl` + `isHot` on `AdminSubjectView` and catalog items used by web/UI Hot/cover display.

**Ask First:**
- Separate subject-cover upload route vs reusing `POST .../admin/landing-content/assets` (storage reuse OK either way).
- Showing cover on candidate catalog cards if layout needs new media treatment.
- Changing Hot to apply only within a course group (instead of global sort-first).

**Never:**
- KPI / subscriber performance card backend (stays placeholder).
- Free-tier note / Study Tier product changes; redesign sidebar or Course screens.
- New Tag entity / taxonomy tables; cloud blob/S3 (unless Ask First).
- Touching unrelated dirty files (`tsconfig.tsbuildinfo`, `spec-question-update-status-to-draft.md`) or bulk-upload stash.
- Using `displayOrder` or fake `index < featuredCount` as the sole Hot mechanism after this ships.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Code suggest | Create; name `Chứng khoán cơ bản`; code untouched | Code becomes `CKCB` | N/A |
| Code manual | User edits code after suggest | Further name edits do not overwrite code | N/A |
| Cover OK | Valid image uploaded | Preview + `coverImageUrl` sent on save | N/A |
| Cover reject | Wrong type / >2MB | Stay; show error; no URL | API/client message |
| Hot on | Toggle Hot; save | `isHot=true`; subject tops sorted lists | API error; stay |
| Hot off | Clear Hot; save | Normal sort position | API error; stay |
| Tags chip | Type `Rủi ro` + Enter; save | `topicTags` includes `Rủi ro` | N/A |
| Tag dup | Add same chip twice | Single entry | N/A |
| Edit hydrate | Subject has cover/Hot/tags | Controls populated | N/A |

</frozen-after-approval>

## Code Map

- `apps/api/prisma/schema.prisma` -- add `coverImageUrl String?`, `isHot Boolean @default(false)`
- `apps/api/src/subjects/dto/admin-subject.dto.ts` -- create/update fields
- `apps/api/src/subjects/subjects.service.ts` -- persist; `orderBy` isHot first (admin + catalog)
- `apps/api/src/settings/landing-asset.storage.ts` -- storage + URL builder to reuse
- `apps/api/src/settings/admin-landing-content.controller.ts` -- existing upload (or mirror)
- `packages/types/src/index.ts` -- `AdminSubjectView`, `SubjectCatalogItem` (+ cover/hot)
- `packages/api-client/src/index.ts` -- create/update (+ upload helper if needed)
- `apps/admin/src/components/subject-editor-form.tsx` -- suggest, cover upload, Hot, chips
- `apps/admin/src/app/subjects/new/page.tsx` / `[id]/page.tsx` -- wire mutations + hydrate
- `apps/admin/src/app/subjects/page.tsx` -- optional Hot badge on list
- `packages/ui/src/components/subject-catalog-grid.tsx` / `subject-card` -- Hot from `isHot`, not index
- `apps/api/src/subjects/subjects.service.spec.ts` -- sort + create/update edge cases

## Tasks & Acceptance

**Execution:**
- [x] `apps/api/prisma/schema.prisma` (+ migration) -- add `coverImageUrl`, `isHot` -- persistence for cover/Hot
- [x] `apps/api/src/subjects/dto/admin-subject.dto.ts` + `subjects.service.ts` -- accept/persist fields; sort `isHot desc` first on admin + public list/catalog -- API contract
- [x] Upload wire -- reuse landing upload endpoint **or** thin subject-cover endpoint on same storage; return public URL for form -- cover I/O
- [x] `packages/types` + `packages/api-client` -- types + create/update (+ upload client if new route) -- shared contracts
- [x] `apps/admin/src/components/subject-editor-form.tsx` + create/edit pages -- code suggest (create), enable cover upload/preview, Hot toggle, tag chips; submit/hydrate -- A-21 UX
- [x] `packages/ui` catalog card/grid (+ admin list badge if simple) -- honor `isHot` / optional cover URL -- catalog priority visible
- [x] `apps/api/src/subjects/subjects.service.spec.ts` -- cover I/O matrix cases for sort + persist (unit) -- guard regressions

**Acceptance Criteria:**
- Given create with name and empty code, when name typed, then code auto-fills uppercase initials and remains editable without being overwritten after manual edit.
- Given a valid cover file, when uploaded and subject saved, then `coverImageUrl` persists and reloads on edit.
- Given Hot enabled and saved, when admin list or public catalog is fetched, then that subject sorts above non-Hot peers (then existing order keys).
- Given topic chips entered, when saved, then `topicTags` matches the chip set (no silent drop; no separate Tag table).
- Given catalog UI, when Hot subjects exist, then featured styling uses `isHot`, not `index < featuredCount` alone.

## Spec Change Log

## Design Notes

**Code initials:** Whitespace-split name → first Unicode letter of each token → NFD + strip combining marks → uppercase. Example: `Chứng khoán cơ bản` → `CKCB`. Empty name → empty suggest.

**Hot sort:** `[{ isHot: "desc" }, { course: { displayOrder: "asc" } }, { displayOrder: "asc" }, { name: "asc" }]`. Keep reorder API as manual `displayOrder` only.

**Cover:** Upload → `{ url }` → form state → create/update body. Prefer storing URL string on Subject (aligns with question `imageUrls`).

**Catalog featured:** Replace index-based featured with `subject.isHot` (may still cap visual emphasis; Hot flags drive priority).

## Verification

**Commands:**
- `pnpm --filter api test -- subjects.service.spec` -- expected: pass including Hot sort / persist cases
- `pnpm --filter admin exec tsc --noEmit` (or repo equivalent) -- expected: no type errors on editor/client

**Manual checks:**
- Create subject: name → code suggest; upload cover; Hot on; add tag chips; save; reopen edit → all hydrated.
- Public/admin lists: Hot subjects appear before non-Hot with same course/order.
- Invalid cover type/size shows error; no save of bad URL.

## Suggested Review Order

**Schema & Hot sort**

- Persistence fields for cover URL and Hot flag
  [`schema.prisma:256`](../../apps/api/prisma/schema.prisma#L256)

- Shared list order: Hot first, then existing keys
  [`subjects.service.ts:58`](../../apps/api/src/subjects/subjects.service.ts#L58)

**API contract**

- DTO accepts cover + Hot on create/update
  [`admin-subject.dto.ts:56`](../../apps/api/src/subjects/dto/admin-subject.dto.ts#L56)

- Create/update persist and normalize empty cover to null
  [`subjects.service.ts:206`](../../apps/api/src/subjects/subjects.service.ts#L206)

**Admin editor UX**

- Code initials suggest + chip tags + cover upload + Hot toggle
  [`subject-editor-form.tsx:70`](../../apps/admin/src/components/subject-editor-form.tsx#L70)

- Create wires landing asset upload + new payload fields
  [`new/page.tsx:55`](../../apps/admin/src/app/subjects/new/page.tsx#L55)

- Edit hydrates and saves cover/Hot/tags
  [`[id]/page.tsx:65`](../../apps/admin/src/app/subjects/[id]/page.tsx#L65)

**Catalog / list**

- Featured styling driven by `isHot` (capped), not list index
  [`subject-catalog-grid.tsx:81`](../../packages/ui/src/components/subject-catalog-grid.tsx#L81)

- Admin table Hot badge
  [`subjects/page.tsx:211`](../../apps/admin/src/app/subjects/page.tsx#L211)

**Types & tests**

- Shared view/catalog contracts
  [`types/index.ts:62`](../../packages/types/src/index.ts#L62)

- Persist + sort unit guards
  [`subjects.service.spec.ts:330`](../../apps/api/src/subjects/subjects.service.spec.ts#L330)
