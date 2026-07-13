---
title: 'Hide Progress and Account nav for anonymous users'
type: 'feature'
created: '2026-07-13'
status: 'done'
route: 'one-shot'
baseline_commit: '6b66a7bcf0e3f5275e15a767e1102fb612ab0dcf'
---

# Hide Progress and Account nav for anonymous users

## Intent

**Problem:** Anonymous web visitors see "Tiến độ" and "Tài khoản" in the candidate shell navigation even though those sections require authentication; this exposes links to pages they cannot meaningfully use.

**Approach:** Add an optional `hiddenItems` prop to shared candidate nav components and pass `["progress", "account"]` from the web shell layout whenever the session is loading or the user is not authenticated.

## Suggested Review Order

- Web layout derives hidden items from session state
  [`layout.tsx:57`](../../apps/web/src/app/(candidate)/(shell)/layout.tsx#L57)

- Desktop nav filters links via hiddenItems
  [`candidate-top-nav.tsx:42`](../../packages/ui/src/components/candidate-top-nav.tsx#L42)

- Mobile bottom nav filters tabs via hiddenItems
  [`candidate-bottom-nav.tsx:36`](../../packages/ui/src/components/candidate-bottom-nav.tsx#L36)
