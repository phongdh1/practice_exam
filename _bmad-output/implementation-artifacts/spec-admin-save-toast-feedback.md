---
title: 'Admin save success/error toast feedback'
type: 'feature'
created: '2026-07-20'
status: 'done'
baseline_commit: '06daf1bf4bb1659cc569ed119471039b73cc9313'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Admin save/API mutations often succeed or fail with no persistent visible feedback (inline text only on some pages, silence on others), so operators cannot tell if a save worked.

**Approach:** Mount shared `<Toaster />` once in the admin app and show success/error toasts on major save mutations across admin, using a thin helper for consistent Vietnamese copy.

## Boundaries & Constraints

**Always:**
- Use existing `@practice-exam/ui` `toast` / `Toaster` (same pattern as practice-flow).
- Mount `<Toaster />` once in `apps/admin/src/app/providers.tsx`.
- Toast both success and failure for write mutations (create/update/delete/save/retry/refund/toggle/verify).
- Prefer Vietnamese short titles; put API `error.message` in `description` when present.
- Keep existing inline/bulk result UIs; toasts are additive, not a full replacement of detailed bulk reports.

**Ask First:**
- Removing or redesigning existing inline `setMessage` / `bulkResult` panels (beyond adding toasts alongside).

**Never:**
- Do not introduce a second toast library (sonner/hot-toast).
- Do not toast pure GET/list/read queries or login form auth (login may keep its own error UI).
- Do not change API contracts or RBAC.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Save OK | Mutation succeeds | Success toast (title e.g. "Đã lưu") | N/A |
| Save fail | API error body | Destructive toast; description = API message when available | No throw swallowed silently |
| Redirect creates | Create then navigate | Success toast still fires before/with redirect | Same error toast on fail |
| Bulk actions | Bulk approve/delete | Toast summarizes outcome; keep existing `bulkResult` UI | Destructive toast on hard failure |

</frozen-after-approval>

## Code Map

- `apps/admin/src/app/providers.tsx` — mount `<Toaster />`
- `apps/admin/src/lib/admin-toast.ts` — `toastApiSuccess` / `toastApiError` helpers (new)
- `packages/ui` — `toast`, `Toaster` already exported
- Mutation sites (wire `onSuccess`/`onError`): integrations payments/zalo/webhooks; settings system/admin-users; landing-content-settings; users/[id]; payments + promo-codes; questions list/edit/new/import; review list/[id]; flags; subjects list/new/[id]; courses list/new/[id]

## Tasks & Acceptance

**Execution:**
- [x] `apps/admin/src/app/providers.tsx` -- mount `<Toaster />` from `@practice-exam/ui` next to QueryClientProvider -- global toast host
- [x] `apps/admin/src/lib/admin-toast.ts` -- add `toastApiSuccess(title, description?)` and `toastApiError(error, fallbackTitle)` -- consistent destructive + VN defaults
- [x] Wire helpers into all major admin `useMutation` save handlers listed in Code Map -- user sees feedback on every write
- [x] Where pages already use `setMessage`, keep message and also toast -- dual feedback OK for this pass
- [ ] Smoke: save SePay merchant config success + force error -- toasts appear

**Acceptance Criteria:**
- Given admin is logged in, when any major save mutation succeeds, then a success toast appears.
- Given a save mutation fails, when the API returns an error, then a destructive toast appears with a useful message.
- Given login or read-only pages, when browsing/listing, then no spurious save toasts fire.
- Given `<Toaster />` is mounted once in providers, when navigating between admin routes, then toasts still render.

## Spec Change Log

## Design Notes

```ts
// apps/admin/src/lib/admin-toast.ts
import { toast } from "@practice-exam/ui";

export function toastApiSuccess(title: string, description?: string) {
  toast({ title, description });
}

export function toastApiError(error: unknown, fallback = "Thao tác thất bại") {
  const description =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : undefined;
  toast({ title: fallback, description, variant: "destructive" });
}
```

Adapt extraction to whatever `adminApi` / React Query throws (often nested `error.message` or response JSON).

## Verification

**Commands:**
- `pnpm --filter @practice-exam/admin typecheck` (or project equivalent) -- no TS errors in touched files

**Manual checks:**
- Admin → Payments → Cấu hình cổng: save OK → success toast; bad payload → error toast
- One silent page (e.g. promo create or refund) → toast on success/fail

## Suggested Review Order

**Toast host + helpers**

- Mount shared `<Toaster />` once for all admin routes
  [`providers.tsx:13`](../../apps/admin/src/app/providers.tsx#L13)

- Thin success/error helpers with API message extraction
  [`admin-toast.ts:4`](../../apps/admin/src/lib/admin-toast.ts#L4)

**Mutation wiring**

- Payments merchant save/test webhook toasts (reference pattern)
  [`payments/page.tsx:96`](../../apps/admin/src/app/integrations/payments/page.tsx#L96)

- Bulk actions: error toast when zero successes
  [`questions/page.tsx:214`](../../apps/admin/src/app/questions/page.tsx#L214)
