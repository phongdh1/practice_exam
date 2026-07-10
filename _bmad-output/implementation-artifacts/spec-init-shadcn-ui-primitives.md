---
title: 'Init shadcn + scaffold ui/* primitives'
type: 'feature'
created: '2026-06-30'
status: 'done'
baseline_commit: NO_VCS
story_key: '1-4-shared-ui-package'
context:
  - '_bmad-output/planning-artifacts/ux-designs/ux-Practice_Exam-2026-06-29/DESIGN.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-Practice_Exam-2026-06-29/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `@practice-exam/ui` has partial shadcn setup (10 primitives in `src/components/ui/`, `components.json` present) but DESIGN.md lists 16 inherited shadcn components and STORY-4 review flagged primitives are not exported from the package barrel. Downstream apps cannot import standard shadcn building blocks from the shared package.

**Approach:** Finalize shadcn init in `packages/ui`, add the missing DESIGN.md primitives via `shadcn add`, and re-export all `ui/*` components from `src/index.ts` so web, admin, and Zalo apps consume one canonical primitive layer.

## Boundaries & Constraints

**Always:**
- All primitives live in `packages/ui/src/components/ui/` — no duplicate shadcn copies in apps
- Use existing `components.json` (new-york style, lucide icons, CSS variables, neutral base)
- Preserve existing brand tokens in `globals.css` and `tailwind-preset.js`
- Primitives use relative `../../lib/utils` imports (current pattern) so `tsc` build succeeds without path-alias resolution in dist
- Add only DESIGN.md "Inherited from shadcn unchanged" components not yet present

**Ask First:**
- Adding primitives beyond the DESIGN.md inherited list (e.g. Table, DataTable, Command)
- Switching icon library from lucide to Material Symbols for shadcn primitives
- Introducing `react-hook-form` + zod for Form component if not already a workspace dependency

**Never:**
- Re-init shadcn with `-f` in a way that overwrites brand-mapped `globals.css` CSS variables
- Copy shadcn components into `apps/web`, `apps/admin`, or `apps/zalo-mini-app`
- Modify brand-layer components (`subject-card`, `answer-option`, etc.) beyond import-path fixes if needed
- Change Tailwind major version or migrate to Tailwind v4 in this spec

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Barrel export | `import { Button, Sheet, Checkbox } from '@practice-exam/ui'` | Named exports resolve from built `dist/index.js` | `pnpm --filter @practice-exam/ui build` must pass |
| Missing primitive | DESIGN.md lists Sheet; file absent | `sheet.tsx` added under `src/components/ui/` | `shadcn add` installs radix peer deps in `package.json` |
| Existing primitive | `button.tsx` already present | Skip re-add; keep current file unless CLI reports drift | Do not overwrite customized variants |
| Consumer build | Web app imports Dialog from package | Next.js build/typecheck succeeds | Run `pnpm --filter web typecheck` after export |
| CSS variables | App imports `@practice-exam/ui/globals.css` | shadcn semantic tokens (`--primary`, `--radius`) unchanged | Visual regression limited to new components only |

</frozen-after-approval>

## Code Map

- `packages/ui/components.json` — shadcn CLI config; aliases `@/components`, `@/lib/utils`
- `packages/ui/src/components/ui/*.tsx` — 10 existing primitives (button, card, dialog, alert, badge, input, label, select, progress, skeleton)
- `packages/ui/src/index.ts` — barrel; currently exports brand components only, no `ui/*`
- `packages/ui/src/globals.css` — shadcn CSS variables mapped to Practice Exam brand
- `packages/ui/tailwind-preset.js` — DESIGN.md color/typography tokens consumed by apps
- `packages/ui/package.json` — radix + cva deps; may need additions for new primitives
- `packages/ui/tsconfig.json` — `@/*` path alias for shadcn CLI only
- `_bmad-output/planning-artifacts/ux-designs/ux-Practice_Exam-2026-06-29/DESIGN.md` — authoritative inherited component list (line ~241)

## Tasks & Acceptance

