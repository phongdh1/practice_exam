---
title: 'SePay admin bank dropdown for valid VietQR'
type: 'bugfix'
created: '2026-07-20'
status: 'done'
baseline_commit: '06daf1bf4bb1659cc569ed119471039b73cc9313'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Admins type free-text bank names into SePay merchant config, so VietQR `bank=` often fails SePay’s allowed identifiers and the QR image is wrong/broken.

**Approach:** Replace the free-text bank field with a dropdown loaded from SePay’s official bank list (`https://qr.sepay.vn/banks.json`), store a valid identifier (`short_name` preferred; `bin`/`code` acceptable), and keep generating QR with that value.

## Boundaries & Constraints

**Always:**
- Source bank options from SePay `banks.json` (docs: `code`, `bin`, `short_name`, or `alias`).
- Prefer banks with `supported: true` at the top of the list (still allow selecting others if needed, or filter to supported-only — default: supported-first, include all).
- Persist selected value in existing `bankCode` config field (no schema rename required).
- Show human-readable label in UI (e.g. `TPBank — Ngân hàng TMCP Tiên Phong`).
- Keep account number + account holder fields as today.

**Ask First:**
- Changing stored key shape away from single `bankCode` string (e.g. storing full bank object).

**Never:**
- Hardcode a static bank list that ignores SePay’s `banks.json`.
- Change checkout webhook matching or payment-code format in this story.
- Implement post-payment subject redirect (deferred).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Load banks | Admin opens SePay config | Dropdown populated from banks.json | Show error toast/message if fetch fails; disable save bank until list loads or retry |
| Save bank | Select TPBank (`short_name`) | Stored `bankCode` = `TPBank` (or chosen id) | Validation: bank required when saving SePay bank QR config |
| Existing free-text | Old value not in list | Dropdown shows placeholder / “custom” option preserving value until re-selected | Prompt to re-pick from list |
| QR build | Checkout SePay VietQR | `bank=` query uses stored identifier | Invalid/missing bank → clear API error, no broken silent QR |

</frozen-after-approval>

## Code Map

- `https://qr.sepay.vn/banks.json` — official list (also linked from SePay VietQR docs)
- `apps/admin/src/app/integrations/payments/page.tsx` — replace bank text input with select
- `apps/admin/src/lib/sepay-banks.ts` (new) — fetch/normalize bank options for admin UI
- `apps/api/src/payments/adapters/sepay-vietqr.ts` — already passes `bank` through; optionally validate against known ids
- `apps/api/src/integrations/integration-config.types.ts` — `bankCode` remains the stored field

## Tasks & Acceptance

**Execution:**
- [x] `apps/admin/src/lib/sepay-banks.ts` -- fetch `banks.json`, map to `{ value, label, supported }` (value = `short_name` first, else `code`) -- single source for dropdown
- [x] `apps/admin/src/app/integrations/payments/page.tsx` -- SePay bank field = searchable/select dropdown; save selected `value` as `bankCode` -- prevent free-text typos
- [x] Handle legacy free-text `bankCode` not in list -- show current value + force re-select before save if invalid
- [x] Optional harden: `sepay-vietqr.ts` or admin save validation rejects empty/whitespace bank -- fail closed
- [ ] Manual: pick TPBank, save, checkout QR loads with correct bank branding/params

**Acceptance Criteria:**
- Given SePay config page, when banks.json loads, then admin can only choose a bank from the official list (not free-type a random string as the primary path).
- Given admin selects e.g. TPBank and saves, when checkout builds VietQR, then `bank` query param is a SePay-accepted identifier and the QR image renders correctly.
- Given banks.json fails to load, when admin tries to change bank, then they see a clear error and are not stuck with a silent empty list.
- Given an old free-text bank value, when reopening config, then the UI does not silently pretend it is a valid list selection without user confirmation.

## Spec Change Log

## Design Notes

Store **`short_name`** as `bankCode` (matches SePay examples: `TPBank`, `Vietcombank`). Fallback to `code` if `short_name` missing.

```ts
// value for <option>
bank.short_name || bank.code
// label
`${bank.short_name || bank.code} — ${bank.name}`
```

Fetch client-side from `https://qr.sepay.vn/banks.json` in admin (no API proxy required unless CORS blocks — if CORS fails, add a thin admin GET proxy under integrations).

## Verification

**Commands:**
- Admin typecheck / lint on touched files

**Manual checks:**
- Admin → Payments → Cấu hình cổng → SePay: dropdown lists banks; save TPBank
- Candidate checkout SePay: QR image valid (not broken/wrong bank)
- Confirm QR URL contains `bank=TPBank` (or selected short_name)

## Suggested Review Order

**Bank list source**

- Normalize SePay `banks.json` into select options (`short_name` preferred)
  [`sepay-banks.ts:29`](../../apps/admin/src/lib/sepay-banks.ts#L29)

- Resolve legacy stored codes to canonical option values
  [`sepay-banks.ts:74`](../../apps/admin/src/lib/sepay-banks.ts#L74)

**Admin SePay form**

- Replace free-text bank with list `<select>` + legacy / retry / save gate
  [`payments/page.tsx:141`](../../apps/admin/src/app/integrations/payments/page.tsx#L141)

- Fail closed on empty bank when building VietQR
  [`sepay-vietqr.ts:10`](../../apps/api/src/payments/adapters/sepay-vietqr.ts#L10)

**Tests**

- Empty bank rejected at QR build time
  [`sepay-vietqr.spec.ts:34`](../../apps/api/src/payments/adapters/sepay-vietqr.spec.ts#L34)
