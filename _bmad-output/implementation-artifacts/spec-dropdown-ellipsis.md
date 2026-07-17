---
title: 'Ellipsis long labels on closed dropdown controls'
type: 'chore'
created: '2026-07-17'
status: 'done'
route: 'one-shot'
---

# Ellipsis long labels on closed dropdown controls

## Intent

**Problem:** Long Course/Subject (and other) labels overflow closed dropdown controls in admin, and the shared Radix Select trigger could clip awkwardly in flex layouts.

**Approach:** Apply closed-value ellipsis to all admin native `<select>`s via `globals.css`, and harden shared `SelectTrigger` truncation (`min-w-0` + truncate on the value span). Open-menu option ellipsis remains out of scope.

## Suggested Review Order

**Admin native selects**

- Global closed-select ellipsis + flex shrink (`min-width: 0`).
  [`globals.css:5`](../../apps/admin/src/app/globals.css#L5)

**Shared Radix Select**

- Trigger value truncates; chevron does not shrink.
  [`select.tsx:19`](../../packages/ui/src/components/ui/select.tsx#L19)