**Execution:**
- [x] `packages/ui` — Run `npx shadcn@latest init -d` (no `-f`) to verify CLI recognizes monorepo package; skip if `components.json` valid
- [x] `packages/ui` — `npx shadcn@latest add sheet dropdown-menu toast tabs avatar separator checkbox radio-group form` — adds 8 missing DESIGN.md primitives
- [x] `packages/ui/package.json` — Ensure radix peer dependencies for new components are present after add
- [x] `packages/ui/src/components/ui/` — Verify each new file uses relative `../../lib/utils` import (fix if CLI emits `@/lib/utils`)
- [x] `packages/ui/src/index.ts` — Re-export all `ui/*` primitives (existing 10 + new 8) with their sub-components and variant helpers
- [x] `packages/ui` — Add/update `src/index.test.ts` to assert key primitive exports exist (Button, Sheet, Checkbox, Form)
- [x] `packages/ui` — `pnpm build && pnpm test && pnpm typecheck`

**Acceptance Criteria:**
- Given DESIGN.md inherited shadcn list, when inspecting `packages/ui/src/components/ui/`, then Dialog, Sheet, DropdownMenu, Toast, Tabs, Avatar, Separator, Form, Input, Select, Checkbox, RadioGroup, Progress, Badge, Skeleton, and Alert all exist
- Given the package barrel, when `import { Button, Sheet, Tabs, Checkbox } from '@practice-exam/ui'`, then TypeScript resolves exports without deep import paths
- Given `pnpm --filter @practice-exam/ui build`, when build completes, then `dist/index.d.ts` includes ui primitive exports
- Given existing `globals.css` brand variables, when new primitives render, then primary/success/destructive colors match current DESIGN.md mapping (no regression to default shadcn palette)

## Spec Change Log

## Design Notes

Export pattern — add a dedicated block at end of `index.ts`:

```ts
export { Button, buttonVariants } from "./components/ui/button";
export { Sheet, SheetContent, SheetTrigger } from "./components/ui/sheet";
// ... remaining primitives
```

Prefer explicit named re-exports over `export *` to keep public API stable and tree-shake friendly.

For `form` component: shadcn may pull `@hookform/resolvers` and `react-hook-form`. Add as `dependencies` of `@practice-exam/ui` only if the CLI requires them; do not wire form validation logic in this spec.

Toast requires a `<Toaster />` provider — export `Toaster` and `toast` function; document in Design Notes that apps must mount `<Toaster />` once in root layout (out of scope to wire in apps unless trivial).

## Verification

**Commands:**
- `pnpm --filter @practice-exam/ui build` — expected: clean tsc emit with primitive types in dist
- `pnpm --filter @practice-exam/ui test` — expected: export smoke tests pass
- `pnpm --filter @practice-exam/ui typecheck` — expected: no errors
- `pnpm --filter web typecheck` — expected: no breakage from package export changes (if web imports ui package)

**Manual checks:**
- `components.json` `$schema` and aliases still point to `src/` paths
- No duplicate primitive files introduced outside `packages/ui/src/components/ui/`

## Suggested Review Order

**Package barrel — single import surface for all primitives**

- Consolidated re-exports so apps import shadcn from one package entry point
  [`index.ts:3`](../../packages/ui/src/index.ts#L3)

**New DESIGN.md primitives (8 added)**

- Sheet for mobile paywall / bottom panels per UX spec
  [`sheet.tsx:1`](../../packages/ui/src/components/ui/sheet.tsx#L1)

- Toast stack + imperative API for payment/error feedback
  [`toast.tsx:1`](../../packages/ui/src/components/ui/toast.tsx#L1)

- Toaster mounts the toast viewport; apps must add once at root
  [`toaster.tsx:1`](../../packages/ui/src/components/ui/toaster.tsx#L1)

- Form primitives wrapping react-hook-form for admin/auth flows
  [`form.tsx:1`](../../packages/ui/src/components/ui/form.tsx#L1)

- Dropdown, tabs, avatar, separator, checkbox, radio-group — standard shadcn building blocks
  [`dropdown-menu.tsx:1`](../../packages/ui/src/components/ui/dropdown-menu.tsx#L1)

**Import path + client boundary fixes**

- Relative utils imports so `tsc` dist builds without path-alias rewriting
  [`sheet.tsx:8`](../../packages/ui/src/components/ui/sheet.tsx#L8)

- Toast hook subscription fixed to stable `[]` effect deps
  [`use-toast.ts:177`](../../packages/ui/src/hooks/use-toast.ts#L177)

**Dependencies**

- Radix peers + react-hook-form added by shadcn CLI for new primitives
  [`package.json:27`](../../packages/ui/package.json#L27)

**Verification**

- Smoke tests assert key primitives are exported from barrel
  [`index.test.ts:28`](../../packages/ui/src/index.test.ts#L28)
