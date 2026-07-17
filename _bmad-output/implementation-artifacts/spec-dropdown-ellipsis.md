---
title: 'Ellipsis long labels on dropdown controls'
type: 'chore'
created: '2026-07-17'
status: 'done'
route: 'one-shot'
---

# Ellipsis long labels on dropdown controls

## Intent

**Problem:** Long Course/Subject (and other) labels overflow dropdown controls in admin, including closed controls and custom open-menu items.

**Approach:** Apply ellipsis to admin native `<select>` closed values and best-effort native `<option>`s, then harden shared Radix `SelectTrigger` and `SelectItem` truncation. Native open option menus remain browser/OS-controlled, so full reliability there requires a custom select.

## Suggested Review Order

**Admin native selects**

- Global closed-select ellipsis + best-effort option truncation.
  [`globals.css:5`](../../apps/admin/src/app/globals.css#L5)

**Shared Radix Select**

- Trigger value truncates; chevron does not shrink.
  [`select.tsx:19`](../../packages/ui/src/components/ui/select.tsx#L19)

- Open-menu item text truncates before the check indicator.
  [`select.tsx:131`](../../packages/ui/src/components/ui/select.tsx#L131)
